"use strict";

import { LEARNING_RULES } from "./learningRules.js";
import { getStageStep } from "./learningHelpers.js";
import { getInputOffset } from "./utils.js";

export const ANSWER_KEYS = {
  VERY_FAST_CORRECT: "VERY_FAST_CORRECT",
  FAST_CORRECT: "FAST_CORRECT",
  FIRST_CORRECT: "FIRST_CORRECT",
  SLOW_CORRECT: "SLOW_CORRECT",
  LATE_CORRECT: "LATE_CORRECT",
  RECOVERY_CORRECT: "RECOVERY_CORRECT",
  CORRECT_GUESS: "CORRECT_GUESS",
  WRONG_GUESS: "WRONG_GUESS",
  WRONG_ANSWER: "WRONG_ANSWER",
  STRONG_WRONG: "STRONG_WRONG",
};

export function getDiffArrowPosition(card) {
  return LEARNING_RULES.diffLevels[card.diff];
}

export function getBlindDuration(card) {
  return LEARNING_RULES.stageSettings[card.wordLevel]?.blindTime ?? 0;
}

export function getCountdownDuration(card) {
  const step = getStageStep(card);
  return step ? step.countdown * 1000 + getInputOffset() : 0;
}

export function evaluateAnswer(correctAns, mode, duration, didTimeout) {
  const offset = getInputOffset();
  const isKnow = mode === "know";
  const isGuess = mode === "guess";
  const isMain = mode === "main";

  const isVeryFast =
    duration < LEARNING_RULES.speedThresholds.veryQuickMs + offset;
  const isFast = duration < LEARNING_RULES.speedThresholds.quickMs + offset;
  const isSlow = duration > LEARNING_RULES.speedThresholds.slowMs + offset;

  // ✅ CORRECT ANSWERS
  if (correctAns) {
    if (isKnow && !didTimeout) {
      if (isVeryFast) return ANSWER_KEYS.VERY_FAST_CORRECT;
      if (isFast) return ANSWER_KEYS.FAST_CORRECT;
      if (isSlow) return ANSWER_KEYS.SLOW_CORRECT;
      return ANSWER_KEYS.FIRST_CORRECT;
    }

    if (isKnow && didTimeout) {
      return ANSWER_KEYS.LATE_CORRECT;
    }

    if (isMain) {
      return ANSWER_KEYS.RECOVERY_CORRECT;
    }

    if (isGuess) {
      return ANSWER_KEYS.CORRECT_GUESS;
    }
  }

  // ❌ WRONG ANSWERS
  if (!correctAns) {
    if (isGuess) return ANSWER_KEYS.WRONG_GUESS;
    if (isKnow) return ANSWER_KEYS.STRONG_WRONG;
    if (isMain) return ANSWER_KEYS.WRONG_ANSWER;
  }
}

export function getAvgSpeedFromRecalls(card, numOfRecalls) {
  const lastXrecalls = card.recalls.slice(-numOfRecalls);
  let speedAvg = null;

  if (lastXrecalls.length) {
    if (lastXrecalls.length === 1) {
      speedAvg = Object.values(lastXrecalls[0]);
      return speedAvg[0];
    } else {
      const sum = lastXrecalls.reduce((sum, obj) => {
        return sum + Object.values(obj)[0];
      }, 0);
      speedAvg = sum / lastXrecalls.length;
    }
  }
  return speedAvg;
}
