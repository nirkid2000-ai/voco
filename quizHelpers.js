"use strict";

import { LEARNING_RULES, ANSWERS_CATEGORIES } from "/learningRules.js";
import { getStageStep } from "/learningHelpers.js";
import { getInputOffset } from "/utils.js";

export function getDiffArrowPosition(card) {
  return LEARNING_RULES.diffLevels[card.diff];
}

export function getBlindDuration(card) {
  return LEARNING_RULES.stageSettings[card.wordLevel].blindTime ?? 0;
}

export function getCountdownDuration(card) {
  const step = getStageStep(card);
  return step ? step.countdown * 1000 + getInputOffset() : 0;
}

export function getTriesMessage(tries) {
  if (tries === 1) return "טעות ראשונה";
  if (tries === 2) return "טעות שנייה";
  if (tries === 3) return "טעות שלישית";
  // if (tries === 4) return "טעות רביעית";
  return `טעות מספר ${tries}`;
}

export function evaluateAnswer(correctAns, mode, duration, didTimeout) {
  const offset = getInputOffset();
  const isKnow = mode === "know";
  const isGuess = mode === "guess";
  const isMain = mode === "main";

  const isFast = duration < LEARNING_RULES.speedThresholds.quickMs + offset;
  const isSlow = duration > LEARNING_RULES.speedThresholds.slowMs + offset;

  // ✅ CORRECT ANSWERS
  if (correctAns) {
    if (isKnow && !didTimeout) {
      if (isFast) return ANSWERS_CATEGORIES.FAST_CORRECT;
      if (isSlow) return ANSWERS_CATEGORIES.SLOW_CORRECT;
      return ANSWERS_CATEGORIES.FIRST_CORRECT;
    }

    if (isKnow && didTimeout) {
      return ANSWERS_CATEGORIES.LATE_CORRECT;
    }

    if (isMain) {
      return ANSWERS_CATEGORIES.RECOVERY_CORRECT;
    }

    if (isGuess) {
      return ANSWERS_CATEGORIES.CORRECT_GUESS;
    }
  }

  // ❌ WRONG ANSWERS
  if (!correctAns) {
    if (isGuess) return ANSWERS_CATEGORIES.WRONG.WRONG_GUESS;
    if (isKnow) return ANSWERS_CATEGORIES.WRONG.STRONG_WRONG;
    if (isMain) return ANSWERS_CATEGORIES.WRONG.WRONG_ANSWER;
  }
}

export function getAvgSpeedFromRecalls(card, numOfRecalls) {
  const lastXrecalls = card.recalls.slice(-numOfRecalls);
  console.log(lastXrecalls);
  let speedAvg = null;

  if (lastXrecalls.length) {
    if (lastXrecalls.length === 1) {
      speedAvg = Object.values(lastXrecalls[0]);
      console.log(speedAvg[0]);
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
