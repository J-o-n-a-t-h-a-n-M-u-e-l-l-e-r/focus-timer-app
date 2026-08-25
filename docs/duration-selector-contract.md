# Focus duration selector contract

Import the selector before adding it to the timer setup modal:

```js
import {
  createFocusDurationSelector,
} from "./focus-duration-selector.js";

const durationSelector = createFocusDurationSelector();
modalContent.append(durationSelector);
```

The selector uses native radio buttons and defaults to **25 minutes**. Its
`value` property is the selected duration in minutes. `reset()` returns the
control to the 25-minute default when the setup is opened for a new session.

```js
durationSelector.reset();

startButton.addEventListener("click", () => {
  startSession(durationSelector.value * 60);
});
```

The selector also emits a bubbling `focus-duration-change` event after a user
chooses an option. The event detail provides both units:

```js
modalContent.addEventListener("focus-duration-change", ({ detail }) => {
  // detail.minutes is 15, 25, or 45.
  // detail.seconds is 900, 1500, or 2700.
});
```

Only `15`, `25`, and `45` are accepted. Assigning another value to `value`, or
passing another `defaultMinutes` to `createFocusDurationSelector`, throws a
`RangeError`. The modal shell should own when the selector is inserted and
when it resets; the countdown layer should read `value` at session start.
