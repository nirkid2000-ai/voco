"use strict";
import {
  LEARNING_RULES,
  ANSWERS_CATEGORIES,
  CORRECT_CATEGORIES,
  FEEDBACK_MEESAGES,
  KNOW_CATEGORIES,
} from "./learningRules.js";
import {
  shouldFlipNew,
  shouldBlindNew,
  getStarsFillNew,
  getStageStep,
  getMaxWordLevel,
  calculateCooldown,
  // isWrongCategory,
} from "./learningHelpers.js";
import {
  createInitialCards,
  createDefaultRoundState,
  resetSessionStats,
} from "./state.js";

import {
  msToTime,
  msToSeconds,
  // getInputOffset,
  INPUT_TYPE,
  longestStreak,
} from "./utils.js";

import {
  ANSWER_KEYS,
  getDiffArrowPosition,
  getCountdownDuration,
  getBlindDuration,
  evaluateAnswer,
  getAvgSpeedFromRecalls,
} from "./quizHelpers.js";

// import { Messages } from "/messages.js";

import { startAnimations } from "./animations.js";

// const appName = document.querySelector(".the_name");
const tagline = document.querySelector(".tagline");
const homeScreen = document.getElementById("home-screen");
const appScreen = document.getElementById("app-screen");
const summaryScreen = document.getElementById("summary-screen");

const languageSelection = document.querySelector(".language_selection");

const homeStartBtn = document.getElementById("home-start-btn");
const studyMoreBtn = document.getElementById("study-more-btn");
const langugaeBtn = document.querySelector(".language_ui_btn");

const backHomeBtn = document.getElementById("back_home_btn");
const endSessionBtn = document.getElementById("end_session_btn");

const wordTop = document.querySelector(".word_top");
const qText = document.querySelector(".q");
const levelText = document.querySelector(".word_status");
const diffLabel = document.querySelector(".word_difficulty");
const difArrow = document.querySelector(".arrow");
const masteryLabel = document.querySelector(".word_mastery");

const list = document.querySelector(".wordlist");
const submitMainBtn = document.querySelector(".main_ans");
const submitKnowBtn = document.querySelector(".know_ans");
const submitGuessBtn = document.querySelector(".guess_ans");
const timerLabel = document.querySelector(".timer_label");
const resetbtn = document.querySelector(".reset");
const knowOrGuess = document.querySelector(".knoworguess");
const menuBtns = document.querySelector(".menu_btns");
const feedback = document.querySelector(".line_1");
const scoreStat = document.querySelector(".score_stat");
const streakStat = document.querySelector(".streak_stat");
// const questionTimer = document.querySelector(".q_timer");
const sessionTimer = document.querySelector(".set_timer");
const totalFrom = document.querySelector(".total_from");
const feedbackBg = document.querySelector(".feedback_bg");
// const stars = document.querySelector(".stars");
const starsFill = document.querySelector(".stars-fill");
const countdown = document.querySelector(".countdown");
const countdownCon = document.querySelector(".countdown_con");
const submitButtons = document.querySelectorAll(".submit");
const removeWordBtn = document.querySelector(".word_remove");
const blindRecallLogo = document.querySelector(".blind_recall");
const blindCounter = document.querySelector(".blind_counter");
const flipLogo = document.querySelector(".flip_logo");
const feedGrid = document.querySelector(".fb_grid");
const summaryGrid = document.querySelector(".summary_grid");
// const startBtn = document.querySelector(".start");
const overlay = document.querySelector(".meaning_overlay");
const pin = document.querySelector(".pin");
const overlayWord = document.querySelector(".meaning_word");
const overlayText = document.querySelector(".meaning_text");
const overlayExample = document.querySelector(".meaning_example");
const overlayTime = document.querySelector(".time_to_answer");
const overlayAvg = document.querySelector(".avg_answer");
const overlayCooldown = document.querySelector(".next_cooldown");
const lastAnswers = document.querySelector(".last_answers");
const bubble = document.querySelector(".bubble_wrap");

const mainCrow = document.getElementById("main_crow");

const summaryCon = document.querySelector(".summary_stats");

const circle = document.getElementById("progressCircle");
const radius = 45;
const circumference = 2 * Math.PI * radius;

circle.style.strokeDasharray = `${circumference}`;
circle.style.strokeDashoffset = `0`;

const STORAGE_KEY = "vocab-app-progress-v1";

function saveProgress() {
  const cardsProgress = Object.fromEntries(
    cards.map((card) => [
      card.id,
      {
        wordLevel: card.wordLevel,
        scores: card.scores,
        // last5Scores: card.last5Scores,
        wordScore: card.wordScore,
        engaged: card.engaged,
        rightAnswers: card.rightAnswers,
        wordStreak: card.wordStreak,
        levelStreak: card.levelStreak,
        wrongAnswers: card.wrongAnswers,
        accuracy: card.accuracy,
        wrongTries: card.wrongTries,
        recalls: card.recalls,
        firstAnswersHistory: card.firstAnswersHistory,
        coolDown: card.coolDown,
        inCycle: card.inCycle,
        cooldownUntil: card.cooldownUntil,
        isRemoved: card.isRemoved,
      },
    ]),
  );

  const Uilangugae = uiLang;

  const state = {
    Uilangugae,
    cardsProgress,
    globalScore,
    globalStreak,
    correctGuesses,
    totalGuesses,
    totalCorrect,
    totalQs,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save progress:", err);
  }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    cards = createInitialCards();

    if (!raw) {
      buildCardsLookup();
      return;
    }

    const state = JSON.parse(raw);
    if (!state) {
      buildCardsLookup();
      return;
    }

    if (state.cardsProgress) {
      cards = cards.map((card) => {
        const savedProgress = state.cardsProgress[card.id];
        return savedProgress ? { ...card, ...savedProgress } : card;
      });
    }

    buildCardsLookup();

    uiLang = state.Uilangugae ?? "he";

    globalScore = state.globalScore ?? 0;
    globalStreak = state.globalStreak ?? 0;
    correctGuesses = state.correctGuesses ?? 0;
    totalGuesses = state.totalGuesses ?? 0;
    totalCorrect = state.totalCorrect ?? 0;
    totalQs = state.totalQs ?? 0;
  } catch (err) {
    console.error("Failed to load progress:", err);
    cards = createInitialCards();
    buildCardsLookup();
  }
}

function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);

  cards = createInitialCards();
  buildCardsLookup();
  globalScore = 0;
  globalStreak = 0;
  correctGuesses = 0;
  totalGuesses = 0;
  totalCorrect = 0;
  totalQs = 0;
  list.style.display = "flex";
  if (sessionClock) clearInterval(sessionClock);
}

let cards = createInitialCards();
let cardsById = new Map();

let roundState = {
  firstTry: true,
  currentTries: 0,
  btnDisabled: false,
  roundFlip: false,
  blindRound: false,
  // countdownRound: false,
  timeOut: false,
  submitted: false,
};

let sessionState = {
  sessionCards: new Map(),
  sessionStats: {
    allSessionTimes: [],
    allSessionAnswers: [],
  },
};

let chosenCard;

// let recentWordIds = [];
let recentWordIds = new Set();

let globalStreak = 0;
let globalScore = 0;
let correctGuesses = 0;
let totalGuesses = 0;
let totalCorrect = 0;
let totalQs = 0;

// let currentSession = new Map();
let currentSessionArr = [];

let questionStartTime;
let sessionStartTime;
let countdownInterval;
let blindRevealTimeout;
let flashEye;
let questionClock;
let sessionClock;

let overlayTimeout = null;
let correctFeedbackTimeout = null;
let isHolding = false;
let pendingNext = null;
let overlayMinTimeDone = false;

let uiLang = "he";
let courseLang;

let sessionStarted;

function setUiText(langugae) {
  // appName.textContent = LEARNING_RULES.uiTexts.appName;
  countdown.classList.remove("countdown_flip");
  uiLang === "en" ? countdown.classList.add("countdown_flip") : 0;
  bubble.classList.remove("rtl", "ltr");
  bubble.classList.add(uiLang === "he" ? "rtl" : "ltr");
  knowOrGuess.classList.remove("rtl", "ltr");
  knowOrGuess.classList.add(uiLang === "he" ? "rtl" : "ltr");
  menuBtns.classList.remove("reverse_flex");
  menuBtns.classList.add(uiLang === "he" ? "reverse_flex" : "rtl");
  wordTop.classList.remove("reverse_flex");
  wordTop.classList.add(uiLang === "he" ? "rtl" : "reverse_flex");
  tagline.textContent = LEARNING_RULES.uiTexts.tagLine[langugae];
  homeStartBtn.textContent =
    LEARNING_RULES.uiTexts.buttons.home.start[langugae];
  diffLabel.textContent = LEARNING_RULES.uiTexts.difficulty[langugae];
  masteryLabel.textContent = LEARNING_RULES.uiTexts.masteryLevel[langugae];
  submitMainBtn.textContent =
    LEARNING_RULES.uiTexts.buttons.mainApp.submit.main[langugae];
  submitKnowBtn.textContent =
    LEARNING_RULES.uiTexts.buttons.mainApp.submit.know[langugae];
  submitGuessBtn.textContent =
    LEARNING_RULES.uiTexts.buttons.mainApp.submit.guess[langugae];
  backHomeBtn.textContent =
    LEARNING_RULES.uiTexts.buttons.mainApp.nav.home[langugae];
  endSessionBtn.textContent =
    LEARNING_RULES.uiTexts.buttons.mainApp.nav.end[langugae];
  resetbtn.textContent =
    LEARNING_RULES.uiTexts.buttons.mainApp.nav.reset[langugae];
  timerLabel.textContent = LEARNING_RULES.uiTexts.timer[langugae];
  studyMoreBtn.textContent =
    LEARNING_RULES.uiTexts.buttons.summary.learnMore[langugae];
}

// setUiText(uiLang);

// let currentSessionStats = new Map();

loadProgress();
setUiText(uiLang);

function navigate(screenName) {
  homeScreen.classList.add("hidden");
  appScreen.classList.add("hidden");
  summaryScreen.classList.add("hidden");

  if (screenName === "home") {
    homeScreen.classList.remove("hidden");
  }

  if (screenName === "app") {
    appScreen.classList.remove("hidden");
  }

  if (screenName === "summary") {
    summaryScreen.classList.remove("hidden");
  }
}

function buildCardsLookup() {
  cardsById = new Map(cards.map((card) => [card.id, card]));
}

function getSessionCardStats(card) {
  if (!sessionState.sessionCards.has(card.id)) {
    sessionState.sessionCards.set(card.id, {
      id: card.id,
      engagements: 0,
      starterLevel: card.wordLevel,
      firstAnswers: [],
      recalls: [],
      scores: [],
    });
  }
  return sessionState.sessionCards.get(card.id);
}

// function calculateWordScore(results) {
//   if (!Array.isArray(results) || results.length === 0) {
//     return 0;
//   }

//   const MAX_HISTORY = 5;
//   const MAX_RESULT = 20;
//   const SCALE = 100 / MAX_RESULT; // = 5

//   const lastResults = results.slice(-MAX_HISTORY);

//   const resultsNormalized = lastResults.map((value) => {
//     const num = Number(value);
//     if (Number.isNaN(num)) return 0;
//     return Math.max(0, Math.min(20, num));
//   });

//   let weightedSum = 0;
//   let weightSum = 0;

//   for (let i = 0; i < resultsNormalized.length; i++) {
//     const weight = (i + 1) ** 1.7;
//     weightedSum += resultsNormalized[i] * weight;
//     weightSum += weight;
//   }

//   const weightedAverage = weightedSum / weightSum;

//   const confidence = resultsNormalized.length / MAX_HISTORY;
//   const finalScore = Math.round(weightedAverage * SCALE);

//   return Math.round(finalScore);
// }

function calculateWordScore(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return 1;
  }

  const MAX_HISTORY = 5;
  const MAX_RESULT = 20;
  const MIN_SCORE = 1;
  const MAX_SCORE = 100;
  const NEUTRAL_SCORE = 50;

  const lastResults = results.slice(-MAX_HISTORY);

  const resultsNormalized = lastResults.map((value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return 0;
    return Math.max(0, Math.min(MAX_RESULT, num));
  });

  let weightedSum = 0;
  let weightSum = 0;

  for (let i = 0; i < resultsNormalized.length; i++) {
    const weight = (i + 1) ** 1.5; // increase so later answers count more
    weightedSum += resultsNormalized[i] * weight;
    weightSum += weight;
  }

  const weightedAverage = weightedSum / weightSum; // 0–20
  const baseScore = (weightedAverage / MAX_RESULT) * MAX_SCORE; // 0–100

  const answerCount = resultsNormalized.length;
  const historyFactor = 0.6 + 0.4 * (answerCount / MAX_HISTORY);
  // 1 answer = 0.68, 5 answers = 1.0 lower for stronger penalty. the more answers
  // the more "pure" is the score. less scores pull towards Neutral score.

  const finalScore =
    baseScore * historyFactor + NEUTRAL_SCORE * (1 - historyFactor);

  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, Math.round(finalScore)));
}

function getSessionSummaryFromStats() {
  const sessionCards = Array.from(sessionState.sessionCards.values());
  // const lastCard = sessionCards.at(-1);
  // if (!lastCard.recalls.at(-1))
  //   lastCard.recalls.push({ category: "unresolved", time: 5000 });

  return sessionCards.map((sessionCard) => {
    const card = cardsById.get(sessionCard.id);

    const avgRecallTime =
      sessionCard.recalls.length > 0
        ? sessionCard.recalls.reduce((sum, recall) => sum + recall.time, 0) /
          sessionCard.recalls.length
        : 0;

    const avgRecallSeconds = (avgRecallTime / 1000).toFixed(2);

    const improved = sessionCard.starterLevel < card.wordLevel ? true : false;

    const newWord = sessionCard.starterLevel === 0 ? true : false;

    const learnedNew =
      sessionCard.starterLevel === 0 && card.wordLevel >= 2 ? true : false;

    const finalScore = calculateWordScore(sessionCard.scores);

    return {
      ...sessionCard,
      question: card.question,
      answer: card.answer,
      wordLevel: card.wordLevel,
      avgRecallSeconds,
      newWord,
      learnedNew,
      improved,
      finalScore,
    };
  });
}

function saveSessionStats(
  card,
  answerCategory,
  duration,
  isFirstTry,
  correctAns,
  score,
) {
  const sessionCard = getSessionCardStats(card);

  if (isFirstTry) {
    sessionCard.engagements += 1;
    sessionCard.firstAnswers.push(ANSWERS_CATEGORIES[answerCategory].label);
    sessionState.sessionStats.allSessionAnswers.push(
      ANSWERS_CATEGORIES[answerCategory].label,
    );
    sessionCard.scores.push(score);
  }

  if (correctAns) {
    sessionState.sessionStats.allSessionTimes.push(Math.floor(duration));
    sessionCard.recalls.push({
      category: ANSWERS_CATEGORIES[answerCategory].label,
      time: Math.floor(duration),
    });
  }
}

function renderSummary() {
  const sessionTimeMs = performance.now() - sessionStartTime;
  const sessionTime = msToTime(sessionTimeMs);
  const enriched = getSessionSummaryFromStats();
  const uniqueWords = enriched.length;
  // const unkownWords = enriched.filter((word) => word.wordLevel === 1);
  const newWords = enriched.filter((word) => word.newWord);
  const learnedNewWords = enriched.filter((word) => word.learnedNew);
  const improvedWords = enriched.filter((word) => word.improved);

  const totalQuestions = sessionState.sessionStats.allSessionAnswers.length;

  // const lateCorrects = sessionState.sessionStats.allSessionAnswers.filter(
  //   (category) => category === ANSWER_KEYS.LATE_CORRECT,
  // );

  const correctGuesses = sessionState.sessionStats.allSessionAnswers.filter(
    (answer) => answer === ANSWERS_CATEGORIES.CORRECT_GUESS.label,
  ).length;

  const avgSessionRecallTime =
    sessionState.sessionStats.allSessionTimes.length > 0
      ? sessionState.sessionStats.allSessionTimes.reduce(
          (sum, recall) => sum + recall,
          0,
        ) / sessionState.sessionStats.allSessionTimes.length
      : 0;

  const avgSessionRecallSeconds = (avgSessionRecallTime / 1000)
    .toFixed(2)
    .replace(".", ":");

  const longestCorrectStreak = longestStreak(
    sessionState.sessionStats.allSessionAnswers,
    KNOW_CATEGORIES,
  );

  const totalSessionPassed = sessionState.sessionStats.allSessionAnswers.filter(
    (answer) => CORRECT_CATEGORIES.has(answer),
  ).length;

  const totalSessionKnown = sessionState.sessionStats.allSessionAnswers.filter(
    (answer) => KNOW_CATEGORIES.has(answer),
  ).length;

  const totalSessionNotPassed = totalQuestions - totalSessionPassed;

  const sortedWordsByScore = [...enriched].sort(
    (a, b) => b.finalScore - a.finalScore,
  );

  const strongestWord = sortedWordsByScore[0] ?? null;
  const weakestWord = sortedWordsByScore.at(-1) ?? null;

  summaryCon.innerHTML = `
  <div class="summary_con ${uiLang === "he" ? "rtl" : "ltr"}">
  <h1 class="summary_header">${LEARNING_RULES.uiTexts.summaryHeader[uiLang]}</h1>
   <div class ="summary_line"><label class="summary_label">${LEARNING_RULES.uiTexts.summaryLabels.sessionDuration[uiLang]}</label><label class="summary_stat"> ${sessionTime}</label></div>
  <div class ="summary_line"><label class="summary_label">${LEARNING_RULES.uiTexts.summaryLabels.totalQuestions[uiLang]}</label><label class="summary_stat"> ${totalQuestions}</label></div>
  <div class ="summary_line"><label class="summary_label">${LEARNING_RULES.uiTexts.summaryLabels.totalKnown[uiLang]}</label><label class="summary_stat"> ${totalSessionKnown}</label></div>
  <div class ="summary_line"><label class="summary_label">${LEARNING_RULES.uiTexts.summaryLabels.correctGuesses[uiLang]}</label><label class="summary_stat"> ${correctGuesses}</label></div>
  <div class ="summary_line"><label class="summary_label">${LEARNING_RULES.uiTexts.summaryLabels.totalFailed[uiLang]}</label><label class="summary_stat"> ${totalSessionNotPassed}</label></div>
  <div class ="summary_line"><label class="summary_label">${LEARNING_RULES.uiTexts.summaryLabels.avgRecallTime[uiLang]}</label><label class="summary_stat"> ${avgSessionRecallSeconds}${FEEDBACK_MEESAGES.overlay.units[uiLang]}</label></div>
  <div class ="summary_line"><label class="summary_label">${LEARNING_RULES.uiTexts.summaryLabels.longestStrike[uiLang]}</label><label class="summary_stat"> ${longestCorrectStreak}</label></div>
  <div class ="summary_line"><label class="summary_label">${LEARNING_RULES.uiTexts.summaryLabels.uniqueWords[uiLang]}</label><label class="summary_stat"> ${uniqueWords}</label></div>
  <div class ="summary_line"><label class="summary_label">${LEARNING_RULES.uiTexts.summaryLabels.improved[uiLang]}</label><label class="summary_stat"> ${improvedWords.length}</label></div>
  <div class ="summary_line"><label class="summary_label">${LEARNING_RULES.uiTexts.summaryLabels.newWords[uiLang]}</label><label class="summary_stat">${newWords.length} </label></div>
  <div class ="summary_line"><label class="summary_label">${LEARNING_RULES.uiTexts.summaryLabels.newLearned[uiLang]}</label><label class="summary_stat">${learnedNewWords.length} </label></div>
  <div class ="summary_line"><label class="summary_label">${LEARNING_RULES.uiTexts.summaryLabels.strongest[uiLang]}</label><label class="summary_stat">${sortedWordsByScore.length > 0 ? strongestWord.question : ""} </label></div>
  <div class ="summary_line"><label class="summary_label">${LEARNING_RULES.uiTexts.summaryLabels.weakest[uiLang]}</label><label class="summary_stat">${sortedWordsByScore.length > 0 ? weakestWord.question : ""} </label></div>
  </div>
`;
}

function stopSession() {
  if (sessionClock) clearInterval(sessionClock);
  if (questionClock) clearInterval(questionClock);
  if (countdownInterval) clearInterval(countdownInterval);
}

//overlay

let isPinned = false;

function togglePin() {
  isPinned = !isPinned;
  if (isPinned) {
    console.log("pinned");
    pin.style.display = "flex";
  }

  if (!isPinned && overlayMinTimeDone) {
    finishOverlay();
  }
}

// function holdStart() {
//   isHolding = true;
// }

// function holdEnd() {
//   if (!isHolding) return;
//   isHolding = false;}

// Hover/touch can extend visibility, but never shorten it.
if (overlayMinTimeDone) {
  finishOverlay();
}

function enableOverlayInteractions() {
  overlay.addEventListener("click", togglePin);
}

// function enableOverlayInteractions() {
//   if (INPUT_TYPE === "touch") {
//     overlay.addEventListener("pointerdown", holdStart);
//     overlay.addEventListener("pointerup", holdEnd);
//     overlay.addEventListener("pointerleave", holdEnd);
//     overlay.addEventListener("pointercancel", holdEnd);
//   } else {
//     overlay.addEventListener("mouseenter", holdStart);
//     overlay.addEventListener("mouseleave", holdEnd);
//   }
// }

function showMeaning(card, category, speedAvg, onDone) {
  pendingNext = onDone;
  overlayMinTimeDone = false;
  const answerKey = roundState.roundFlip ? "question" : "answer";

  showAnswersCircles(card);
  overlayWord.textContent = card.question;
  overlayText.textContent = card[answerKey];

  const lastRecall = card.recalls.at(-1);
  const lastRecallMs = lastRecall ? Object.values(lastRecall)[0] : 0;
  const avgMs = typeof speedAvg === "number" ? speedAvg : 0;

  overlayTime.textContent =
    FEEDBACK_MEESAGES.overlay.time[uiLang] +
    msToSeconds(lastRecallMs) +
    " " +
    FEEDBACK_MEESAGES.overlay.units[uiLang];
  overlayAvg.textContent =
    FEEDBACK_MEESAGES.overlay.avgTime[uiLang] +
    msToSeconds(avgMs) +
    " " +
    FEEDBACK_MEESAGES.overlay.units[uiLang];
  overlayCooldown.textContent =
    FEEDBACK_MEESAGES.overlay.cooldownTime[uiLang] + msToTime(card.coolDown);

  overlayExample.textContent = LEARNING_RULES.stageSettings[card.wordLevel]
    .example
    ? card.example || "..."
    : "";

  overlay.classList.add("show");
  qText.classList.add("on_top");

  clearTimeout(overlayTimeout);
  overlayTimeout = setTimeout(() => {
    overlayMinTimeDone = true;

    if (!isPinned) {
      finishOverlay();
    }
  }, ANSWERS_CATEGORIES[category].overlayDuration);
}

function finishOverlay() {
  qText.classList.remove("on_top");
  pin.style.display = "none";
  clearTimeout(overlayTimeout);
  overlayTimeout = null;
  overlayMinTimeDone = false;
  isPinned = false;

  overlay.classList.remove("show");

  if (pendingNext) pendingNext();
  pendingNext = null;
}

enableOverlayInteractions();

// function getPromotionThreshold() {
//   return LEARNING_RULES.promotion.requiredLevelStreak;
// }
// function getPromotionThresholdNew(card) {
//   return LEARNING_RULES.stageSettings[card.word_status].maxLevel;
// }

// function rememberShownWord(card) {
//   recentWordIds.push(card.id);
//   if (recentWordIds.length > LEARNING_RULES.minWordGap) {
//     recentWordIds.shift();
//   }
// }

function rememberShownWord(card) {
  recentWordIds.add(card.id);

  if (recentWordIds.size > LEARNING_RULES.minWordGap) {
    const first = recentWordIds.values().next().value;
    recentWordIds.delete(first);
  }
}
// function shouldCountdown(card) {
//   return true;
//   return !["new", "unknown", "recognized"].includes(card.word_status);
// }

//main app logic

function chooseQuestion() {
  chosenCard = null;
  const now = Date.now();

  const allLiveCards = cards.filter((card) => !card.isRemoved);
  const filteredLiveCards = allLiveCards.filter(
    (card) => !recentWordIds.has(card.id),
  );

  const liveCards =
    filteredLiveCards.length > 0 ? filteredLiveCards : allLiveCards;

  const fromCooldowns = liveCards.filter(
    (card) => card.inCycle && card.cooldownUntil && now >= card.cooldownUntil,
  );
  // remove cards the user already know by specific critaeria

  if (fromCooldowns.length) {
    chosenCard = fromCooldowns.reduce((oldestDue, card) =>
      card.cooldownUntil < oldestDue.cooldownUntil ? card : oldestDue,
    );
  }

  if (!chosenCard) {
    const freshCards = liveCards.filter((card) => !card.inCycle);
    if (freshCards.length > 0) {
      const minEngaged = Math.min(...freshCards.map((card) => card.engaged));

      const candidates = freshCards.filter(
        (card) => card.engaged === minEngaged,
      );
      const randomIndex = Math.floor(Math.random() * candidates.length);
      chosenCard = candidates[randomIndex];
    }
  }

  if (!chosenCard) {
    const coolingCards = liveCards.filter(
      (card) => card.inCycle && card.cooldownUntil,
    );

    if (coolingCards.length) {
      chosenCard = coolingCards.reduce((earliest, card) =>
        card.cooldownUntil < earliest.cooldownUntil ? card : earliest,
      );
    }
  }

  // make sure questions cycle without repetition before full cycle
  // check the highest engaged value and only allow questions with lower engaged value show
  //if all appered values are equal then choose random from all cards.
  if (chosenCard) {
    roundState.roundFlip = shouldFlipNew(chosenCard);
    roundState.blindRound = shouldBlindNew(chosenCard);
    // countdownRound = shouldCountdown(chosenCard);
    if (!chosenCard.inCycle) chosenCard.inCycle = true;
  }

  return chosenCard;
}

function renderQuestionText(card) {
  qText.textContent = roundState.roundFlip ? card.answer : card.question;
}

function renderQuestion(card) {
  if (!card) return;
  renderQuestionText(card);
  updateWordStats(card);
}

function updateWordStats(card) {
  levelText.textContent =
    LEARNING_RULES.uiTexts.wordStatus[card.wordLevel][uiLang];
  difArrow.style.left = `${getDiffArrowPosition(card)}%`;
  if (roundState.submitted) {
    starsFill.classList.add("animate-fill");
  } else {
    starsFill.classList.remove("animate-fill");
  }
  starsFill.style.setProperty("--fill", `${getStarsFillNew(card)}%`);
}

function showAnswers(card) {
  const correctAnswer = roundState.roundFlip ? card.question : card.answer;
  // const status = card.word_status;

  // const numberOfAns = blindRound
  //   ? 4
  //   : status === "knownWell" || status === "strong"
  //     ? 5
  //     : 4;
  const numberOfAns = 4;
  const answers = chooseAnswers(card, numberOfAns, correctAnswer);

  list.innerHTML = answers
    .map(
      (answer) => `
        <li>
          <label class="answer_label">
            <input type="radio" name="answer" value="${answer}">
            ${answer}
          </label>
        </li>
      `,
    )
    .join("");
}

function chooseAnswers(card, num, correctAnswer) {
  const answerKey = roundState.roundFlip ? "question" : "answer";
  const maxLenDiff = LEARNING_RULES.stageSettings[card.wordLevel].maxLengthDiff;

  const strictPool = cards.filter((word) => {
    const candidate = word[answerKey];
    if (candidate === correctAnswer) return false;
    if (word.diff !== card.diff) return false;
    return Math.abs(candidate.length - correctAnswer.length) <= maxLenDiff;
  });

  const sameLevelPool = cards.filter((word) => {
    const candidate = word[answerKey];
    return candidate !== correctAnswer && word.diff === card.diff;
  });

  const broadPool = cards.filter((word) => {
    return word[answerKey] !== correctAnswer;
  });

  const wrongAnswers = [];
  const used = new Set();

  function fillFromPool(pool) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    for (const word of shuffled) {
      const candidate = word[answerKey];
      if (wrongAnswers.length >= num - 1) break;
      if (used.has(candidate)) continue;

      used.add(candidate);
      wrongAnswers.push(candidate);
    }
  }

  fillFromPool(strictPool);
  if (wrongAnswers.length < num - 1) fillFromPool(sameLevelPool);
  if (wrongAnswers.length < num - 1) fillFromPool(broadPool);

  if (wrongAnswers.length < num - 1) {
    throw new Error(
      `Not enough unique answers to build ${num} options for "${correctAnswer}"`,
    );
  }

  const allAnswers = [...wrongAnswers];
  const rightAnsPosition = Math.floor(Math.random() * num);
  allAnswers.splice(rightAnsPosition, 0, correctAnswer);

  return allAnswers;
}

function pickQuestionAndAnswers() {
  const card = chooseQuestion();
  renderQuestion(card);
  if (card) {
    rememberShownWord(card);
    showAnswers(card);
  }
}

function updateAccuracy(card) {
  card.accuracy = card.engaged > 0 ? card.rightAnswers / card.engaged : 0;
}

function promoteCard(card) {
  console.log(LEARNING_RULES.stageSettings[card.wordLevel].label);
  const maxLevel = getMaxWordLevel();

  card.levelStreak = 0;
  if (card.wordLevel === 0) {
    card.wordLevel = 2;
    // card.wordLevel = Math.min(card.wordLevel + 2, maxLevel);
  } else {
    card.wordLevel = Math.min(card.wordLevel + 1, maxLevel);
  }
  console.log(LEARNING_RULES.stageSettings[card.wordLevel].label);
}

function demoteCard(card) {
  const step = getStageStep(card);
  console.log(LEARNING_RULES.stageSettings[card.wordLevel].label);
  card.wordLevel = step.demoteTo[0];
  card.levelStreak = step.demoteTo[1];
  console.log(LEARNING_RULES.stageSettings[card.wordLevel].label);
}

function handleAnswerOutcome(card, selected, result) {
  const { correctAns, answerCategory } = result;
  roundState.timeOut = result.didTimeout;
  showMsg(getMessage(answerCategory, roundState.currentTries));

  if (correctAns) {
    const speedAvg = getAvgSpeedFromRecalls(card, 5);
    handleCorrectAnswer(card, answerCategory, speedAvg);
    endSessionBtn.classList.remove("inactive");
    sessionStarted = true;
  } else {
    endSessionBtn.classList.add("inactive");
    sessionStarted = false;
    dimAnswer(selected);
    handleWrongAnswer(card, answerCategory);
    resetSubmitButtons();
  }
}

function handleCorrectAnswer(card, category, speedAvg) {
  applyCorrectFeedbackStyles(category);
  runCorrectAnswerFlow(card, category, speedAvg);
}

function runCorrectAnswerFlow(card, category, speedAvg) {
  if (roundState.firstTry) {
    handleFirstTryCorrect(card, category, speedAvg);
  }

  applyCorrectScore();
  renderStats();
  stopQuestionTimers();

  showMeaning(card, category, speedAvg, () => {
    finalizeCorrectFeedbackUI();
    resetState();
  });
}

function handleFirstTryCorrect(card, category) {
  if (checkLevelBoost(card)) card.levelStreak += 1;

  if (category === ANSWER_KEYS.CORRECT_GUESS) {
    correctGuesses += 1;
    totalGuesses += 1;
    if (card.engaged === 1) {
      card.wordLevel = 1;
    }
  } else if (ANSWERS_CATEGORIES[category].passed) {
    const stage = LEARNING_RULES.stageSettings[card.wordLevel];
    const maxLevel = getMaxWordLevel();

    if (card.wordLevel === maxLevel) {
      if (card.levelStreak < stage.streakThreshold - 1) {
        card.levelStreak += 1;
      }
    } else if (card.levelStreak < stage.streakThreshold) {
      card.levelStreak += 1;

      if (card.levelStreak >= stage.streakThreshold) {
        promoteCard(card);
      }
    }
  }

  card.rightAnswers += 1;
  card.wordStreak += 1;
  globalStreak += 1;
  totalCorrect += 1;
  updateAccuracy(card);

  updateWordStats(card);
  // sessionState.sessionCards.set(card.id, card);
  currentSessionArr.push(card);

  renderStats();

  saveProgress();
}

function handleFirstTryWrong(card, category) {
  if (category === ANSWER_KEYS.WRONG_GUESS) {
    totalGuesses += 1;
  }
  roundState.firstTry = false;
  card.wrongAnswers += 1;
  card.wrongTries += 1;
  clearInterval(countdownInterval);
  countdown.style.width = `0%`;
  // countdownCon.style.display = "none";

  updateAccuracy(card);

  demoteCard(card);
  updateWordStats(card);
  // sessionState.sessionCards.set(card.id, card);
  currentSessionArr.push(card);

  renderStats();

  saveProgress();
}

function handleWrongAnswer(card, category) {
  applyWrongAnswerPenalty(card, category);
  restoreRetryUI();

  setTimeout(() => {
    resetWrongFeedbackUI();
  }, 1000);
}

function applyCooldown(card, category) {
  const cooldown = calculateCooldown(card, category);

  card.coolDown = cooldown;
  card.cooldownUntil = Date.now() + cooldown;

  saveProgress();
}

function applyWrongAnswerPenalty(card, category) {
  globalStreak = 0;
  card.wordStreak = 0;
  renderStats();

  if (roundState.firstTry) {
    handleFirstTryWrong(card, category);
  } else {
    card.wrongTries += 1;
    saveProgress();
  }
}

function checkLevelBoost(card) {
  // const correctCount = card.firstAnswersHistory.filter(
  //   (answer) =>
  //     answer === ANSWERS_CATEGORIES.FIRST_CORRECT ||
  //     answer === ANSWERS_CATEGORIES.FAST_CORRECT,
  // ).length;
  // const fastCount = card.firstAnswersHistory.filter(
  //   (answer) => answer === ANSWERS_CATEGORIES.FAST_CORRECT,
  // ).length;
  let correctCount = 0;
  let fastCount = 0;

  for (const answer of card.firstAnswersHistory) {
    if (
      answer === ANSWERS_CATEGORIES.FIRST_CORRECT.label ||
      answer === ANSWERS_CATEGORIES.FAST_CORRECT.label ||
      answer === ANSWERS_CATEGORIES.VERY_FAST_CORRECT.label
    ) {
      correctCount++;
    }

    if (answer === ANSWERS_CATEGORIES.FAST_CORRECT.label) {
      fastCount++;
    }
  }

  const boostRules = LEARNING_RULES.boost.earlyLevelBoost;

  if (
    card.engaged === boostRules.requiredEngaged &&
    correctCount === boostRules.requiredCorrect &&
    fastCount >= boostRules.requiredFast
  ) {
    console.log("LEVEL BOOST");
    return true;
  } else {
    return false;
  }
}

function getAnswerResult(card, selected, mode) {
  const key = roundState.roundFlip ? "question" : "answer";
  const correctAns = selected.value === card[key];
  const duration = Math.min(performance.now() - questionStartTime, 20000);
  // const asnwerTime = blindRound
  //   ? duration -
  //     (getCountdownDuration(card) -
  //       LEARNING_RULES.stageSettings[card.wordLevel].blindTimeToAnswer)
  //   : duration;

  // console.log(duration, asnwerTime);

  updateCountdownProgress(card, duration);

  const didTimeout = roundState.firstTry
    ? duration >= getCountdownDuration(card)
    : false;

  const answerCategory = evaluateAnswer(correctAns, mode, duration, didTimeout);

  return {
    correctAns,
    duration,
    answerCategory,
    didTimeout,
  };
}

function applyAnswerState(card, result) {
  const { correctAns, duration, answerCategory } = result;
  const score = correctAns ? calcScore(answerCategory, card) : 0;
  console.log(score);
  if (correctAns) {
    card.recalls.push({
      [ANSWERS_CATEGORIES[answerCategory].label]: Math.floor(duration),
    });
  }
  console.log(card);

  saveSessionStats(
    card,
    answerCategory,
    duration,
    roundState.firstTry,
    correctAns,
    score,
  );

  roundState.submitted = true;

  if (roundState.firstTry) {
    card.engaged += 1;
    totalQs += 1;
    updateFeedbackGrid(ANSWERS_CATEGORIES[answerCategory].label);

    card.scores.push(score);
    if (card.scores.length > 20) card.scores.shift();
    card.firstAnswersHistory.push(ANSWERS_CATEGORIES[answerCategory].label);
  }

  roundState.currentTries++;

  // const fastStreakCount = countFastStreak(card);
  applyCooldown(card, answerCategory);
}

function applyCorrectScore() {
  if (roundState.currentTries === 1) {
    globalScore += 100;
  } else if (roundState.currentTries === 2) {
    globalScore += 60;
  } else {
    globalScore += 20;
  }

  const bonuses = LEARNING_RULES.scoring.streakBonuses;

  bonuses.forEach(({ streak, type, value }) => {
    if (globalStreak === streak) {
      if (type === "add") globalScore += value;
      if (type === "mult") globalScore *= value;
    }
  });
}

function getMessage(category, currentTries) {
  const message = FEEDBACK_MEESAGES.answers[category][uiLang];
  return typeof message === "function" ? message(currentTries) : message;
}

function showMsg(text) {
  bubble.classList.remove("invisible");
  feedback.textContent = text;
}

function scheduleCorrectFeedbackReset(category) {
  clearTimeout(correctFeedbackTimeout);

  correctFeedbackTimeout = setTimeout(() => {
    bubble.classList.add("invisible");
    feedbackBg.classList.remove("correct_bg");
    feedbackBg.classList.remove("late_bg");
  }, ANSWERS_CATEGORIES[category].overlayDuration);
}

function applyCorrectFeedbackStyles(category) {
  if (category === ANSWER_KEYS.LATE_CORRECT) {
    feedbackBg.classList.add("late_bg");
  } else if (
    category === ANSWER_KEYS.VERY_FAST_CORRECT ||
    category === ANSWER_KEYS.FIRST_CORRECT ||
    category === ANSWER_KEYS.FAST_CORRECT ||
    category === ANSWER_KEYS.SLOW_CORRECT ||
    category === ANSWER_KEYS.CORRECT_GUESS ||
    category === ANSWER_KEYS.RECOVERY_CORRECT
  ) {
    feedbackBg.classList.add("correct_bg");
  }
  // } else if (category === ANSWER_KEYS.RECOVERY_CORRECT) {
  //   feedbackBg.classList.add("late_bg");
  // }
  scheduleCorrectFeedbackReset(category);
}

function finalizeCorrectFeedbackUI() {
  bubble.classList.add("invisible");
}

function stopQuestionTimers() {
  if (questionClock) clearInterval(questionClock);
}

function resetWrongFeedbackUI() {
  bubble.classList.add("invisible");
  feedbackBg.classList.remove("wrong_bg");
  feedback.textContent = "";
}

function restoreRetryUI() {
  knowOrGuess.classList.add("hidden");
  submitMainBtn.classList.remove("hidden");
}

function dimAnswer(selection) {
  const label = selection.closest("li");

  feedbackBg.classList.add("wrong_bg");
  submitMainBtn.classList.add("inactive");

  if (label) label.classList.add("wrong");

  selection.disabled = true;
  selection.checked = false;
}

function calcScore(answerCategory, card) {
  const categoryScore = ANSWERS_CATEGORIES[answerCategory].score;
  const roundBonus = LEARNING_RULES.stageSettings[card.wordLevel].score;
  const score = Math.min(20, Math.round(categoryScore + roundBonus));

  return score;

  // card.scores.push(score);
  // if (card.scores.length > 20) card.scores.shift();

  // card.last5Scores.push(qScore);
  // if (card.last5Scores.length > 5) card.last5Scores.shift();

  // card.recentScore = card.last5Scores.reduce((sum, val) => sum + val, 0);
}

function updateFeedbackGrid(answerCategoryLabel) {
  // let classToAdd;
  // if (answerCategory === "correct") {
  //   classToAdd = "correct_answer";
  // } else if (answerCategory === "guess") {
  //   classToAdd = "guess_answer";
  // } else if (answerCategory === "late_correct") {
  //   classToAdd = "late_answer";
  // } else if (answerCategory === "wrong") {
  //   classToAdd = "wrong_answer";
  // }
  const cube = document.createElement("div");
  cube.classList.add("cube");
  cube.classList.add(answerCategoryLabel);
  feedGrid.append(cube);
  summaryGrid.append(cube);
  const allCubes = document.getElementsByClassName("cube");
  const numberOfCubes = allCubes.length;
  for (const cube of allCubes) {
    if (numberOfCubes <= 30) {
      cube.style.width = "15px";
      cube.style.height = "15px";
    } else if (numberOfCubes <= 60) {
      cube.style.width = "11px";
      cube.style.height = "11px";
    } else if (numberOfCubes <= 96) {
      cube.style.width = "6px";
      cube.style.height = "6px";
    } else {
      cube.style.width = "4px";
      cube.style.height = "4px";
    }
  }
}

function showAnswersCircles(card) {
  lastAnswers.innerHTML = "";

  const lastFiveAnswers = card.firstAnswersHistory.slice(-5);

  lastFiveAnswers.forEach((circle, index) => {
    const el = document.createElement("div");
    el.classList.add("answers_circle", circle);
    // 👇 mark the last (most recent) one
    if (index === lastFiveAnswers.length - 1) {
      el.classList.add("latest_circle");
    }

    lastAnswers.appendChild(el);
  });
}

function getSelectedAnswer() {
  return document.querySelector('input[name="answer"]:checked');
}

function getSelectedLanguage() {
  return document.querySelector('input[name="language"]:checked');
}

function showNoSelectionMessage() {
  roundState.btnDisabled = false;
  showMsg(FEEDBACK_MEESAGES.noAnswer[uiLang]);
  setTimeout(() => {
    bubble.classList.add("invisible");
    feedback.textContent = "";
  }, 800);
}

function updateCountdownProgress(card, duration) {
  if (roundState.firstTry) {
    const totalMs = getCountdownDuration(card);
    const progress = Math.min(duration / totalMs, 1);
    const width = 100 * (1 - progress);
    countdown.style.width = `${width}%`;
  }
}

// function finalizeTimeoutState(result) {
//   if (firstTry && countdownRound) {
//     timeOut = result.didTimeout;
//   }
// }

function resetSubmitButtons() {
  roundState.btnDisabled = false;
  document.querySelectorAll(".submit").forEach((btn) => {
    btn.disabled = false;
  });
}

function startQuestionTimer() {
  questionStartTime = performance.now();
}

function startSessionTimer() {
  sessionStartTime = performance.now();

  function tick() {
    const elapsedSeconds = Math.floor(
      (performance.now() - sessionStartTime) / 1000,
    );
    const seconds = String(elapsedSeconds % 60).padStart(2, "0");
    const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
    sessionTimer.textContent = `${minutes}:${seconds}`;
  }
  tick();
  sessionClock = setInterval(tick, 1000);
}

function renderStats() {
  scoreStat.textContent = `${globalScore}`;
  streakStat.textContent = `${globalStreak}`;
  totalFrom.textContent = `${totalCorrect}/${totalQs}`;
  // totalFrom.textContent = `${totalCorrect} מתוך ${totalQs} (ניחושים ${correctGuesses})`;
}

// function renderTimer(time = "00:00") {
//   questionTimer.textContent = time;
// }

function startCountDown(card) {
  countdownCon.style.display = "block";

  const totalMs = getCountdownDuration(card);

  if (countdownInterval) clearInterval(countdownInterval);

  function tick() {
    const elapsed = performance.now() - questionStartTime;
    const progress = Math.min(elapsed / totalMs, 1);
    const width = 100 * (1 - progress);

    countdown.style.width = `${width}%`;

    if (roundState.submitted) {
      clearInterval(countdownInterval);
      return;
    }

    if (progress >= 1) {
      clearInterval(countdownInterval);
      roundState.timeOut = true;
    }
  }

  tick();
  countdownInterval = setInterval(tick, 50);
}

function startBlindPhase(card, onDone) {
  const blindMs = getBlindDuration(card);

  countdownCon.style.display = "block";
  setBlindCircleProgress(0);

  list.style.opacity = "0";
  list.style.pointerEvents = "none";

  blindRecallLogo.classList.remove("hidden");
  blindCounter.classList.remove("hidden");

  if (flashEye) clearInterval(flashEye);
  if (blindRevealTimeout) clearTimeout(blindRevealTimeout);
  if (countdownInterval) clearInterval(countdownInterval);

  flashEye = setInterval(() => {
    // blindRecallLogo.classList.toggle("hidden");
  }, 500);

  const blindStart = performance.now();

  function tick() {
    const elapsed = performance.now() - blindStart;
    const progress = Math.min(elapsed / blindMs, 1);

    setBlindCircleProgress(progress);

    if (progress >= 1) {
      clearInterval(countdownInterval);
      clearInterval(flashEye);

      blindRecallLogo.classList.add("hidden");
      blindCounter.classList.add("hidden");
      list.style.opacity = "1";
      list.style.pointerEvents = "auto";

      setBlindCircleProgress(0); // reset to full for next blind round
      onDone();
    }
  }

  tick();
  countdownInterval = setInterval(tick, 50);
}

function setBlindCircleProgress(progress) {
  const offset = circumference * progress;
  circle.style.strokeDashoffset = `${offset}`;
}

function onSubmit(e) {
  e.preventDefault();

  const card = chosenCard;
  const button = e.currentTarget;

  if (roundState.btnDisabled) return;
  roundState.btnDisabled = true;

  const mode = button.dataset.mode;
  const selected = getSelectedAnswer();

  if (!selected) {
    showNoSelectionMessage();
    return;
  }

  const result = getAnswerResult(card, selected, mode);
  console.log(result);
  applyAnswerState(card, result, mode);
  handleAnswerOutcome(card, selected, result);
}

function onStart(e) {
  e.preventDefault();
  const selected = getSelectedLanguage();
  if (!selected) {
    return;
  }
  courseLang = selected;
  console.log(courseLang.value);
  navigate("app");
  startApp();
}

function resetState() {
  if (correctFeedbackTimeout) clearTimeout(correctFeedbackTimeout);
  if (overlayTimeout) clearTimeout(overlayTimeout);
  countdown.style.width = `100%`;

  overlay.classList.remove("show");
  overlayTimeout = null;
  overlayMinTimeDone = false;
  isHolding = false;
  pendingNext = null;

  bubble.classList.add("invisible");
  feedbackBg.classList.remove("correct_bg", "late_bg", "wrong_bg");

  flipLogo.style.display = "none";
  countdownCon.style.display = "none";
  blindRecallLogo.classList.add("hidden");
  blindCounter.classList.add("hidden");

  if (flashEye) clearInterval(flashEye);
  if (questionClock) clearInterval(questionClock);
  if (countdownInterval) clearInterval(countdownInterval);
  if (blindRevealTimeout) clearTimeout(blindRevealTimeout);

  list.style.opacity = "1";
  list.style.pointerEvents = "auto";

  submitButtons.forEach((button) => {
    button.disabled = false;
  });

  roundState = createDefaultRoundState();
  // roundState.currentTries = 0;
  // roundState.firstTry = true;
  // roundState.roundFlip = false;
  // roundState.blindRound = false;
  // countdownRound = false;
  // roundState.btnDisabled = false;
  // roundState.timeOut = false;
  // roundState.submitted = false;

  pickQuestionAndAnswers();
  if (!chosenCard) {
    qText.textContent = "🎉 סיימת את כל המילים!";
    list.innerHTML = "";
    return;
  }

  updateUI();

  // startQuestionTimer();

  // if (countdownRound) {
  if (roundState.blindRound) {
    startBlindPhase(chosenCard, () => {
      startQuestionTimer();
      startCountDown(chosenCard);
    });
  } else {
    startQuestionTimer();
    startCountDown(chosenCard);
  }
  // } else {
  //   startQuestionTimer();
  // }
}

function startApp() {
  // startBtn.style.display = "none";

  endSessionBtn.classList.add("inactive");
  sessionStarted = false;

  // endSessionBtn.disabled = true;

  if (sessionClock) clearInterval(sessionClock);
  sessionTimer.textContent = "00:00";
  sessionState = resetSessionStats();
  currentSessionArr = [];
  // currentSessionStats = new Map();

  feedGrid.textContent = "";
  // loadProgress();
  resetState();
  renderStats();
  startSessionTimer();
}

function updateUI() {
  if (roundState.roundFlip) flipLogo.style.display = "block";
  animatePop(qText);
  knowOrGuess.classList.add("hidden");
  submitMainBtn.classList.remove("hidden");
  feedback.textContent = "";
  submitMainBtn.classList.add("inactive");
}

function removeWord() {
  chosenCard.isRemoved = true;
  chosenCard.inCycle = false;
  // saveProgress();
  feedback.textContent = "המילה הוסרה מהמאגר";
  setTimeout(resetState, 2000);
}

list.addEventListener("change", (e) => {
  if (e.target.name === "answer") {
    if (roundState.firstTry) {
      submitMainBtn.classList.add("hidden");
      knowOrGuess.classList.remove("hidden");
    } else {
      submitMainBtn.classList.remove("inactive");
    }
  }
});

languageSelection.addEventListener("change", (e) => {
  if (e.target.name === "language") {
    homeStartBtn.classList.add("enable_start");
  }
});

langugaeBtn.addEventListener("click", () => {
  uiLang === "en" ? (uiLang = "he") : (uiLang = "en");
  setUiText(uiLang);
  saveProgress();
});

resetbtn.addEventListener("click", () => {
  resetProgress();
  navigate("home");
});

submitButtons.forEach((button) => {
  button.addEventListener("click", onSubmit);
});

removeWordBtn.addEventListener("click", removeWord);
// startBtn.addEventListener("click", startApp);

homeStartBtn.addEventListener("click", onStart);

studyMoreBtn.addEventListener("click", () => {
  navigate("app");
  startApp();
});

backHomeBtn.addEventListener("click", () => {
  navigate("home");
});

// function checkUnresolvedLastQuestion() {
//   const sessionCards = Array.from(sessionState.sessionCards.values());
//   const lastCard = sessionCards.at(-1);
//   if (!lastCard.recalls.at(-1))
//     lastCard.recalls.push({ category: "unresolved", time: 5000 });
// }

endSessionBtn.addEventListener("click", () => {
  if (sessionStarted) {
    stopSession();
    // checkUnresolvedLastQuestion();
    renderSummary();
    navigate("summary");
  } else {
    if (roundState.firstTry) {
      showMsg(FEEDBACK_MEESAGES.sessionError.noData[uiLang]);
    } else {
      showMsg(FEEDBACK_MEESAGES.sessionError.notResolved[uiLang]);
    }
    setTimeout(() => {
      bubble.classList.add("invisible");
      feedback.textContent = "";
    }, 1000);
  }
});

//ANIMATION

function animatePop(el) {
  el.classList.remove("pop");
  void el.offsetWidth; // force reflow
  el.classList.add("pop");
}

startAnimations();

navigate("home");

// api sentences

mainCrow.addEventListener("click", async () => {
  const data = await getExampleSentence(chosenCard.question, chosenCard.answer);
  console.log(data);
  showMsg(data.sentence);
});

async function getExampleSentence(word, meaning = "", partOfSpeech = "") {
  const res = await fetch("http://localhost:3001/example-sentence", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      word,
      meaning,
      partOfSpeech,
      level: "A2",
      nativeLanguage: "Hebrew",
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || errorData?.error || "Request failed");
  }

  return res.json();
}
// const data = await getExampleSentence("old", "ישן", "שם תואר");

// console.log(data);
