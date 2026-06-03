"use strict";

// import data from "./latvian2.js";
import latvianData from "./latvianboth.js";
import spanishData from "./spanishboth.js";
import englishData from "./en200.js";
import hebrewData from "./heb200.js";

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
    note: null,
    sentence: null,
  };
}

function loadSelectedCourse(course) {
  if (course === "english") {
    return englishData;
  } else if (course === "latvian") return latvianData;
  else if (course === "spanish") return spanishData;
  else if (course === "hebrew") return hebrewData;
  else {
    console.log("no data found");
    return englishData;
  }
}

export function createInitialCards(course, userLang) {
  const data = loadSelectedCourse(course);
  console.log(data, userLang);
  return data.words.map((word, i) => ({
    id: i + 1,
    question: word.q,
    answer: word.ans[userLang],
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
