# Focus duration selector contract

Import the selector before adding it to the timer setup modal. The modal shell
provides `#focus-timer-duration-options` (also
`[data-focus-timer-duration-controls]`) as the only mount point:

```js
import {
  mountFocusDurationSelector,
} from "./focus-duration-selector.js";

const durationContainer = document.querySelector(
  "[data-focus-timer-duration-controls]",
);
const durationSelector = mountFocusDurationSelector(durationContainer);
```

The selector uses native radio buttons and defaults to **25 minutes**. Its
`value` property is the selected duration in minutes. `reset()` returns the
control to the 25-minute default when the setup is opened for a new session.

```js
const startButton = document.querySelector("[data-focus-timer-start]");
const status = document.querySelector("#focus-timer-status");

function showSelectedDuration(minutes) {
  startButton.disabled = false;
  status.textContent = `${minutes}-minute focus session ready.`;
}

function resetTimerSetup() {
  durationSelector.reset();
  showSelectedDuration(durationSelector.value);
}

resetTimerSetup();

startButton.addEventListener("click", () => {
  startSession(durationSelector.value * 60);
});
```

The selector also emits a bubbling `focus-duration-change` event after a user
chooses an option. The event detail provides both units:

```js
durationContainer.addEventListener("focus-duration-change", ({ detail }) => {
  showSelectedDuration(detail.minutes);
  // detail.seconds is 900, 1500, or 2700 for countdown initialization.
});
```

Only `15`, `25`, and `45` are accepted. Assigning another value to `value`, or
passing another `defaultMinutes` to `mountFocusDurationSelector`, throws a
`RangeError`. The modal shell should own when the selector is inserted and
when it resets; the countdown layer should read `value` at session start from
`#start-focus-session` (also `[data-focus-timer-start]`).
