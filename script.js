"use strict";
import data from "/en200.js";
import { LEARNING_RULES, ANSWERS_CATEGORIES } from "/learningRules.js";
import {
  // getStageKey,
  shouldFlipNew,
  shouldBlindNew,
  getStarsFillNew,
  getStageStep,
  getMaxWordLevel,
  calculateCooldown,
  isWrongCategory,
} from "/learningHelpers.js";

const qText = document.querySelector(".q");
const levelText = document.querySelector(".word_level");
const difArrow = document.querySelector(".arrow");
const list = document.querySelector(".wordlist");
const submitMainBtn = document.querySelector(".main_ans");
const resetbtn = document.querySelector(".reset");
const knowOrGuess = document.querySelector(".knoworguess");
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
const startBtn = document.querySelector(".start");
const overlay = document.querySelector(".meaning_overlay");
const overlayWord = document.querySelector(".meaning_word");
const overlayText = document.querySelector(".meaning_text");
const overlayExample = document.querySelector(".meaning_example");
const overlayTime = document.querySelector(".time_to_answer");
const overlayAvg = document.querySelector(".avg_answer");
const overlayCooldown = document.querySelector(".next_cooldown");
const lastAnswers = document.querySelector(".last_answers");
const bubble = document.querySelector(".bubble_wrap");

const circle = document.getElementById("progressCircle");
const radius = 45;
const circumference = 2 * Math.PI * radius;

circle.style.strokeDasharray = `${circumference}`;
circle.style.strokeDashoffset = `0`;

const STORAGE_KEY = "vocab-app-progress-v1";

const INPUT_TYPE = getInputType();

function getInputType() {
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  return hasTouch ? "touch" : "pointer";
}

function createDefaultProgress() {
  return {
    wordLevel: 0,
    scores: [],
    last5Scores: [],
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

function createInitialCards() {
  return data.words.map((word, i) => ({
    id: i + 1,
    question: word.en,
    answer: word.he,
    diff: word.level,
    ...createDefaultProgress(),
  }));
}

function saveProgress() {
  const cardsProgress = Object.fromEntries(
    cards.map((card) => [
      card.id,
      {
        wordLevel: card.wordLevel,
        scores: card.scores,
        last5Scores: card.last5Scores,
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save progress:", err);
  }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    cards = createInitialCards();

    if (!raw) return;

    const state = JSON.parse(raw);
    if (!state) return;

    if (state.cardsProgress) {
      cards = cards.map((card) => {
        const savedProgress = state.cardsProgress[card.id];
        return savedProgress ? { ...card, ...savedProgress } : card;
      });
    }

    globalScore = state.globalScore ?? 0;
    globalStreak = state.globalStreak ?? 0;
    correctGuesses = state.correctGuesses ?? 0;
    totalGuesses = state.totalGuesses ?? 0;
    totalCorrect = state.totalCorrect ?? 0;
    totalQs = state.totalQs ?? 0;
  } catch (err) {
    console.error("Failed to load progress:", err);
    cards = createInitialCards();
  }
}

function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);

  cards = createInitialCards();

  globalScore = 0;
  globalStreak = 0;
  correctGuesses = 0;
  totalGuesses = 0;
  totalCorrect = 0;
  totalQs = 0;
  list.style.display = "flex";
  if (sessionClock) clearInterval(sessionClock);
  startApp();
}

let cards = createInitialCards();

// const ANSWERS_CATEGORIES = {
//   FAST_CORRECT: "fastCorrect",
//   FIRST_CORRECT: "correct",
//   SLOW_CORRECT: "slowCorrect",
//   LATE_CORRECT: "lateCorrect",
//   RECOVERY_CORRECT: "recoveryCorrect",
//   CORRECT_GUESS: "correctGuess",
//   WRONG: {
//     WRONG_GUESS: "wrongGuess",
//     WRONG_ANSWER: "wrongAnswer",
//     STRONG_WRONG: "strongWrong",
//   },
// };

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

let chosenCard;
// let firstTry = true;
// let currentTries = 0;
let globalStreak = 0;
let globalScore = 0;
let correctGuesses = 0;
let totalGuesses = 0;
let totalCorrect = 0;
let totalQs = 0;
let currentSession = new Map();
let currentSessionArr = [];
let questionStartTime;
let sessionStartTime;
// let btnDisabled = false;
// let roundFlip;
// let blindRound;
// let countdownRound;
let countdownInterval;
// let timeOut = false;
// let submitted = false;
let blindRevealTimeout;
let flashEye;
let questionClock;
let sessionClock;
let recentWordIds = [];

let overlayTimeout = null;
let correctFeedbackTimeout = null;
let isHolding = false;
let pendingNext = null;
let overlayMinTimeDone = false;

function createDefaultRoundState() {
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

function holdStart() {
  isHolding = true;
}

function holdEnd() {
  if (!isHolding) return;
  isHolding = false;

  // Hover/touch can extend visibility, but never shorten it.
  if (overlayMinTimeDone) {
    finishOverlay();
  }
}

function enableOverlayInteractions() {
  if (INPUT_TYPE === "touch") {
    overlay.addEventListener("pointerdown", holdStart);
    overlay.addEventListener("pointerup", holdEnd);
    overlay.addEventListener("pointerleave", holdEnd);
    overlay.addEventListener("pointercancel", holdEnd);
  } else {
    overlay.addEventListener("mouseenter", holdStart);
    overlay.addEventListener("mouseleave", holdEnd);
  }
}

enableOverlayInteractions();

function msToTime(milliseconds) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function msToSeconds(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const centiseconds = Math.floor((milliseconds % 1000) / 10);

  return `${String(seconds).padStart(2, "0")}:${String(centiseconds).padStart(2, "0")}`;
}

function showMeaning(card, speedAvg, onDone) {
  pendingNext = onDone;
  overlayMinTimeDone = false;
  const answerKey = roundState.roundFlip ? "question" : "answer";

  showAnswersCircles(card);
  overlayWord.textContent = card.question;
  overlayText.textContent = card[answerKey];
  overlayTime.textContent = `זמן מענה: ${msToSeconds(
    Object.values(card.recalls.at(-1))[0],
  )} שניות`;
  overlayAvg.textContent = `זמן מענה ממוצע: ${msToSeconds(speedAvg)} שניות`;
  overlayCooldown.textContent = `זמן קולדאון: ${msToTime(card.coolDown)}`;

  overlayExample.textContent = LEARNING_RULES.stageSettings[card.wordLevel]
    .example
    ? card.example || "..."
    : "";

  overlay.classList.add("show");

  clearTimeout(overlayTimeout);
  overlayTimeout = setTimeout(() => {
    overlayMinTimeDone = true;

    if (!isHolding) {
      finishOverlay();
    }
  }, 1000);
}

function finishOverlay() {
  clearTimeout(overlayTimeout);
  overlayTimeout = null;
  overlayMinTimeDone = false;
  isHolding = false;

  overlay.classList.remove("show");

  if (pendingNext) pendingNext();
  pendingNext = null;
}

function getInputOffset() {
  return LEARNING_RULES.inputOffsets[INPUT_TYPE] ?? 0;
}

// function getPromotionThreshold() {
//   return LEARNING_RULES.promotion.requiredLevelStreak;
// }
// function getPromotionThresholdNew(card) {
//   return LEARNING_RULES.stageSettings[card.word_status].maxLevel;
// }

function getDiffArrowPosition(card) {
  return LEARNING_RULES.diffLevels[card.diff];
}

function rememberShownWord(card) {
  recentWordIds.push(card.id);
  if (recentWordIds.length > LEARNING_RULES.minWordGap) {
    recentWordIds.shift();
  }
}

// function shouldCountdown(card) {
//   return true;
//   return !["new", "unknown", "recognized"].includes(card.word_status);
// }

function getCountdownDuration(card) {
  const step = getStageStep(card);
  return step ? step.countdown * 1000 + getInputOffset() : 0;
}

function chooseQuestion() {
  chosenCard = null;
  const now = Date.now();

  const allLiveCards = cards.filter((card) => !card.isRemoved);
  const filteredLiveCards = allLiveCards.filter(
    (card) => !recentWordIds.includes(card.id),
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
function updateWordStats(card) {
  levelText.textContent = LEARNING_RULES.stageSettings[card.wordLevel].status;
  difArrow.style.left = `${getDiffArrowPosition(card)}%`;
  if (roundState.submitted) {
    starsFill.classList.add("animate-fill");
  } else {
    starsFill.classList.remove("animate-fill");
  }
  starsFill.style.setProperty("--fill", `${getStarsFillNew(card)}%`);
}

function renderQuestion(card) {
  if (!card) return;
  renderQuestionText(card);
  updateWordStats(card);
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

function updateAccuracy(card) {
  card.accuracy = card.engaged > 0 ? card.rightAnswers / card.engaged : 0;
}

function promoteCard(card) {
  console.log(LEARNING_RULES.stageSettings[card.wordLevel].label);
  const maxLevel = getMaxWordLevel();

  card.levelStreak = 0;
  if (card.wordLevel === 0) {
    card.wordLevel = Math.min(card.wordLevel + 2, maxLevel);
  } else {
    card.wordLevel = Math.min(card.wordLevel + 1, maxLevel);
  }
  console.log(LEARNING_RULES.stageSettings[card.wordLevel].label);
}

function demoteCard(card) {
  const step = getStageStep(card);
  console.log(LEARNING_RULES.stageSettings[card.wordLevel].label);
  card.wordLevel = step.demoteTo[0];
  console.log(step.demoteTo[0]);
  card.levelStreak = step.demoteTo[1];
  console.log(step.demoteTo[1]);
  console.log(LEARNING_RULES.stageSettings[card.wordLevel].label);
}

function getTriesMessage(tries) {
  if (tries === 1) return "טעות ראשונה";
  if (tries === 2) return "טעות שנייה";
  if (tries === 3) return "טעות שלישית";
  // if (tries === 4) return "טעות רביעית";
  return `טעות מספר ${tries}`;
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

function checkLevelBoost(card) {
  const correctCount = card.firstAnswersHistory.filter(
    (answer) =>
      answer === ANSWERS_CATEGORIES.FIRST_CORRECT ||
      answer === ANSWERS_CATEGORIES.FAST_CORRECT,
  ).length;
  const fastCount = card.firstAnswersHistory.filter(
    (answer) => answer === ANSWERS_CATEGORIES.FAST_CORRECT,
  ).length;

  const boostRules = LEARNING_RULES.boost.earlyLevelBoost;

  if (
    card.engaged === boostRules.requiredEngaged &&
    correctCount === boostRules.requiredCorrect &&
    fastCount >= boostRules.requiredFast
  ) {
    console.log("LEVEL BOOST");
    return true;
  }
}

function handleFirstTryCorrect(card, category) {
  // if (card.word_status === "mastered" && timeOut) {
  //   card.levelStreak = 0;
  // }

  if (checkLevelBoost(card)) card.levelStreak += 1;

  if (
    category === ANSWERS_CATEGORIES.FIRST_CORRECT ||
    category === ANSWERS_CATEGORIES.FAST_CORRECT ||
    category === ANSWERS_CATEGORIES.SLOW_CORRECT
  ) {
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
  } else if (category === ANSWERS_CATEGORIES.CORRECT_GUESS) {
    correctGuesses += 1;
    totalGuesses += 1;
  }

  card.rightAnswers += 1;
  card.wordStreak += 1;
  globalStreak += 1;
  totalCorrect += 1;
  updateAccuracy(card);

  updateWordStats(card);
  currentSession.set(card.id, card);
  currentSessionArr.push(card);

  renderStats();

  saveProgress();
}

function handleFirstTryWrong(card, category) {
  if (category === ANSWERS_CATEGORIES.WRONG.WRONG_GUESS) {
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
  currentSession.set(card.id, card);
  currentSessionArr.push(card);

  renderStats();

  saveProgress();
}

function getMessage(category, currentTries) {
  const message = Messages[category];
  return typeof message === "function" ? message(currentTries) : message;
}

function showMsg(text) {
  bubble.classList.remove("invisible");
  feedback.textContent = text;
}

const Messages = {
  [ANSWERS_CATEGORIES.FAST_CORRECT]: "וואו! זה היה מהיר!",
  [ANSWERS_CATEGORIES.LATE_CORRECT]: "תשובה נכונה אבל מאוחר מדי",
  [ANSWERS_CATEGORIES.SLOW_CORRECT]: "תשובה נכונה אבל טיפה לאט ",
  [ANSWERS_CATEGORIES.FIRST_CORRECT]: "כל הכבוד! תשובה נכונה",
  [ANSWERS_CATEGORIES.CORRECT_GUESS]: "יפה. ניחוש מוצלח",
  [ANSWERS_CATEGORIES.RECOVERY_CORRECT]: "הפעם הצלחת",
  [ANSWERS_CATEGORIES.WRONG.STRONG_WRONG]: (currentTries) =>
    `${getTriesMessage(currentTries)} נסה שוב`,
  [ANSWERS_CATEGORIES.WRONG.WRONG_ANSWER]: (currentTries) =>
    `${getTriesMessage(currentTries)} נסה שוב`,
  [ANSWERS_CATEGORIES.WRONG.WRONG_GUESS]: "ניחוש לא מוצלח. נסו שוב...",
};

function scheduleCorrectFeedbackReset() {
  clearTimeout(correctFeedbackTimeout);

  correctFeedbackTimeout = setTimeout(() => {
    bubble.classList.add("invisible");
    feedbackBg.classList.remove("correct_bg");
    feedbackBg.classList.remove("late_bg");
  }, 1000);
}

function applyCorrectFeedbackStyles(category) {
  if (category === ANSWERS_CATEGORIES.LATE_CORRECT) {
    feedbackBg.classList.add("late_bg");
  } else if (
    category === ANSWERS_CATEGORIES.FIRST_CORRECT ||
    category === ANSWERS_CATEGORIES.FAST_CORRECT ||
    category === ANSWERS_CATEGORIES.SLOW_CORRECT ||
    category === ANSWERS_CATEGORIES.CORRECT_GUESS
  ) {
    feedbackBg.classList.add("correct_bg");
  } else if (category === ANSWERS_CATEGORIES.RECOVERY_CORRECT) {
    feedbackBg.classList.add("late_bg");
  }
  scheduleCorrectFeedbackReset();
}

function finalizeCorrectFeedbackUI() {
  bubble.classList.add("invisible");
}

function stopQuestionTimers() {
  if (questionClock) clearInterval(questionClock);
}

function runCorrectAnswerFlow(card, category, speedAvg) {
  if (roundState.firstTry) {
    handleFirstTryCorrect(card, category, speedAvg);
  }

  applyCorrectScore();
  renderStats();
  stopQuestionTimers();

  showMeaning(card, speedAvg, () => {
    finalizeCorrectFeedbackUI();
    resetState();
  });
}

function resetWrongFeedbackUI() {
  bubble.classList.add("invisible");
  feedbackBg.classList.remove("wrong_bg");
  feedback.textContent = "";
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

function restoreRetryUI() {
  knowOrGuess.classList.add("hidden");
  submitMainBtn.classList.remove("hidden");
}

function handleCorrectAnswer(card, category, speedAvg) {
  applyCorrectFeedbackStyles(category);
  runCorrectAnswerFlow(card, category, speedAvg);
}

function dimAnswer(selection) {
  const label = selection.closest("li");

  feedbackBg.classList.add("wrong_bg");
  submitMainBtn.classList.add("inactive");

  if (label) label.classList.add("wrong");

  selection.disabled = true;
  selection.checked = false;
}

function handleWrongAnswer(card, category) {
  applyWrongAnswerPenalty(card, category);
  restoreRetryUI();

  setTimeout(() => {
    resetWrongFeedbackUI();
  }, 1000);
}

// function countFastStreak(card) {
//   let streakCount = 0;
//   for (
//     let i = card.firstAnswersHistory.length - 1;
//     i >= 0 && card.firstAnswersHistory[i] === ANSWERS_CATEGORIES.FAST_CORRECT;
//     i--
//   ) {
//     streakCount++;
//   }
//   return streakCount;
// }

// function calcFastStreakMult(fastStreakCount, boostThreshold) {
//   const mult = 1.5;
//   if (fastStreakCount < boostThreshold) return 1;
//   return fastStreakCount * mult;
// }

// function applyCooldown(card, category) {
//   let cooldown = card.coolDown ?? LEARNING_RULES.cooldowns.defaultMs;
//   console.log("cooldown before", cooldown / 1000);

//   // const inputOffset = getInputOffset();

//   // const speedMult =
//   //   timeToAnswer < LEARNING_RULES.speedThresholds.fastMs + inputOffset
//   //     ? LEARNING_RULES.cooldown.SPEED_MULTIPLIERS.under2s
//   //     : timeToAnswer < LEARNING_RULES.speedThresholds.mediumMs + inputOffset
//   //       ? LEARNING_RULES.cooldown.SPEED_MULTIPLIERS.under4s
//   //       : LEARNING_RULES.cooldown.SPEED_MULTIPLIERS.normal;

//   const cooldownMultiplier =
//     LEARNING_RULES.cooldowns.multipliers[category] ?? 1;

//   const earlyBoost = checkLevelBoost(card) ? 3 : 1;

//   // const streakCooldownMult = calcFastStreakMult(fastStreakCount, 3);

//   cooldown *= cooldownMultiplier * earlyBoost;
//   // if (category === ANSWERS_CATEGORIES.FIRST_CORRECT) {
//   //   cooldown *= LEARNING_RULES.cooldown.CORRECT_MULTIPLIERS.know * speedMult;
//   // } else if (category === ANSWERS_CATEGORIES.CORRECT_GUESS) {
//   //   cooldown *= LEARNING_RULES.cooldown.CORRECT_MULTIPLIERS.guess;
//   // } else if (category === ANSWERS_CATEGORIES.WRONG_GUESS) {
//   //   cooldown *= LEARNING_RULES.cooldown.WRONG_MULTIPLIERS.guess;
//   // } else if (category === ANSWERS_CATEGORIES.WRONG.STRONG_WRONG) {
//   //   cooldown *= LEARNING_RULES.cooldown.WRONG_MULTIPLIERS.know;
//   // } else if (category === ANSWERS_CATEGORIES.WRONG.WRONG_ANSWER && tries > 2) {
//   //   cooldown *= LEARNING_RULES.cooldown.WRONG_MULTIPLIERS.multFails;
//   // }

//   cooldown = Math.max(
//     LEARNING_RULES.cooldowns.minMs,
//     Math.min(LEARNING_RULES.cooldowns.maxMs, cooldown),
//   );
//   const cooldownInSec = cooldown / 1000;
//   console.log(
//     "mult",
//     cooldownMultiplier,
//     "earlyBoost",
//     earlyBoost,
//     "after",
//     cooldownInSec,
//   );
//   card.coolDown = cooldown;
//   card.cooldownUntil = Date.now() + cooldown;
//   saveProgress();
// }

function applyCooldown(card, category) {
  const cooldown = calculateCooldown(card, category);

  card.coolDown = cooldown;
  card.cooldownUntil = Date.now() + cooldown;

  saveProgress();
}

function calcScore(correctAns, mode, duration, card) {
  let qScore;
  if (!correctAns) {
    qScore = 0;
  } else {
    const numOptions = list.children.length;
    const seconds = (duration + getInputOffset()) / 1000;
    // Base difficulty
    let correctBase =
      mode === "know"
        ? numOptions * 1.2 // slightly reduced from 1.5
        : 3;
    const timeBonus = Math.max(0, Math.floor(7 - seconds));
    const flipBonus = roundState.roundFlip ? 3 : 0;
    const blindBonus = roundState.blindRound ? 9 : 0;
    qScore = Math.min(
      20,
      Math.round(correctBase + timeBonus + flipBonus + blindBonus),
    );
  }

  card.scores.push(qScore);
  if (card.scores.length > 20) card.scores.shift();

  card.last5Scores.push(qScore);
  if (card.last5Scores.length > 5) card.last5Scores.shift();

  card.recentScore = card.last5Scores.reduce((sum, val) => sum + val, 0);
  console.log(qScore, card.last5Scores, card.recentScore);
}

function updateFeedbackGrid(answerCategory) {
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
  cube.classList.add(answerCategory);
  feedGrid.append(cube);
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

// function evaluateAnswer(correctAns, mode, duration, didTimeout) {
//   if (
//     correctAns &&
//     !didTimeout &&
//     mode === "know" &&
//     duration < LEARNING_RULES.speedThresholds.quickMs + getInputOffset()
//   )
//     return ANSWERS_CATEGORIES.FAST_CORRECT;
//   else if (
//     correctAns &&
//     !didTimeout &&
//     mode === "know" &&
//     duration > LEARNING_RULES.speedThresholds.slowMs + getInputOffset()
//   )
//     return ANSWERS_CATEGORIES.SLOW_CORRECT;
//   else if (
//     correctAns &&
//     !didTimeout &&
//     mode === "know" &&
//     duration >= LEARNING_RULES.speedThresholds.quickMs + getInputOffset()
//   )
//     return ANSWERS_CATEGORIES.FIRST_CORRECT;
//   else if (correctAns && mode === "main")
//     return ANSWERS_CATEGORIES.RECOVERY_CORRECT;
//   else if (correctAns && mode === "guess")
//     return ANSWERS_CATEGORIES.CORRECT_GUESS;
//   else if (correctAns && didTimeout && mode === "know")
//     return ANSWERS_CATEGORIES.LATE_CORRECT;
//   else if (!correctAns && mode === "guess")
//     return ANSWERS_CATEGORIES.WRONG.WRONG_GUESS;
//   else if (!correctAns && mode === "know")
//     return ANSWERS_CATEGORIES.WRONG.STRONG_WRONG;
//   else if (!correctAns && mode === "main")
//     return ANSWERS_CATEGORIES.WRONG.WRONG_ANSWER;
// }

function evaluateAnswer(correctAns, mode, duration, didTimeout) {
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

function getAvgSpeedFromRecalls(card, numOfRecalls) {
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

function getSelectedAnswer() {
  return document.querySelector('input[name="answer"]:checked');
}

function showNoSelectionMessage() {
  roundState.btnDisabled = false;
  showMsg("לא נבחרה תשובה");
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

function applyAnswerState(card, result, mode) {
  const { correctAns, duration, answerCategory } = result;

  if (!isWrongCategory(answerCategory)) {
    card.recalls.push({ [answerCategory]: Math.floor(duration) });
  }

  roundState.submitted = true;

  if (roundState.firstTry) {
    card.engaged += 1;
    totalQs += 1;
    calcScore(correctAns, mode, duration, card);
    updateFeedbackGrid(answerCategory);
    card.firstAnswersHistory.push(answerCategory);
    console.log(card);
  }

  roundState.currentTries++;

  // const fastStreakCount = countFastStreak(card);
  applyCooldown(card, answerCategory);
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

function handleAnswerOutcome(card, selected, result) {
  const { correctAns, answerCategory } = result;
  roundState.timeOut = result.didTimeout;

  showMsg(getMessage(answerCategory, roundState.currentTries));

  if (correctAns) {
    const speedAvg = getAvgSpeedFromRecalls(card, 5);
    handleCorrectAnswer(card, answerCategory, speedAvg);
  } else {
    dimAnswer(selected);
    handleWrongAnswer(card, answerCategory);
    resetSubmitButtons();
  }
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

  applyAnswerState(card, result, mode);
  handleAnswerOutcome(card, selected, result);
}

function startQuestionTimer() {
  questionStartTime = performance.now();

  // function tick() {
  //   const elapsedMs = performance.now() - questionStartTime;
  //   const seconds = String(Math.floor(elapsedMs / 1000)).padStart(2, "0");
  //   const centiseconds = String(Math.floor(elapsedMs / 10) % 100).padStart(
  //     2,
  //     "0",
  //   );
  //   questionTimer.textContent = `${seconds}:${centiseconds}`;
  // }

  // tick();
  // questionClock = setInterval(tick, 100);
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

function getBlindDuration(card) {
  return LEARNING_RULES.stageSettings[card.wordLevel].blindTime ?? 0;
}

// function blindRecall(card) {
//   const totalCountdownMs = getCountdownDuration(card);

//   const inputOffset = getInputOffset();
//   const revealBeforeEnd =
//     (LEARNING_RULES.stageSettings[card.wordLevel].blindTimeToAnswer ?? 2000) +
//     inputOffset;

//   const revealAtMs = Math.max(0, totalCountdownMs - revealBeforeEnd);

//   list.style.opacity = "0";
//   list.style.pointerEvents = "none";

//   flashEye = setInterval(() => {
//     blindRecallLogo.classList.toggle("hidden");
//   }, 500);

//   blindRevealTimeout = setTimeout(() => {
//     clearInterval(flashEye);
//     blindRecallLogo.classList.add("hidden");
//     list.style.opacity = "1";
//     list.style.pointerEvents = "auto";
//   }, revealAtMs);
// }

// function startBlindPhase(card, onDone) {
//   const blindMs = getBlindDuration(card);

//   countdownCon.style.display = "block";
//   countdown.style.width = "100%";

//   list.style.opacity = "0";
//   list.style.pointerEvents = "none";

//   blindRecallLogo.classList.remove("hidden");

//   if (flashEye) clearInterval(flashEye);
//   if (blindRevealTimeout) clearTimeout(blindRevealTimeout);
//   if (countdownInterval) clearInterval(countdownInterval);

//   flashEye = setInterval(() => {
//     blindRecallLogo.classList.toggle("hidden");
//   }, 500);

//   const blindStart = performance.now();

//   function tick() {
//     const elapsed = performance.now() - blindStart;
//     const progress = Math.min(elapsed / blindMs, 1);
//     const width = 100 * (1 - progress);

//     countdown.style.width = `${width}%`;

//     if (progress >= 1) {
//       clearInterval(countdownInterval);
//       clearInterval(flashEye);

//       blindRecallLogo.classList.add("hidden");
//       list.style.opacity = "1";
//       list.style.pointerEvents = "auto";

//       countdown.style.width = "100%"; // reset bar for main countdown
//       onDone();
//     }
//   }

//   tick();
//   countdownInterval = setInterval(tick, 50);
// }

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

function animatePop(el) {
  el.classList.remove("pop");
  void el.offsetWidth; // force reflow
  el.classList.add("pop");
}

function updateUI() {
  console.log(currentSession);
  console.log(currentSessionArr);
  if (roundState.roundFlip) flipLogo.style.display = "block";
  animatePop(qText);
  knowOrGuess.classList.add("hidden");
  submitMainBtn.classList.remove("hidden");
  feedback.textContent = "";
  submitMainBtn.classList.add("inactive");
}

function startApp() {
  startBtn.style.display = "none";
  if (sessionClock) clearInterval(sessionClock);
  sessionTimer.textContent = "00:00";
  currentSession = new Map();
  currentSessionArr = [];
  feedGrid.textContent = "";
  loadProgress();
  resetState();
  renderStats();
  startSessionTimer();
}

resetbtn.addEventListener("click", resetProgress);

submitButtons.forEach((button) => {
  button.addEventListener("click", onSubmit);
});

function removeWord() {
  chosenCard.isRemoved = true;
  chosenCard.inCycle = false;
  feedback.textContent = "המילה הוסרה מהמאגר";
  setTimeout(resetState, 2000);
}

removeWordBtn.addEventListener("click", removeWord);
startBtn.addEventListener("click", startApp);

const openEyes = [
  document.getElementById("eyeL"),
  document.getElementById("eyeR"),
  document.getElementById("pupilL"),
  document.getElementById("pupilR"),
];

const closedEyes = [
  document.getElementById("eyeClosedL"),
  document.getElementById("eyeClosedR"),
];

function show(elements) {
  elements.forEach((el) => {
    if (el) el.style.display = "block";
  });
}

function hide(elements) {
  elements.forEach((el) => {
    if (el) el.style.display = "none";
  });
}

function blink() {
  hide(openEyes);
  show(closedEyes);

  setTimeout(() => {
    hide(closedEyes);
    show(openEyes);

    const next = 2000 + Math.random() * 3000;
    setTimeout(blink, next);
  }, 120);
}

setTimeout(blink, 1500);

const pupilL = document.getElementById("pupilL");
const pupilR = document.getElementById("pupilR");

let lookDir = 1;

setInterval(() => {
  lookDir *= -1;
  const x = lookDir * 4;

  pupilL.style.transform = `translateX(${x}px)`;
  pupilR.style.transform = `translateX(${x}px)`;
}, 1800);
