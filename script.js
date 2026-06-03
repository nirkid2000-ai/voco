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

import { uiTexts, setUiText } from "./texts.js";

// import { Messages } from "/messages.js";

import { startAnimations } from "./animations.js";

console.log("codeBegaun");

// const appName = document.querySelector(".the_name");
const tagline = document.querySelector(".tagline");
const homeScreen = document.getElementById("home-screen");
const appScreen = document.getElementById("app-screen");
const summaryScreen = document.getElementById("summary-screen");
const btns = document.querySelector(".btns");

const courseSelection = document.querySelector(".course_selection");
const englishCourseBtn = document.querySelector(".english_course");
const hebrewCourseBtn = document.querySelector(".hebrew_course");
const spanishCourseBtn = document.querySelector(".spanish_course");
const latvianCourseBtn = document.querySelector(".latvian_course");

const homeStartBtn = document.getElementById("home-start-btn");
const studyMoreBtn = document.getElementById("study-more-btn");
// const languageBtn = document.querySelector(".language_ui_btn");

const nativeLanguageBtns = document.querySelectorAll(
  'input[name="native_lang"]',
);
const hebrewUiLangBtn = document.querySelector(
  'input[name="native_lang"][value="he"]',
);
const englishUiLangBtn = document.querySelector(
  'input[name="native_lang"][value="en"]',
);

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
const closeWordBtn = document.querySelector(".close_word");

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

const removeWordBtn = document.querySelector(".word_remove_btn");
const removeScreen = document.querySelector(".remove_screen");
const removeQuestionText = document.querySelector(".remove_question");
const removeConfrimBtn = document.querySelector(".yes_remove");
const removeCancelBtn = document.querySelector(".no_remove");
const wordRemovedText = document.querySelector(".word_removed_text");

const resetProgressScreen = document.querySelector(".reset_progress_screen");
const resetQuestionText = document.querySelector(".reset_progress_question");
const resetConfrimBtn = document.querySelector(".yes_reset");
const resetCancelBtn = document.querySelector(".no_reset");

const blindRecallLogo = document.querySelector(".blind_recall");
const blindCounter = document.querySelector(".blind_counter");
const flipLogo = document.querySelector(".flip_logo");
const feedGrid = document.querySelector(".fb_grid");
const summaryGrid = document.querySelector(".summary_grid");
// const startBtn = document.querySelector(".start");
const overlay = document.querySelector(".meaning_overlay");
const expandedWord = document.querySelector(".word_expaneded");
const pressInfo = document.querySelector(".press_expand");
const cardStats = document.querySelector(".card_stats");
const wordNoteArea = document.getElementById("note_text");
const sentenceText = document.getElementById("sentence");
const translationText = document.getElementById("translation");
const sentenceTextArea = document.querySelector(".sentence_text");
const pin = document.querySelector(".pin");
const overlayWord = document.querySelector(".meaning_word");
const overlayText = document.querySelector(".meaning_text");
// const overlayExample = document.querySelector(".meaning_example");
const overlayTime = document.querySelector(".time_to_answer");
const overlayAvg = document.querySelector(".avg_answer");
const overlayCooldown = document.querySelector(".next_cooldown");
const lastAnswers = document.querySelector(".last_answers");
const addNoteBtn = document.querySelector(".add_note");
const showSentenceBtn = document.querySelector(".show_sentence");

const mainWordBtns = document.querySelector(".main_word_btns");
const openNoteBtns = document.querySelector(".open_note_btns");
const saveNoteBtn = document.querySelector(".save_note");
const closeNoteBtn = document.querySelector(".close_note");
const giveTipBtn = document.querySelector(".give_tip");

const openSentenceBtns = document.querySelector(".open_sentence_btns");
const giveSentenceBtn = document.querySelector(".give_sentence");
const saveSentenceBtn = document.querySelector(".save_sentence");
const closeSentenceBtn = document.querySelector(".close_sentence");
const sentenceLoader = document.getElementById("loading_dots");

const bubble = document.querySelector(".bubble_wrap");

const mainCrow = document.getElementById("main_crow");

const summaryCon = document.querySelector(".summary_stats");

const circle = document.getElementById("progressCircle");
const radius = 45;
const circumference = 2 * Math.PI * radius;

const uiElements = {
  countdown,
  bubble,
  courseSelection,
  knowOrGuess,
  menuBtns,
  wordTop,
  tagline,
  hebrewUiLangBtn,
  englishUiLangBtn,
  englishCourseBtn,
  hebrewCourseBtn,
  spanishCourseBtn,
  latvianCourseBtn,
  homeStartBtn,
  diffLabel,
  masteryLabel,
  submitMainBtn,
  submitKnowBtn,
  submitGuessBtn,
  backHomeBtn,
  endSessionBtn,
  resetbtn,
  timerLabel,
  studyMoreBtn,
  expandedWord,
  removeWordBtn,
  closeWordBtn,
  saveNoteBtn,
  closeNoteBtn,
  showSentenceBtn,
  giveSentenceBtn,
  saveSentenceBtn,
  closeSentenceBtn,
  giveTipBtn,
  pressInfo,
  sentenceText,
  translationText,
  removeScreen,
  removeQuestionText,
  removeConfrimBtn,
  removeCancelBtn,
  wordRemovedText,
  resetQuestionText,
  resetConfrimBtn,
  resetCancelBtn,
};

circle.style.strokeDasharray = `${circumference}`;
circle.style.strokeDashoffset = `0`;

const STORAGE_KEY = "vocab-app-progress-v2";
const UI_LANG_KEY = "vocab-app-ui-lang-v1";

// function saveProgress() {
//   const cardsProgress = Object.fromEntries(
//     cards.map((card) => [
//       card.id,
//       {
//         wordLevel: card.wordLevel,
//         scores: card.scores,
//         // last5Scores: card.last5Scores,
//         wordScore: card.wordScore,
//         engaged: card.engaged,
//         rightAnswers: card.rightAnswers,
//         wordStreak: card.wordStreak,
//         levelStreak: card.levelStreak,
//         wrongAnswers: card.wrongAnswers,
//         accuracy: card.accuracy,
//         wrongTries: card.wrongTries,
//         recalls: card.recalls,
//         firstAnswersHistory: card.firstAnswersHistory,
//         coolDown: card.coolDown,
//         inCycle: card.inCycle,
//         cooldownUntil: card.cooldownUntil,
//         isRemoved: card.isRemoved,
//       },
//     ]),
//   );

//   // const Uilangugae = uiLang;

//   const state = {
//     course,
//     uiLang,
//     cardsProgress,
//     globalScore,
//     globalStreak,
//     correctGuesses,
//     totalGuesses,
//     totalCorrect,
//     totalQs,
//   };

//   try {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
//   } catch (err) {
//     console.error("Failed to save progress:", err);
//   }
// }

// function loadProgress(course, uiLang) {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY);

//     cards = createInitialCards(course, uiLang);

//     if (!raw) {
//       buildCardsLookup();
//       return;
//     }

//     const state = JSON.parse(raw);
//     if (!state) {
//       buildCardsLookup();
//       return;
//     }

//     if (state.cardsProgress) {
//       cards = cards.map((card) => {
//         const savedProgress = state.cardsProgress[card.id];
//         return savedProgress ? { ...card, ...savedProgress } : card;
//       });
//     }

//     buildCardsLookup();

//     uiLang = state.uiLang ?? "he";
//     course = state.course ?? "english";

//     globalScore = state.globalScore ?? 0;
//     globalStreak = state.globalStreak ?? 0;
//     correctGuesses = state.correctGuesses ?? 0;
//     totalGuesses = state.totalGuesses ?? 0;
//     totalCorrect = state.totalCorrect ?? 0;
//     totalQs = state.totalQs ?? 0;
//   } catch (err) {
//     console.error("Failed to load progress:", err);
//     cards = createInitialCards(course, uiLang);
//     buildCardsLookup();
//   }
// }

function saveProgress() {
  const cardsProgress = Object.fromEntries(
    cards.map((card) => [
      card.id,
      {
        wordLevel: card.wordLevel,
        scores: card.scores,
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
        note: card.note,
        sentence: card.sentence,
      },
    ]),
  );

  const state = {
    cardsProgress,
    globalScore,
    globalStreak,
    correctGuesses,
    totalGuesses,
    totalCorrect,
    totalQs,
  };

  try {
    const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    // 🔑 store under course key
    allProgress[course] = state;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
  } catch (err) {
    console.error("Failed to save progress:", err);
  }
}

function loadProgress(selectedCourse) {
  try {
    course = selectedCourse;
    cards = createInitialCards(course, uiLang);
    console.log("loaded");

    const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    const state = allProgress[course];

    if (!state) {
      buildCardsLookup();
      globalScore = 0;
      globalStreak = 0;
      correctGuesses = 0;
      totalGuesses = 0;
      totalCorrect = 0;
      totalQs = 0;
      return;
    }

    if (state.cardsProgress) {
      cards = cards.map((card) => {
        const saved = state.cardsProgress[card.id];
        return saved ? { ...card, ...saved } : card;
      });
    }

    buildCardsLookup();

    globalScore = state.globalScore ?? 0;
    globalStreak = state.globalStreak ?? 0;
    correctGuesses = state.correctGuesses ?? 0;
    totalGuesses = state.totalGuesses ?? 0;
    totalCorrect = state.totalCorrect ?? 0;
    totalQs = state.totalQs ?? 0;

    console.log("progress loaded", course, cards, allProgress, state);
  } catch (err) {
    console.error("Failed to load progress:", err);
    cards = createInitialCards(selectedCourse, uiLang);
    buildCardsLookup();
    globalScore = 0;
    globalStreak = 0;
    correctGuesses = 0;
    totalGuesses = 0;
    totalCorrect = 0;
    totalQs = 0;
  }
}

// function resetProgress(course, uiLang) {
//   localStorage.removeItem(STORAGE_KEY);

//   cards = createInitialCards(course, uiLang);
//   buildCardsLookup();
//   globalScore = 0;
//   globalStreak = 0;
//   correctGuesses = 0;
//   totalGuesses = 0;
//   totalCorrect = 0;
//   totalQs = 0;
//   list.style.display = "flex";
//   if (sessionClock) clearInterval(sessionClock);
// }

// function resetProgress() {
//   finishOverlay();
//   if (!course) return;
//   document.querySelectorAll('input[name="course"]').forEach((radio) => {
//     radio.checked = false;
//   });

//   const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

//   delete allProgress[course];

//   localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));

//   cards = createInitialCards(course, uiLang);
//   buildCardsLookup();

//   globalScore = 0;
//   globalStreak = 0;
//   correctGuesses = 0;
//   totalGuesses = 0;
//   totalCorrect = 0;
//   totalQs = 0;
// }

let cards;
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
// addNoteBtn;
let sessionStartTime;
let countdownInterval;
let blindRevealTimeout;
let flashEye;
let questionClock;
let sessionClock;

let overlayTimeout = null;
let correctFeedbackTimeout = null;
// let isHolding = false;
// let pendingNext = null;
// let overlayMinTimeDone = false;

let uiLang = "he";
let course;

let sessionStarted;

// setUiText(course);

// setUiText(uiLang);

// let currentSessionStats = new Map();
console.log(uiLang);

loadUiLang();
console.log(uiLang);
setUiText(uiLang, uiElements);

function saveUiLang() {
  try {
    localStorage.setItem(UI_LANG_KEY, uiLang);
  } catch (err) {
    console.error("Failed to save UI language:", err);
  }
}

function loadUiLang() {
  try {
    const saved = localStorage.getItem(UI_LANG_KEY);
    if (saved) uiLang = saved;
  } catch (err) {
    console.error("Failed to load UI language:", err);
  }
}

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

function summaryLine(label, value) {
  return `
    <div class="summary_line">
      <label class="summary_label">${label}</label>
      <label class="summary_stat">${value}</label>
    </div>
  `;
}

function renderSummary() {
  const sessionTimeMs = performance.now() - sessionStartTime;
  const sessionTime = msToTime(sessionTimeMs);
  const enriched = getSessionSummaryFromStats();

  const uniqueWords = enriched.length;
  const newWords = enriched.filter((word) => word.newWord);
  const learnedNewWords = enriched.filter((word) => word.learnedNew);
  const improvedWords = enriched.filter((word) => word.improved);

  const totalQuestions = sessionState.sessionStats.allSessionAnswers.length;

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

  const t = uiTexts.summaryLabels;
  const headerText = uiTexts.summaryHeader[uiLang];
  const unitText = FEEDBACK_MEESAGES.overlay.units[uiLang];

  const rows = [
    [t.sessionDuration[uiLang], sessionTime],
    [t.totalQuestions[uiLang], totalQuestions],
    [t.totalPassed[uiLang], totalSessionPassed],
    [t.totalKnown[uiLang], totalSessionKnown],
    [t.correctGuesses[uiLang], correctGuesses],
    [t.totalFailed[uiLang], totalSessionNotPassed],
    [t.avgRecallTime[uiLang], `${avgSessionRecallSeconds} ${unitText}`],
    [t.longestStreak[uiLang], longestCorrectStreak],
    [t.uniqueWords[uiLang], uniqueWords],
    [t.improved[uiLang], improvedWords.length],
    [t.newWords[uiLang], newWords.length],
    [t.newLearned[uiLang], learnedNewWords.length],
    [t.strongest[uiLang], strongestWord ? strongestWord.question : ""],
    [t.weakest[uiLang], weakestWord ? weakestWord.question : ""],
  ];

  const rowsHtml = rows
    .map(([label, value]) => summaryLine(label, value))
    .join("");

  summaryCon.innerHTML = `
  <div class="summary_con ${uiLang === "he" ? "rtl" : "ltr"}">
    <h1 class="summary_header">${headerText}</h1>
    ${rowsHtml}
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

function updateOpenNoteBtn() {
  if (chosenCard.note) {
    console.log(chosenCard.note);
    console.log("note found");
    addNoteBtn.textContent = uiTexts.buttons.note.openNote[uiLang];
  } else {
    console.log("no note found");
    addNoteBtn.textContent = uiTexts.buttons.note.addNote[uiLang];
  }
}

function updateGiveSentenceBtn() {
  if (chosenCard.sentenceData?.sentence) {
    console.log(chosenCard ?? sentenceData.sentence);
    console.log("sentence found");
    showSentenceBtn.textContent = uiTexts.buttons.note.showSentence[uiLang];
  } else {
    console.log("no sentence found");
    showSentenceBtn.textContent = uiTexts.buttons.note.giveSentence[uiLang];
  }
}

function expandWord() {
  if (!isPinned) {
    console.log("expanded");
    console.log(pressInfo);
    pressInfo.classList.add("hidden");
    pin.style.display = "flex";
    expandedWord.classList.remove("hidden");
    knowOrGuess.classList.add("hidden");
    submitMainBtn.classList.add("hidden");
    closeWordBtn.classList.remove("hidden");
    btns.classList.remove("inactive");
    updateOpenNoteBtn();
    updateGiveSentenceBtn();
  }

  isPinned = true;
}

function closeWord() {
  finishOverlay();
}

closeWordBtn.addEventListener("click", closeWord);

// function togglePin() {
//   isPinned = !isPinned;
//   if (isPinned) {
//     console.log("pinned");
//     pin.style.display = "flex";
//     expandedWord.classList.remove("hidden");
//     knowOrGuess.classList.add("hidden");
//     submitMainBtn.classList.add("hidden");
//     closeWord.classList.remove("hidden");
//     btns.classList.remove("inactive");
//   }

//   if (!isPinned && overlayMinTimeDone) {
//     finishOverlay();
//   }
// }

// function holdStart() {
//   isHolding = true;
// }

// function holdEnd() {
//   if (!isHolding) return;
//   isHolding = false;}

// Hover/touch can extend visibility, but never shorten it.
// if (overlayMinTimeDone) {
//   finishOverlay();
// }

overlay.addEventListener("click", expandWord);

// function enableOverlayInteractions() {
//   overlay.addEventListener("click", togglePin);
// }

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
  btns.classList.add("inactive");
  // pendingNext = onDone;
  // overlayMinTimeDone = false;
  const questionKey = roundState.roundFlip ? "answer" : "question";
  const answerKey = roundState.roundFlip ? "question" : "answer";
  console.log(answerKey);
  console.log(card);

  showAnswersCircles(card);
  overlayWord.textContent = card[questionKey];
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
    FEEDBACK_MEESAGES.overlay.avgTime[uiLang] + msToSeconds(avgMs);
  overlayCooldown.textContent =
    FEEDBACK_MEESAGES.overlay.cooldownTime[uiLang] + msToTime(card.coolDown);

  // overlayExample.textContent = LEARNING_RULES.stageSettings[card.wordLevel]
  //   .example
  //   ? card.example || "..."
  //   : "";

  overlay.classList.add("show");
  qText.classList.add("on_top");

  clearTimeout(overlayTimeout);
  overlayTimeout = setTimeout(() => {
    // overlayMinTimeDone = true;

    if (!isPinned) {
      finishOverlay();
    }
  }, ANSWERS_CATEGORIES[category].overlayDuration);
}

function finishOverlay() {
  // qText.classList.remove("on_top");
  pin.style.display = "none";
  expandedWord.classList.add("hidden");
  closeWordBtn.classList.add("hidden");
  wordNoteArea.classList.add("hidden");
  cardStats.classList.remove("hidden");

  clearTimeout(overlayTimeout);
  overlayTimeout = null;
  // overlayMinTimeDone = false;
  isPinned = false;

  overlay.classList.remove("show");

  finalizeCorrectFeedbackUI();
  resetState();
}

// enableOverlayInteractions();

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
  btns.classList.remove("inactive");
}

function updateWordStats(card) {
  levelText.textContent = uiTexts.wordStatus[card.wordLevel][uiLang];
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

  showMeaning(card, category, speedAvg);
  // showMeaning(card, category, speedAvg, () => {
  //   finalizeCorrectFeedbackUI();
  //   resetState();
  // });
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
  const duration = Math.min(
    performance.now() - questionStartTime,
    LEARNING_RULES.maximumRecallDeafult,
  );
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

function showMsg(text, duration) {
  bubble.classList.remove("invisible");
  feedback.textContent = text;
  if (duration) {
    setTimeout(() => {
      bubble.classList.add("invisible");
      feedback.textContent = "";
    }, duration);
  }
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
  const cube1 = document.createElement("div");
  cube1.classList.add("cube", answerCategoryLabel);
  feedGrid.append(cube1);

  const cube2 = document.createElement("div");
  cube2.classList.add("cube", answerCategoryLabel);
  summaryGrid.append(cube2);

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

function getCourse() {
  return document.querySelector('input[name="course"]:checked');
}

function getNativeLanguage() {
  return document.querySelector('input[name="native_lang"]:checked');
}

function showNoSelectionMessage() {
  roundState.btnDisabled = false;
  showMsg(FEEDBACK_MEESAGES.noAnswer[uiLang], 800);
  // setTimeout(() => {
  //   bubble.classList.add("invisible");
  //   feedback.textContent = "";
  // }, 800);
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
  const selected = getCourse();
  console.log(selected);
  if (!selected) {
    return;
  }
  course = selected.value;
  loadProgress(course);
  navigate("app");
  startApp();
}

function resetState() {
  if (correctFeedbackTimeout) clearTimeout(correctFeedbackTimeout);
  if (overlayTimeout) clearTimeout(overlayTimeout);
  countdown.style.width = `100%`;
  isPinned = false;
  overlay.classList.remove("show");
  overlayTimeout = null;
  // overlayMinTimeDone = false;
  // isHolding = false;
  // pendingNext = null;

  expandedWord.classList.add("hidden");
  openNoteBtns.classList.add("hidden");
  mainWordBtns.classList.remove("hidden");
  pressInfo.classList.remove("hidden");
  closeWordBtn.classList.add("hidden");
  closeWordBtn.classList.add("hidden");
  wordNoteArea.value = "";
  wordNoteArea.classList.add("hidden");
  sentenceTextArea.classList.add("hidden");
  openSentenceBtns.classList.add("hidden");
  removeScreen.classList.add("hidden");
  wordRemovedText.classList.add("hidden");

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
  endSessionBtn.classList.add("inactive");
  sessionStarted = false;

  // endSessionBtn.disabled = true;

  if (sessionClock) clearInterval(sessionClock);
  sessionTimer.textContent = "00:00";
  sessionState = resetSessionStats();
  currentSessionArr = [];
  recentWordIds = new Set();

  // currentSessionStats = new Map();

  feedGrid.textContent = "";
  summaryGrid.textContent = ""; // loadProgress();
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

courseSelection.addEventListener("change", (e) => {
  if (e.target.name === "course") {
    homeStartBtn.classList.add("enable_start");
    console.log("button enabled");
  }
});

// languageBtn.addEventListener("click", () => {
//   uiLang = uiLang === "en" ? "he" : "en";
//   setUiText(uiLang, uiElements);
//   saveUiLang();
// });

function onLangugeSwitch() {
  console.log("language switch");
  uiLang = getNativeLanguage().value;
  console.log(uiLang);
  setUiText(uiLang, uiElements);
  saveUiLang();
}

// nativeLanguageBtn.addEventListener(){"click"

// }

nativeLanguageBtns.forEach((button) => {
  button.addEventListener("click", onLangugeSwitch);
});

function addNote() {
  // e.stopPropagation();
  console.log("clicked");
  console.log(cardStats);
  cardStats.classList.add("hidden");
  wordNoteArea.classList.remove("hidden");
  saveNoteBtn.classList.remove("hidden");
  openNoteBtns.classList.remove("hidden");
  mainWordBtns.classList.add("hidden");
  if (chosenCard.note) {
    wordNoteArea.value = chosenCard.note;
  }
  wordNoteArea.placeholder = uiTexts.tipHolder[uiLang];
}

function closeNote() {
  // e.stopPropagation();
  cardStats.classList.remove("hidden");
  mainWordBtns.classList.remove("hidden");
  wordNoteArea.classList.add("hidden");
  // saveNoteBtn.classList.add("hidden");
  openNoteBtns.classList.add("hidden");
  openSentenceBtns.classList.add("hidden");
  sentenceTextArea.classList.add("hidden");
  sentenceText.value = null;
  translationText.value = null;
}

function saveNote() {
  console.log("Note Saved");
  chosenCard.note = wordNoteArea.value;
  console.log(chosenCard);
  console.log(wordNoteArea.value);
  showMsg(FEEDBACK_MEESAGES.note.noteSaved[uiLang], 800);
  updateOpenNoteBtn();
  saveProgress();
}

function saveSentence() {
  console.log("Sentecne saved");
  chosenCard.sentenceData = {
    sentence: sentenceText.value,
    translation: translationText.value,
  };
  console.log(chosenCard);
  console.log(wordNoteArea.value);
  showMsg(FEEDBACK_MEESAGES.note.sentenceSaved[uiLang], 800);
  updateGiveSentenceBtn();
  saveProgress();
}

function openSentence() {
  console.log("Opening Sentence");
  wordNoteArea.value = chosenCard.sentence;
  showMsg(FEEDBACK_MEESAGES.note.sentenceSaved[uiLang], 800);
  updateOpenNoteBtn();
  saveProgress();
}

addNoteBtn.addEventListener("click", addNote);
saveNoteBtn.addEventListener("click", saveNote);
closeNoteBtn.addEventListener("click", closeNote);

saveSentenceBtn.addEventListener("click", saveSentence);
closeSentenceBtn.addEventListener("click", closeNote);

// wordNoteArea.addEventListener("click", (e) => e.stopPropagation());

// resetbtn.addEventListener("click", () => {
//   resetProgress();
//   navigate("home");
// });

submitButtons.forEach((button) => {
  button.addEventListener("click", onSubmit);
});

function removeWord() {
  chosenCard.isRemoved = true;
  chosenCard.inCycle = false;
  showMsg("המילה הוסרה", 2000);
  removeScreen.classList.add("hidden");
  expandedWord.classList.add("hidden");
  wordRemovedText.classList.remove("hidden");
  saveProgress();

  // setTimeout(resetState, 2000);
}
function removeWordScreen() {
  removeScreen.classList.remove("hidden");
}

function cancelRemove() {
  removeScreen.classList.add("hidden");
}

removeWordBtn.addEventListener("click", removeWordScreen);
removeConfrimBtn.addEventListener("click", removeWord);
removeCancelBtn.addEventListener("click", cancelRemove);

function resetProgress() {
  finishOverlay();
  if (!course) return;
  document.querySelectorAll('input[name="course"]').forEach((radio) => {
    radio.checked = false;
  });

  const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

  delete allProgress[course];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));

  cards = createInitialCards(course, uiLang);
  buildCardsLookup();

  globalScore = 0;
  globalStreak = 0;
  correctGuesses = 0;
  totalGuesses = 0;
  totalCorrect = 0;
  totalQs = 0;
  resetProgressScreen.classList.add("hidden");
  expandedWord.classList.add("hidden");
  navigate("home");
  // setTimeout(resetState, 2000);
}

function resetScreen() {
  resetProgressScreen.classList.remove("hidden");
}

function cancelReset() {
  resetProgressScreen.classList.add("hidden");
}

resetbtn.addEventListener("click", resetScreen);
resetConfrimBtn.addEventListener("click", resetProgress);
resetCancelBtn.addEventListener("click", cancelReset);

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

giveTipBtn.addEventListener("click", async () => {
  sentenceTextArea.classList.add("hidden");
  showMsg(FEEDBACK_MEESAGES.note.tipThinking[uiLang], 2500);
  const data = await giveTip(
    chosenCard.question,
    chosenCard.answer,
    course,
    uiLang,
  );
  console.log(data);
  wordNoteArea.value = data.tip;
});

async function generateSentence() {
  sentenceLoader.classList.remove("hidden");
  sentenceText.value = "";
  translationText.value = "";
  showMsg(FEEDBACK_MEESAGES.note.sentenceThinking[uiLang]);
  try {
    const data = await giveSentence(
      chosenCard.question,
      chosenCard.answer,
      course,
      uiLang,
    );
    console.log(data);
    sentenceText.value = data.sentence;
    translationText.value = data.translation;
  } catch (err) {
    console.log(err);
  } finally {
    console.log("loaded");
    sentenceLoader.classList.add("hidden");
    bubble.classList.add("invisible");
    feedback.textContent = "";
  }
}

giveSentenceBtn.addEventListener("click", generateSentence);

showSentenceBtn.addEventListener("click", () => {
  mainWordBtns.classList.add("hidden");
  cardStats.classList.add("hidden");
  wordNoteArea.classList.add("hidden");
  sentenceTextArea.classList.remove("hidden");
  saveSentenceBtn.classList.remove("hidden");
  openSentenceBtns.classList.remove("hidden");
  updateGiveSentenceBtn();
  if (chosenCard.sentenceData?.sentence) {
    console.log("theres a sentence already");
    sentenceText.value = chosenCard.sentenceData.sentence;
    translationText.value = chosenCard.sentenceData.translation;
  } else {
    generateSentence();
  }
});

async function giveSentence(word, meaning = "", language, partOfSpeech = "") {
  const res = await fetch("/api/example-sentence", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      word,
      meaning,
      language,
      partOfSpeech,
      // level: "A2",
      nativeLanguage: uiLang,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || errorData?.error || "Request failed");
  }

  return res.json();
}

async function giveTip(word, meaning = "", language, partOfSpeech = "") {
  const res = await fetch("/api/generate-tip", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      word,
      meaning,
      language,
      partOfSpeech,
      level: "A2",
      nativeLanguage: uiLang,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || errorData?.error || "Request failed");
  }

  return res.json();
}

// const data = await giveTip("old", "ישן", "שם תואר");

console.log("codeEnd");
