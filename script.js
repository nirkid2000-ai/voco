"use strict";
import data from "/en3.js";
import { LEARNING_RULES } from "/learningRules.js";

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
const lastRecalls = document.querySelector(".last_recalls");
const bubble = document.querySelector(".bubble_wrap");

const STORAGE_KEY = "vocab-app-progress-v1";

const INPUT_TYPE = getInputType();

function getInputType() {
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  return hasTouch ? "touch" : "pointer";
}

function createDefaultProgress() {
  return {
    word_status: "new",
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
    coolDown: LEARNING_RULES.cooldown.DEFAULT,
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
        word_status: card.word_status,
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

const STATUS = {
  NEW: "new",
  UNKNOWN: "unknown",
  RECOGNIZED: "recognized",
  KNOWN: "known",
  KNOWWELL: "knownWell",
  STRONG: "strong",
  MASTERED: "mastered",
};

const HEBSTATUS = {
  new: "מילה חדשה",
  unknown: "מילה לא מוכרת",
  recognized: "מילה שאתה מזהה",
  known: "מילה שאתה מכיר",
  knownWell: "מילה שאתה מכיר היטב",
  strong: "מילה שאתה יודע בביטחון ",
  mastered: "מילה שאתה שולט בה",
};

let chosenCard;
let firstTry = true;
let currentTries = 0;
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
let btnDisabled = false;
let roundFlip;
let blindRound;
let countdownRound;
let countdownInterval;
let timeOut = false;
let submitted = false;
let blindRevealTimeout;
let flashEye;
let questionClock;
let sessionClock;
let recentWordIds = [];

let overlayTimeout = null;
let isHolding = false;
let pendingNext = null;

function holdStart() {
  isHolding = true;
  clearTimeout(overlayTimeout);
}

function holdEnd() {
  if (!isHolding) return;
  isHolding = false;
  finishOverlay();
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
  show_answers_circles(card);
  overlayWord.textContent = card.question;
  overlayText.textContent = card.meaning || card.answer;
  overlayTime.textContent = `זמן מענה: ${msToSeconds(
    performance.now() - questionStartTime,
  )} שניות`;
  overlayAvg.textContent = `זמן מענה ממוצע: ${msToSeconds(speedAvg)} שניות`;

  overlayCooldown.textContent = `זמן קולדאון: ${msToTime(card.coolDown)}`;
  // show example only for weaker words
  overlayExample.textContent =
    card.word_status === "new" ||
    card.word_status === "unknown" ||
    card.word_status === "recognized"
      ? card.example || "..."
      : "";

  overlay.classList.add("show");

  clearTimeout(overlayTimeout);
  overlayTimeout = setTimeout(() => {
    if (!isHolding) finishOverlay();
  }, 1000); // sweet spot
}

function finishOverlay() {
  clearTimeout(overlayTimeout);

  overlay.classList.remove("show");

  setTimeout(() => {
    if (pendingNext) pendingNext();
    pendingNext = null;
  }, 0);
}

function getInputOffset() {
  return LEARNING_RULES.inputTimeOffsets[INPUT_TYPE] ?? 0;
}

function getStageKey(card) {
  return `${card.word_status}${card.levelStreak}`;
}

function getPromotionThreshold() {
  return LEARNING_RULES.promotion.requiredLevelStreak;
}

function getDiffArrowPosition(card) {
  return LEARNING_RULES.diffLevels[card.diff];
}

function rememberShownWord(card) {
  recentWordIds.push(card.id);
  if (recentWordIds.length > LEARNING_RULES.minWordGap) {
    recentWordIds.shift();
  }
}

function shouldFlip(card) {
  return (
    (card.word_status === "strong" || card.word_status === "mastered") &&
    card.levelStreak === 0
  );
}

function shouldBlind(card) {
  return (
    card.word_status === "mastered" ||
    (card.word_status === "strong" && card.levelStreak === 1)
  );
}

function shouldCountdown(card) {
  return true;
  // return !["new", "unknown", "recognized"].includes(card.word_status);
}

function getStarsFill(card) {
  return LEARNING_RULES.stars[getStageKey(card)];
}

function getCountdownDuration(card) {
  return (
    LEARNING_RULES.stageCountdowns[getStageKey(card)] * 1000 + getInputOffset()
  );
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
    roundFlip = shouldFlip(chosenCard);
    blindRound = shouldBlind(chosenCard);
    countdownRound = shouldCountdown(chosenCard);
    if (!chosenCard.inCycle) chosenCard.inCycle = true;
  }

  return chosenCard;
}

function renderQuestionText(card) {
  qText.textContent = roundFlip ? card.answer : card.question;
}
function updateWordStats(card) {
  levelText.textContent = HEBSTATUS[card.word_status];
  difArrow.style.left = getDiffArrowPosition(card);
  if (submitted) {
    starsFill.classList.add("animate-fill");
  } else {
    starsFill.classList.remove("animate-fill");
  }
  starsFill.style.setProperty("--fill", `${getStarsFill(card)}%`);
}

function renderQuestion(card) {
  if (!card) return;
  renderQuestionText(card);
  updateWordStats(card);
}

function showAnswers(card) {
  const correctAnswer = roundFlip ? card.question : card.answer;
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
  const answerKey = roundFlip ? "question" : "answer";
  const maxLenDiff =
    card.word_status === "new" || card.word_status === "unknown"
      ? 4
      : card.word_status === "recognized" || card.word_status === "known"
        ? 3
        : 2;

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
    if (firstTry) {
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

function promoteCard(card, speedAvg) {
  if (card.word_status === STATUS.NEW) {
    card.word_status = STATUS.RECOGNIZED;
    card.levelStreak = 0;
    return;
  }

  if (card.word_status === STATUS.UNKNOWN) {
    card.word_status = STATUS.RECOGNIZED;
    card.levelStreak = 0;
    return;
  }

  if (
    card.word_status === STATUS.RECOGNIZED &&
    card.levelStreak >= getPromotionThreshold()
  ) {
    const recoBoostThreshold =
      LEARNING_RULES.speedThresholds.recoBoost + getInputOffset();

    const fastEnough = speedAvg !== null && speedAvg < recoBoostThreshold;

    if (fastEnough) {
      card.coolDown *= 2.5;
      console.log(speedAvg, "cooldown boost", recoBoostThreshold);
    } else {
      console.log(speedAvg, "no cooldown boost", recoBoostThreshold);
    }

    card.word_status = STATUS.KNOWN;
    card.levelStreak = 0;
    return;
  }

  if (
    card.word_status === STATUS.KNOWN &&
    card.levelStreak >= getPromotionThreshold()
  ) {
    card.word_status = STATUS.KNOWWELL;
    card.levelStreak = 0;
    return;
  }

  if (
    card.word_status === STATUS.KNOWWELL &&
    card.levelStreak >= getPromotionThreshold()
  ) {
    card.word_status = STATUS.STRONG;
    card.levelStreak = 0;
    return;
  }

  if (
    card.word_status === STATUS.STRONG &&
    card.levelStreak >= getPromotionThreshold()
  ) {
    card.word_status = STATUS.MASTERED;
    card.levelStreak = 0;
    return;
  }

  if (card.word_status === STATUS.MASTERED) {
    if (card.levelStreak >= getPromotionThreshold()) {
      card.levelStreak = 1;
    }
    return;
  }
}

function demoteCard(card) {
  if (card.word_status === STATUS.NEW) {
    card.word_status = STATUS.UNKNOWN;
    card.levelStreak = 0;
    return;
  }

  if (card.word_status === STATUS.RECOGNIZED) {
    card.word_status = STATUS.UNKNOWN;
    card.levelStreak = 1;
    return;
  }

  if (card.word_status === STATUS.KNOWN) {
    card.word_status = STATUS.RECOGNIZED;
    card.levelStreak = 1;
    return;
  }
  if (card.word_status === STATUS.KNOWWELL) {
    card.word_status = STATUS.KNOWN;
    card.levelStreak = 1;
    return;
  }
  if (card.word_status === STATUS.STRONG) {
    card.word_status = STATUS.KNOWWELL;
    card.levelStreak = 1;
    return;
  }

  if (card.word_status === STATUS.MASTERED) {
    card.word_status = STATUS.STRONG;
    card.levelStreak = 1;
  }
}

function getTriesMessage(tries) {
  if (tries === 1) return "טעות ראשונה";
  if (tries === 2) return "טעות שנייה";
  if (tries === 3) return "טעות שלישית";
  if (tries === 4) return "טעות רביעית";
  return `טעות מספר ${tries}`;
}

function applyCorrectScore() {
  if (currentTries === 1) {
    globalScore += 100;
  } else if (currentTries === 2) {
    globalScore += 60;
  } else {
    globalScore += 20;
  }

  if (globalStreak === 5) globalScore += 200;
  if (globalStreak === 10) globalScore += 400;
  if (globalStreak === 25) globalScore += 600;
  if (globalStreak === 50) globalScore *= 2;
  if (globalStreak === 100) globalScore *= 3;
}

function handleFirstTryCorrect(card, mode, speedAvg) {
  if (card.word_status === "mastered" && timeOut) {
    card.levelStreak = 0;
  }

  if (mode === "know" && !timeOut) {
    card.levelStreak += 1;
    promoteCard(card, speedAvg);
  } else {
    correctGuesses += 1;
    totalGuesses += 1;
  }

  card.rightAnswers += 1;
  card.wordStreak += 1;

  globalStreak += 1;
  totalCorrect += 1;
  totalQs += 1;

  updateWordStats(card);
  updateAccuracy(card);
  currentSession.set(card.id, card);
  currentSessionArr.push(card);

  renderStats();

  saveProgress();
}

function handleFirstTryWrong(card, mode) {
  if (mode === "guess") {
    totalGuesses += 1;
  }
  firstTry = false;
  card.wrongAnswers += 1;
  card.levelStreak = 0;
  card.wrongTries += 1;
  clearInterval(countdownInterval);
  countdown.style.width = `0%`;
  // countdownCon.style.display = "none";

  totalQs += 1;

  updateAccuracy(card);
  demoteCard(card);
  updateWordStats(card);
  currentSession.set(card.id, card);
  currentSessionArr.push(card);

  renderStats();

  saveProgress();
}

function showMsg(text) {
  bubble.classList.remove("invisible");
  feedback.textContent = text;
}

function handleCorrectAnswer(card, mode, speedAvg) {
  if (firstTry) {
    if (mode === "know") {
      if (timeOut) {
        showMsg("תשובה נכונה אבל מאוחר מדי");
        feedbackBg.classList.add("late_bg");
      } else {
        showMsg("כל הכבוד! תשובה נכונה");
        feedbackBg.classList.add("correct_bg");
      }
    } else {
      showMsg("ניחוש מוצלח");
      feedbackBg.classList.add("correct_bg");
    }
  } else {
    showMsg("הפעם הצלחת");
    feedbackBg.classList.add("late_bg");
  }

  if (firstTry) {
    handleFirstTryCorrect(card, mode, speedAvg);
  }

  applyCorrectScore();

  renderStats();

  if (questionClock) clearInterval(questionClock);

  showMeaning(card, speedAvg, () => {
    // renderTimer();
    bubble.classList.add("invisible");
    feedbackBg.classList.remove("correct_bg");
    feedbackBg.classList.remove("late_bg");
    resetState();
  });
}

function handleWrongAnswer(card, selected, mode) {
  const label = selected.closest("li");

  feedbackBg.classList.add("wrong_bg");
  submitMainBtn.classList.add("inactive");

  if (label) label.classList.add("wrong");

  selected.disabled = true;
  selected.checked = false;

  globalStreak = 0;
  card.wordStreak = 0;
  renderStats();

  if (firstTry) {
    handleFirstTryWrong(card, mode);
  } else {
    card.wrongTries += 1;
    saveProgress();
  }
  knowOrGuess.classList.add("hidden");
  submitMainBtn.classList.remove("hidden");

  showMsg(`${getTriesMessage(currentTries)} נסה שוב`);

  setTimeout(() => {
    bubble.classList.add("invisible");

    feedbackBg.classList.remove("wrong_bg");
    feedback.textContent = "";
  }, 1000);
}

function applyCooldown(card, isCorrect, mode, timeToAnswer, tries) {
  console.log("cooldown:");
  // card.onCooldown = true;

  let cooldown = card.coolDown ?? LEARNING_RULES.cooldown.DEFAULT;
  console.log("before", cooldown / 1000);

  const inputOffset = getInputOffset();

  const speedMult =
    timeToAnswer < LEARNING_RULES.speedThresholds.fastMs + inputOffset
      ? LEARNING_RULES.cooldown.SPEED_MULTIPLIERS.under2s
      : timeToAnswer < LEARNING_RULES.speedThresholds.mediumMs + inputOffset
        ? LEARNING_RULES.cooldown.SPEED_MULTIPLIERS.under4s
        : LEARNING_RULES.cooldown.SPEED_MULTIPLIERS.normal;

  if (isCorrect && mode === "know") {
    cooldown *= LEARNING_RULES.cooldown.CORRECT_MULTIPLIERS.know * speedMult;
  } else if (isCorrect && mode === "guess") {
    cooldown *= LEARNING_RULES.cooldown.CORRECT_MULTIPLIERS.guess;
  } else if (!isCorrect && mode === "guess") {
    cooldown *= LEARNING_RULES.cooldown.WRONG_MULTIPLIERS.guess;
  } else if (!isCorrect && mode === "know") {
    cooldown *= LEARNING_RULES.cooldown.WRONG_MULTIPLIERS.know;
  } else if (!isCorrect && mode === "main" && tries > 2) {
    cooldown *= LEARNING_RULES.cooldown.WRONG_MULTIPLIERS.multFails;
  }

  cooldown = Math.max(
    LEARNING_RULES.cooldown.MIN,
    Math.min(LEARNING_RULES.cooldown.MAX, cooldown),
  );
  const cooldownInSec = cooldown / 1000;
  console.log("after", cooldownInSec);
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
    const flipBonus = roundFlip ? 3 : 0;
    const blindBonus = blindRound ? 9 : 0;
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

function show_answers_circles(card) {
  let circleClass;
  lastRecalls.textContent = "";
  for (const circle of card.recalls) {
    const circle_fb = document.createElement("div");
    circle_fb.classList.add("recalls_circle");
    circle_fb.classList.add(Object.keys(circle)[0]);
    lastRecalls.append(circle_fb);
  }
}

function evaluateAnswer(correctAns, mode) {
  console.log(correctAns, mode);
  if (correctAns && !timeOut && mode === "know") return "correct_answer";
  else if (correctAns && mode === "main") return "recovery_correct";
  else if (correctAns && mode === "guess") return "guess";
  else if (correctAns && timeOut && mode === "know") return "late_correct";
  else if (!correctAns) return "wrong_answer";
}

function onSubmit(e) {
  e.preventDefault();
  const card = chosenCard;
  const button = e.currentTarget;
  if (btnDisabled) return;
  btnDisabled = true;

  const mode = button.dataset.mode;

  const selected = document.querySelector('input[name="answer"]:checked');

  if (!selected) {
    btnDisabled = false;
    feedback.textContent = "לא נבחרה תשובה";
    setTimeout(() => (feedback.textContent = ""), 1000);
    return;
  }
  const key = roundFlip ? "question" : "answer";
  const correctAns = selected.value === card[key];
  const duration = performance.now() - questionStartTime;

  if (countdownRound && firstTry) {
    const totalMs = getCountdownDuration(card);
    const progress = Math.min(duration / totalMs, 1);
    const width = 100 * (1 - progress);
    countdown.style.width = `${width}%`;
  }

  const answerCategory = evaluateAnswer(correctAns, mode);
  if (answerCategory !== "wrong_answer")
    chosenCard.recalls.push({ [answerCategory]: Math.floor(duration) });

  const last5recalls = card.recalls.slice(-5);
  let speedAvg = null;

  if (last5recalls.length) {
    if (last5recalls.length === 1) {
      speedAvg = Object.values(last5recalls[0]);
    } else {
      const sum = last5recalls.reduce((sum, obj) => {
        return sum + Object.values(obj)[0];
      }, 0);
      speedAvg = sum / last5recalls.length;
      console.log(speedAvg);
    }
  }

  console.log(answerCategory);
  submitted = true;
  // button.disabled = true;
  if (firstTry) {
    card.engaged += 1;
    calcScore(correctAns, mode, duration, card);
    updateFeedbackGrid(answerCategory);
  }
  currentTries++;

  applyCooldown(card, correctAns, mode, duration, currentTries);

  if (firstTry && countdownRound) {
    timeOut = duration >= getCountdownDuration(card);
  }

  if (correctAns) {
    handleCorrectAnswer(card, mode, speedAvg);
  } else {
    handleWrongAnswer(card, selected, mode);

    btnDisabled = false;
    document.querySelectorAll(".submit").forEach((btn) => {
      btn.disabled = false;
    });
  }
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

    if (submitted) {
      clearInterval(countdownInterval);
      return;
    }

    if (progress >= 1) {
      clearInterval(countdownInterval);
      timeOut = true;
    }
  }

  tick();
  countdownInterval = setInterval(tick, 50);
}

function resetState() {
  flipLogo.style.display = "none";
  countdownCon.style.display = "none";
  blindRecallLogo.classList.add("hidden");

  if (flashEye) clearInterval(flashEye);
  if (questionClock) clearInterval(questionClock);
  if (countdownInterval) clearInterval(countdownInterval);
  if (blindRevealTimeout) clearTimeout(blindRevealTimeout);

  list.style.opacity = "1";
  list.style.pointerEvents = "auto";

  submitButtons.forEach((button) => {
    button.disabled = false;
  });
  currentTries = 0;
  firstTry = true;
  roundFlip = false;
  blindRound = false;
  countdownRound = false;
  btnDisabled = false;
  timeOut = false;
  submitted = false;

  pickQuestionAndAnswers();
  updateUI();

  startQuestionTimer();

  if (countdownRound) {
    startCountDown(chosenCard);
    if (blindRound) blindRecall(chosenCard);
  }
}

function blindRecall(card) {
  const totalCountdownMs = getCountdownDuration(card);

  const inputOffset = getInputOffset();
  const revealBeforeEnd =
    card.word_status === "strong" ? 2000 + inputOffset : 1500 + inputOffset;

  const revealAtMs = Math.max(0, totalCountdownMs - revealBeforeEnd);

  list.style.opacity = "0";
  list.style.pointerEvents = "none";

  flashEye = setInterval(() => {
    blindRecallLogo.classList.toggle("hidden");
  }, 500);

  blindRevealTimeout = setTimeout(() => {
    clearInterval(flashEye);
    blindRecallLogo.classList.add("hidden");
    list.style.opacity = "1";
    list.style.pointerEvents = "auto";
  }, revealAtMs);
}

function animatePop(el) {
  el.classList.remove("pop");
  void el.offsetWidth; // force reflow
  el.classList.add("pop");
}

function updateUI() {
  console.log(currentSession);
  console.log(currentSessionArr);
  if (roundFlip) flipLogo.style.display = "block";
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
