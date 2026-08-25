export const FOCUS_DURATION_OPTIONS = Object.freeze([15, 25, 45]);
export const DEFAULT_FOCUS_DURATION = 25;

const durationLabel = (minutes) => `${minutes} minutes`;

const isFocusDuration = (minutes) =>
  FOCUS_DURATION_OPTIONS.includes(Number(minutes));

const assertFocusDuration = (minutes) => {
  if (!isFocusDuration(minutes)) {
    throw new RangeError(
      `Focus duration must be one of: ${FOCUS_DURATION_OPTIONS.join(", ")}.`,
    );
  }
};

let selectorId = 0;

export class FocusDurationSelector extends HTMLElement {
  #radioName = `focus-duration-${++selectorId}`;

  #minutes = DEFAULT_FOCUS_DURATION;

  connectedCallback() {
    const configuredDuration = this.getAttribute("value");

    if (configuredDuration !== null) {
      assertFocusDuration(configuredDuration);
      this.#minutes = Number(configuredDuration);
    }

    this.#render();
  }

  get value() {
    return this.#minutes;
  }

  set value(minutes) {
    assertFocusDuration(minutes);
    this.#minutes = Number(minutes);
    this.setAttribute("value", String(this.#minutes));

    if (this.isConnected) {
      this.#render();
    }
  }

  reset() {
    this.value = DEFAULT_FOCUS_DURATION;
  }

  #render() {
    this.replaceChildren();

    const fieldset = document.createElement("fieldset");
    fieldset.className = "focus-duration-selector";

    const legend = document.createElement("legend");
    legend.textContent = "Focus length";
    fieldset.append(legend);

    const options = document.createElement("div");
    options.className = "focus-duration-options";

    for (const minutes of FOCUS_DURATION_OPTIONS) {
      const option = document.createElement("div");
      option.className = "focus-duration-option";

      const input = document.createElement("input");
      const inputId = `${this.#radioName}-${minutes}`;
      input.type = "radio";
      input.id = inputId;
      input.name = this.#radioName;
      input.value = String(minutes);
      input.checked = minutes === this.#minutes;

      const label = document.createElement("label");
      label.htmlFor = inputId;
      label.textContent = durationLabel(minutes);

      option.append(input, label);
      options.append(option);
    }

    fieldset.append(options);
    fieldset.addEventListener("change", (event) => {
      const input = event.target;

      if (!(input instanceof HTMLInputElement) || input.name !== this.#radioName) {
        return;
      }

      this.#minutes = Number(input.value);
      this.setAttribute("value", String(this.#minutes));
      this.dispatchEvent(
        new CustomEvent("focus-duration-change", {
          bubbles: true,
          composed: true,
          detail: {
            minutes: this.#minutes,
            seconds: this.#minutes * 60,
          },
        }),
      );
    });

    this.append(fieldset);
  }
}

export const createFocusDurationSelector = ({
  defaultMinutes = DEFAULT_FOCUS_DURATION,
} = {}) => {
  assertFocusDuration(defaultMinutes);

  const selector = document.createElement("focus-duration-selector");
  selector.value = Number(defaultMinutes);
  return selector;
};

export const mountFocusDurationSelector = (container, options) => {
  if (!(container instanceof Element)) {
    throw new TypeError("A DOM element is required to mount the duration selector.");
  }

  const selector = createFocusDurationSelector(options);
  container.replaceChildren(selector);
  return selector;
};

if (!customElements.get("focus-duration-selector")) {
  customElements.define("focus-duration-selector", FocusDurationSelector);
}
