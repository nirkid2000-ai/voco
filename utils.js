"use strict";

import { LEARNING_RULES } from "./learningRules.js";

export const INPUT_TYPE = getInputType();

export function msToTime(milliseconds) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function msToSeconds(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const centiseconds = Math.floor((milliseconds % 1000) / 10);

  return `${String(seconds).padStart(2, "0")}:${String(centiseconds).padStart(2, "0")}`;
}

export function getInputType() {
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  return hasTouch ? "touch" : "pointer";
}

export function getInputOffset() {
  return LEARNING_RULES.inputOffsets[INPUT_TYPE] ?? 0;
}

export function longestStreak(arr, categories) {
  // const categorySet = new Set(categories);

  let max = 0;
  let current = 0;

  for (const num of arr) {
    if (categories.has(num)) {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }

  return max;
}
