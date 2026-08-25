import assert from "node:assert/strict";
import test from "node:test";

import {
  FocusSessionCountdown,
  formatFocusCountdown,
} from "../focus-session-countdown.js";

const createClock = () => {
  let now = 0;
  let nextIntervalId = 0;
  const intervals = new Map();
  const cleared = [];

  return {
    clearIntervalFn: (id) => {
      cleared.push(id);
      intervals.delete(id);
    },
    cleared,
    now: () => now,
    setIntervalFn: (callback) => {
      const id = ++nextIntervalId;
      intervals.set(id, callback);
      return id;
    },
    tick: (id, milliseconds) => {
      now += milliseconds;
      intervals.get(id)?.();
    },
  };
};

test("counts down from the selected duration and completes at zero", () => {
  const clock = createClock();
  const ticks = [];
  let completions = 0;
  const countdown = new FocusSessionCountdown({
    onTick: (seconds) => ticks.push(seconds),
    onComplete: () => {
      completions += 1;
    },
    now: clock.now,
    setIntervalFn: clock.setIntervalFn,
    clearIntervalFn: clock.clearIntervalFn,
  });

  countdown.start(3);
  clock.tick(1, 1000);
  clock.tick(1, 1000);
  clock.tick(1, 1000);

  assert.deepEqual(ticks, [3, 2, 1, 0]);
  assert.equal(completions, 1);
  assert.equal(countdown.isRunning, false);
  assert.deepEqual(clock.cleared, [1]);
});

test("starting a new session clears the existing countdown", () => {
  const clock = createClock();
  const ticks = [];
  const countdown = new FocusSessionCountdown({
    onTick: (seconds) => ticks.push(seconds),
    onComplete: () => {},
    now: clock.now,
    setIntervalFn: clock.setIntervalFn,
    clearIntervalFn: clock.clearIntervalFn,
  });

  countdown.start(60);
  countdown.start(120);

  assert.deepEqual(ticks, [60, 120]);
  assert.deepEqual(clock.cleared, [1]);
  assert.equal(countdown.isRunning, true);
});

test("formats timer values as minutes and seconds", () => {
  assert.equal(formatFocusCountdown(0), "0:00");
  assert.equal(formatFocusCountdown(65), "1:05");
  assert.equal(formatFocusCountdown(2700), "45:00");
});
