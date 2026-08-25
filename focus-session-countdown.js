const assertDuration = (seconds) => {
  if (!Number.isInteger(seconds) || seconds <= 0) {
    throw new RangeError("Focus session duration must be a positive whole number of seconds.");
  }
};

export const formatFocusCountdown = (seconds) => {
  if (!Number.isInteger(seconds) || seconds < 0) {
    throw new RangeError("Countdown seconds must be a non-negative whole number.");
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

export class FocusSessionCountdown {
  #clearInterval;

  #deadline = null;

  #intervalId = null;

  #now;

  #onComplete;

  #onTick;

  #remainingSeconds = null;

  #setInterval;

  constructor({
    onTick,
    onComplete,
    now = Date.now,
    setIntervalFn = setInterval,
    clearIntervalFn = clearInterval,
  }) {
    if (typeof onTick !== "function" || typeof onComplete !== "function") {
      throw new TypeError("Countdown callbacks must be functions.");
    }

    this.#onTick = onTick;
    this.#onComplete = onComplete;
    this.#now = now;
    this.#setInterval = setIntervalFn;
    this.#clearInterval = clearIntervalFn;
  }

  get isRunning() {
    return this.#intervalId !== null;
  }

  start(seconds) {
    assertDuration(seconds);
    this.stop();

    this.#remainingSeconds = seconds;
    this.#deadline = this.#now() + seconds * 1000;
    this.#onTick(this.#remainingSeconds);
    this.#intervalId = this.#setInterval(() => this.#advance(), 1000);
  }

  stop() {
    if (this.#intervalId !== null) {
      this.#clearInterval(this.#intervalId);
    }

    this.#intervalId = null;
    this.#deadline = null;
    this.#remainingSeconds = null;
  }

  #advance() {
    if (this.#intervalId === null) {
      return;
    }

    const remainingSeconds = Math.max(
      0,
      Math.ceil((this.#deadline - this.#now()) / 1000),
    );

    if (remainingSeconds !== this.#remainingSeconds) {
      this.#remainingSeconds = remainingSeconds;
      this.#onTick(remainingSeconds);
    }

    if (remainingSeconds === 0) {
      this.stop();
      this.#onComplete();
    }
  }
}
