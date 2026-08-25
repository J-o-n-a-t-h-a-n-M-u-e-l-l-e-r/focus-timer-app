const modal = document.querySelector("#timer-modal");
const openTimerButton = document.querySelector("#open-timer");
const durationButtons = document.querySelectorAll("[data-minutes]");
const timerReadout = document.querySelector("#timer-readout");
const startTimerButton = document.querySelector("#start-timer");

let selectedMinutes = 25;
let timerId;

openTimerButton.addEventListener("click", () => modal.showModal());

durationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedMinutes = Number(button.dataset.minutes);
    durationButtons.forEach((option) =>
      option.classList.toggle("selected", option === button)
    );
    timerReadout.textContent = formatTime(selectedMinutes * 60);
  });
});

startTimerButton.addEventListener("click", () => {
  clearInterval(timerId);
  let remainingSeconds = selectedMinutes * 60;
  startTimerButton.disabled = true;
  timerReadout.textContent = formatTime(remainingSeconds);

  timerId = setInterval(() => {
    remainingSeconds -= 1;
    timerReadout.textContent = formatTime(remainingSeconds);

    if (remainingSeconds === 0) {
      clearInterval(timerId);
      startTimerButton.disabled = false;
      startTimerButton.textContent = "Session complete";
    }
  }, 1000);
});

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
