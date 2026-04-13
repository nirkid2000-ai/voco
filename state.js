"use strict";

import data from "./spanish.js";

import { LEARNING_RULES } from "./learningRules.js";

export function createDefaultProgress() {
  return {
    wordLevel: 0,
    scores: [],
    // last5Scores: [],
    wordScore: 0,
    engaged: 0,
    rightAnswers: 0,
    wordStreak: 0,
    levelStreak: 0,
    wrongAnswers: 0,
    accuracy: 0,
    wrongTries: 0,
    recalls: [],
    firstAnswersHistory: [],
    coolDown: LEARNING_RULES.cooldowns.defaultMs,
    inCycle: false,
    cooldownUntil: null,
    isRemoved: false,
  };
}

export function createInitialCards() {
  return data.words.map((word, i) => ({
    id: i + 1,
    question: word.es,
    answer: word.en,
    diff: word.level,
    ...createDefaultProgress(),
  }));
}

export function createDefaultRoundState() {
  return {
    firstTry: true,
    currentTries: 0,
    submitted: false,
    btnDisabled: false,
    roundFlip: false,
    blindRound: false,
    // countdownRound: false,
    timeOut: false,
  };
}

export function resetSessionStats() {
  return {
    sessionCards: new Map(),
    sessionStats: {
      allSessionTimes: [],
      allSessionAnswers: [],
      newWords: 0,
    },
  };
}
