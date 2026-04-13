"use strict";

import { LEARNING_RULES, ANSWERS_CATEGORIES } from "./learningRules.js";

// export function getStageKey(card) {
//   return `${card.word_status}${card.levelStreak}`;
// }
// export function getStageKeyNew(card) {
//   return `${card.word_status}${card.levelStreak}`;
// }

// export function shouldFlip(card) {
//   return (
//     (card.word_status === "knownWell" ||
//       card.word_status === "strong" ||
//       card.word_status === "mastered") &&
//     card.levelStreak === 0
//   );
// }

// export function shouldFlipNew(card) {
//   console.log("flip testing");
//   console.log(card);
//   console.log([card.wordLevel]);
//   console.log([card.levelStreak]);
//   console.log(
//     LEARNING_RULES.stageSettings[card.wordLevel][card.levelStreak].flip,
//   );
//   return LEARNING_RULES.stageSettings[card.wordLevel][card.levelStreak].flip;
// }

// export function shouldBlind(card) {
//   return (
//     card.word_status === "mastered" ||
//     (card.word_status === "strong" && card.levelStreak === 1)
//   );
// }

// export function shouldBlindNew(card) {
//   return LEARNING_RULES.stageSettings[card.wordLevel][card.levelStreak].blind;
// }

// export function getStarsFill(card) {
//   return LEARNING_RULES.stars[getStageKey(card)];
// }

// export function getStarsFillNew(card) {
//   console.log("stars testing");
//   console.log([card.wordLevel]);
//   console.log([card.levelStreak]);
//   console.log(
//     LEARNING_RULES.stageSettings[card.wordLevel][card.levelStreak].stars,
//   );
//   return LEARNING_RULES.stageSettings[card.wordLevel][card.levelStreak].stars;
// }

export function getStageStep(card) {
  const stage = LEARNING_RULES.stageSettings[card.wordLevel];
  if (!stage) return null;

  const safeStreak = Math.max(
    0,
    Math.min(card.levelStreak, stage.streakThreshold - 1),
  );

  return stage[safeStreak] ?? null;
}

export function getMaxWordLevel() {
  return Math.max(...Object.keys(LEARNING_RULES.stageSettings).map(Number));
}

export function shouldFlipNew(card) {
  return getStageStep(card)?.flip ?? false;
}

export function shouldBlindNew(card) {
  return getStageStep(card)?.blind ?? false;
}

export function getStarsFillNew(card) {
  return getStageStep(card)?.stars ?? 0;
}

export function calculateCooldown(card, category) {
  let cooldown = card.coolDown ?? LEARNING_RULES.cooldowns.defaultMs;

  const multiplier = LEARNING_RULES.cooldowns.multipliers[category] ?? 1;

  const boostRules = LEARNING_RULES.boost.earlyLevelBoost;

  const correctCount = card.firstAnswersHistory.filter(
    (a) =>
      a === ANSWERS_CATEGORIES.FIRST_CORRECT.label ||
      a === ANSWERS_CATEGORIES.FAST_CORRECT.label,
  ).length;

  const fastCount = card.firstAnswersHistory.filter(
    (a) => a === ANSWERS_CATEGORIES.FAST_CORRECT.label,
  ).length;

  const isBoost =
    card.engaged === boostRules.requiredEngaged &&
    correctCount === boostRules.requiredCorrect &&
    fastCount >= boostRules.requiredFast;

  const earlyBoost = isBoost ? 3 : 1;

  cooldown *= multiplier * earlyBoost;

  return Math.max(
    LEARNING_RULES.cooldowns.minMs,
    Math.min(LEARNING_RULES.cooldowns.maxMs, cooldown),
  );
}

// const WRONG_CATEGORIES = new Set([...Object.values(ANSWERS_CATEGORIES.WRONG)]);

// export function isWrongCategory(category) {
//   return WRONG_CATEGORIES.has(category);
// }
