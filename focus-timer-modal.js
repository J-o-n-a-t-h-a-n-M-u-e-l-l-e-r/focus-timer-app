import { mountFocusDurationSelector } from "./focus-duration-selector.js";
import {
  FocusSessionCountdown,
  formatFocusCountdown,
} from "./focus-session-countdown.js";

const openFocusTimerButton = document.querySelector("#open-focus-timer");
const focusTimerModal = document.querySelector("#focus-timer-modal");
const closeFocusTimerButton = focusTimerModal.querySelector(".icon-button");
const durationOptions = document.querySelector("#focus-timer-duration-options");
const startFocusSessionButton = document.querySelector("#start-focus-session");
const startFocusSessionHelp = document.querySelector("#focus-timer-start-help");
const timerStatus = document.querySelector("#focus-timer-status");
const sessionStatus = document.querySelector("#focus-session-status");
const sessionCountdown = document.querySelector("#focus-session-countdown");
const durationSelector = mountFocusDurationSelector(durationOptions);
let modalInvoker = null;

function closeFocusTimerModal() {
  if (focusTimerModal.open) {
    focusTimerModal.close();
  }
}

function setSetupStatus(message) {
  timerStatus.textContent = message;
}

function setSessionStatus(message) {
  setSetupStatus(message);
  sessionStatus.textContent = message;
}

function renderCountdown(seconds) {
  sessionCountdown.textContent = formatFocusCountdown(seconds);
  sessionCountdown.setAttribute(
    "aria-label",
    `${formatFocusCountdown(seconds)} remaining`,
  );
}

function updateStartAction(minutes = durationSelector.value) {

  startFocusSessionButton.disabled = false;
  startFocusSessionHelp.textContent = `Ready for a ${minutes}-minute focus session.`;
  setSetupStatus(`${minutes}-minute focus session selected.`);
}

const countdown = new FocusSessionCountdown({
  onTick: renderCountdown,
  onComplete: () => {
    sessionCountdown.textContent = "";
    sessionCountdown.removeAttribute("aria-label");
    setSessionStatus("Focus session complete. Nice work.");
  },
});

updateStartAction();

openFocusTimerButton.addEventListener("click", () => {
  modalInvoker = openFocusTimerButton;
  durationSelector.reset();
  updateStartAction();
  focusTimerModal.showModal();
  closeFocusTimerButton.focus();
});

focusTimerModal.addEventListener("click", (event) => {
  if (event.target === focusTimerModal) {
    closeFocusTimerModal();
  }
});

focusTimerModal.addEventListener("close", () => {
  modalInvoker?.focus();
  modalInvoker = null;
});

durationOptions.addEventListener("focus-duration-change", ({ detail }) => {
  updateStartAction(detail.minutes);
});

startFocusSessionButton.addEventListener("click", () => {
  const minutes = durationSelector.value;

  countdown.start(minutes * 60);
  setSessionStatus(
    `Focus session started. ${formatFocusCountdown(minutes * 60)} remaining.`,
  );
  closeFocusTimerModal();
});
