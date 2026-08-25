import assert from "node:assert/strict";
import test from "node:test";

class FakeElement {
  #listeners = new Map();

  attributes = new Map();

  children = [];

  disabled = false;

  focusCalls = 0;

  isConnected = false;

  textContent = "";

  addEventListener(type, listener) {
    const listeners = this.#listeners.get(type) ?? [];

    listeners.push(listener);
    this.#listeners.set(type, listeners);
  }

  append(...children) {
    this.children.push(...children);
  }

  focus() {
    this.focusCalls += 1;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  replaceChildren(...children) {
    this.children = children;
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  trigger(type, event = {}) {
    for (const listener of this.#listeners.get(type) ?? []) {
      listener({ target: this, ...event });
    }
  }
}

class FakeDialog extends FakeElement {
  open = false;

  #elements;

  constructor(elements) {
    super();
    this.#elements = elements;
  }

  close() {
    if (!this.open) {
      return;
    }

    this.open = false;
    this.trigger("close");
  }

  querySelector(selector) {
    return this.#elements.get(selector) ?? null;
  }

  showModal() {
    this.open = true;
  }
}

const originalGlobals = {
  DateNow: Date.now,
  Element: globalThis.Element,
  HTMLElement: globalThis.HTMLElement,
  clearInterval: globalThis.clearInterval,
  customElements: globalThis.customElements,
  document: globalThis.document,
  setInterval: globalThis.setInterval,
};
const intervals = new Map();
const clearedIntervals = [];
let intervalId = 0;
let now = 0;

Date.now = () => now;
globalThis.Element = FakeElement;
globalThis.HTMLElement = FakeElement;
globalThis.clearInterval = (id) => {
  clearedIntervals.push(id);
  intervals.delete(id);
};
globalThis.customElements = {
  definitions: new Map(),
  define(name, constructor) {
    this.definitions.set(name, constructor);
  },
  get(name) {
    return this.definitions.get(name);
  },
};
globalThis.setInterval = (callback) => {
  const id = ++intervalId;

  intervals.set(id, callback);
  return id;
};

const openFocusTimerButton = new FakeElement();
const closeFocusTimerButton = new FakeElement();
const durationOptions = new FakeElement();
const startFocusSessionButton = new FakeElement();
const startFocusSessionHelp = new FakeElement();
const timerStatus = new FakeElement();
const sessionStatus = new FakeElement();
const sessionCountdown = new FakeElement();
const focusTimerModal = new FakeDialog(
  new Map([[".icon-button", closeFocusTimerButton]]),
);
const elements = new Map([
  ["#open-focus-timer", openFocusTimerButton],
  ["#focus-timer-modal", focusTimerModal],
  ["#focus-timer-duration-options", durationOptions],
  ["#start-focus-session", startFocusSessionButton],
  ["#focus-timer-start-help", startFocusSessionHelp],
  ["#focus-timer-status", timerStatus],
  ["#focus-session-status", sessionStatus],
  ["#focus-session-countdown", sessionCountdown],
]);

globalThis.document = {
  createElement: (name) => {
    const CustomElement = globalThis.customElements.get(name);

    return CustomElement ? new CustomElement() : new FakeElement();
  },
  querySelector: (selector) => elements.get(selector) ?? null,
};

await import(`../focus-timer-modal.js?test=${Date.now()}`);

test.after(() => {
  Date.now = originalGlobals.DateNow;
  globalThis.Element = originalGlobals.Element;
  globalThis.HTMLElement = originalGlobals.HTMLElement;
  globalThis.clearInterval = originalGlobals.clearInterval;
  globalThis.customElements = originalGlobals.customElements;
  globalThis.document = originalGlobals.document;
  globalThis.setInterval = originalGlobals.setInterval;
});

test("starts the selected dashboard focus session and replaces an active session", () => {
  openFocusTimerButton.trigger("click");

  assert.equal(focusTimerModal.open, true);
  assert.equal(closeFocusTimerButton.focusCalls, 1);
  assert.equal(startFocusSessionButton.disabled, false);
  assert.equal(startFocusSessionHelp.textContent, "Ready for a 25-minute focus session.");

  durationOptions.children[0].value = 45;
  durationOptions.trigger("focus-duration-change", {
    detail: { minutes: 45 },
  });
  startFocusSessionButton.trigger("click");

  assert.equal(focusTimerModal.open, false);
  assert.equal(openFocusTimerButton.focusCalls, 1);
  assert.equal(sessionCountdown.textContent, "45:00");
  assert.equal(sessionCountdown.attributes.get("aria-label"), "45:00 remaining");
  assert.equal(
    sessionStatus.textContent,
    "Focus session started. 45:00 remaining.",
  );

  openFocusTimerButton.trigger("click");
  durationOptions.children[0].value = 15;
  durationOptions.trigger("focus-duration-change", {
    detail: { minutes: 15 },
  });
  startFocusSessionButton.trigger("click");

  assert.deepEqual(clearedIntervals, [1]);
  assert.equal(sessionCountdown.textContent, "15:00");
  assert.equal(intervals.has(1), false);
  assert.equal(intervals.has(2), true);

  now += 15 * 60 * 1000;
  intervals.get(2)();

  assert.equal(sessionCountdown.textContent, "0:00");
  assert.equal(sessionCountdown.attributes.get("aria-label"), "Focus session complete.");
  assert.equal(sessionStatus.textContent, "Focus session complete. Nice work.");
  assert.equal(intervals.has(2), false);
});
