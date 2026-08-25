const openFocusTimerButton = document.querySelector("#open-focus-timer");
const focusTimerModal = document.querySelector("#focus-timer-modal");
const closeFocusTimerButton = focusTimerModal.querySelector(".icon-button");
let modalInvoker = null;

function closeFocusTimerModal() {
  if (focusTimerModal.open) {
    focusTimerModal.close();
  }
}

openFocusTimerButton.addEventListener("click", () => {
  modalInvoker = openFocusTimerButton;
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
