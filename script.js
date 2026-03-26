"use strict";
import data from "/latvian.js";

const qText = document.querySelector(".q");
const levelText = document.querySelector(".word_level");
const difArrow = document.querySelector(".arrow");
const list = document.querySelector(".wordlist");
const submitMainBtn = document.querySelector(".main_ans");
const resetbtn = document.querySelector(".reset");
const knowOrGuess = document.querySelector(".knoworguess");
const feedback = document.querySelector(".feedback");
const scoreStat = document.querySelector(".score_stat");
const streakStat = document.querySelector(".streak_stat");
const questionTimer = document.querySelector(".q_timer");
const sessionTimer = document.querySelector(".set_timer");
const totalFrom = document.querySelector(".total_from");
const feedbackBg = document.querySelector(".feedback_bg");
const stars = document.querySelector(".stars");
const starsFill = document.querySelector(".stars-fill");
const countdown = document.querySelector(".countdown");
const countdownCon = document.querySelector(".countdown_con");
const submitButtons = document.querySelectorAll(".submit");
const removeWordBtn = document.querySelector(".word_remove");
const blindRecallLogo = document.querySelector(".blind_recall");
const flipLogo = document.querySelector(".flip_logo");

const COOLDOWN_SETTINGS = {
  DEFAULT: 20 * 1000, // debug
  MIN: 1 * 1000,
  MAX: 60 * 1000 * 20,

  SPEED_MULTIPLIERS: {
    under2s: 1.2,
    under4s: 1.1,
    normal: 1,
  },

  CORRECT_MULTIPLIERS: {
    know: 1.4,
    guess: 1,
  },

  WRONG_MULTIPLIERS: {
    know: 0.6,
    guess: 0.8,
    multFails: 0.9,
  },
};

const STORAGE_KEY = "vocab-app-progress-v1";

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
    coolDown: COOLDOWN_SETTINGS.DEFAULT,
    inCycle: false,
    cooldownUntil: null,
    isRemoved: false,
  };
}

function createInitialCards() {
  return data.words.map((word, i) => ({
    id: i + 1,
    question: word.he,
    answer: word.en,
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
  console.log("reset");
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

const STARS = {
  new0: 0,
  unknown0: 0,
  recognized0: 9.5,
  recognized1: 20,
  known0: 30,
  known1: 40,
  knownWell0: 50,
  knownWell1: 60,
  strong0: 70,
  strong1: 80,
  mastered0: 90,
  mastered1: 100,
};

const COUNTDOWNTIMES = {
  new0: 10,
  unknown0: 10,
  recognized0: 10,
  recognized1: 10,
  known0: 5,
  known1: 4,
  knownWell0: 5,
  knownWell1: 4,
  strong0: 5,
  strong1: 5,
  mastered0: 4,
  mastered1: 4,
};

const DIFFLEVELS = {
  A1: "0%",
  A2: "20%",
  B1: "30%",
  B2: "50%",
  C1: "70%",
  C2: "85%",
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
let questionStartTime;
let sessionStartTime;
let btnDisabled = false;
let roundFlip;
let blindRound;
let countdownRound;
let countdownInterval;
let timeOut = false;
let submitted = false;
let blind;
let flashEye;
let questionClock;
let sessionClock;

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
  return !["new", "unknown", "recognized"].includes(card.word_status);
}

function getStarsFill(card) {
  return STARS[card.word_status + card.levelStreak];
}

function getCountdownDuration(card) {
  return COUNTDOWNTIMES[card.word_status + card.levelStreak] * 2.5;
}

function chooseQuestion() {
  chosenCard = null;
  const now = Date.now();

  const liveCards = cards.filter((card) => !card.isRemoved);
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
  difArrow.style.left = DIFFLEVELS[card.diff];
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
  const status = card.word_status;

  const numberOfAns = blindRound
    ? 4
    : status === "knownWell"
      ? 6
      : status === "strong" || status === "known"
        ? 5
        : 4;
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
  const answerKey = roundFlip ? "he" : "en";
  const maxLenDiff =
    card.word_status === "new" || card.word_status === "unknown"
      ? 4
      : card.word_status === "recognized" || card.word_status === "known"
        ? 3
        : 2;

  const strictPool = data.words.filter((word) => {
    const candidate = word[answerKey];
    if (candidate === correctAnswer) return false;
    if (word.level !== card.diff) return false;
    return Math.abs(candidate.length - correctAnswer.length) <= maxLenDiff;
  });

  const sameLevelPool = data.words.filter((word) => {
    const candidate = word[answerKey];
    return candidate !== correctAnswer && word.level === card.diff;
  });

  const broadPool = data.words.filter((word) => {
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

function promoteCard(card) {
  const last5recalls = card.recalls.slice(-5);
  let speedAvg = null;
  if (last5recalls.length) {
    const sum = last5recalls.reduce((acc, val) => acc + val, 0);
    speedAvg = sum / last5recalls.length;
    console.log(speedAvg);
  }

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

  if (card.word_status === STATUS.RECOGNIZED && card.levelStreak >= 2) {
    if (speedAvg < 2500) card.coolDown *= 2.5;
    card.word_status = STATUS.KNOWN;
    card.levelStreak = 0;
    console.log(card.coolDown);

    return;
  }

  if (card.word_status === STATUS.KNOWN && card.levelStreak >= 2) {
    card.word_status = STATUS.KNOWWELL;
    card.levelStreak = 0;
    return;
  }

  if (card.word_status === STATUS.KNOWWELL && card.levelStreak >= 2) {
    card.word_status = STATUS.STRONG;
    card.levelStreak = 0;
    return;
  }

  if (card.word_status === STATUS.STRONG && card.levelStreak >= 2) {
    card.word_status = STATUS.MASTERED;
    card.levelStreak = 0;
    return;
  }
  if (card.word_status === STATUS.MASTERED) {
    if (card.levelStreak >= 2) {
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

function handleFirstTryCorrect(card, mode) {
  if (card.word_status === "mastered" && timeOut) {
    card.levelStreak = 0;
  }

  if (mode === "know" && !timeOut) {
    card.levelStreak += 1;
    promoteCard(card);
  } else {
    correctGuesses += 1;
    totalGuesses += 1;
  }

  card.rightAnswers += 1;
  card.wordStreak += 1;

  globalStreak += 1;
  totalCorrect += 1;
  totalQs += 1;
  const duration = performance.now() - questionStartTime;
  chosenCard.recalls.push(Math.floor(duration));
  updateWordStats(card);
  updateAccuracy(card);
  currentSession.set(card.id, card);

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

  renderStats();

  saveProgress();
}

function handleCorrectAnswer(card, mode) {
  if (mode === "know") {
    if (timeOut) {
      feedback.textContent = "תשובה נכונה אבל מאוחר מדי";
      feedbackBg.classList.add("late_bg");
    } else {
      feedback.textContent = "כל הכבוד! תשובה נכונה";
      feedbackBg.classList.add("correct_bg");
    }
  } else {
    feedback.textContent = "הפעם צדקת";
    feedbackBg.classList.add("late_bg");
  }

  if (firstTry) {
    handleFirstTryCorrect(card, mode);
  }

  applyCorrectScore();

  renderStats();

  renderTimer();
  if (questionClock) clearInterval(questionClock);

  setTimeout(() => {
    feedbackBg.classList.remove("correct_bg");
    feedbackBg.classList.remove("late_bg");

    resetState();
  }, 1000);
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

  feedback.textContent = `${getTriesMessage(currentTries)} נסה שוב`;

  setTimeout(() => {
    feedbackBg.classList.remove("wrong_bg");
    feedback.textContent = "";
  }, 1000);
}

function applyCooldown(card, isCorrect, mode, timeToAnswer, tries) {
  console.log("cooldown:");
  // card.onCooldown = true;

  let cooldown = card.coolDown ?? COOLDOWN_SETTINGS.DEFAULT;

  const speedMult =
    timeToAnswer / 1000 < 2
      ? COOLDOWN_SETTINGS.SPEED_MULTIPLIERS.under2s
      : timeToAnswer / 1000 < 4
        ? COOLDOWN_SETTINGS.SPEED_MULTIPLIERS.under4s
        : COOLDOWN_SETTINGS.SPEED_MULTIPLIERS.normal;

  if (isCorrect && mode === "know") {
    cooldown *= COOLDOWN_SETTINGS.CORRECT_MULTIPLIERS.know * speedMult;
  } else if (isCorrect && mode === "guess") {
    cooldown *= COOLDOWN_SETTINGS.CORRECT_MULTIPLIERS.guess;
  } else if (!isCorrect && mode === "guess") {
    cooldown *= COOLDOWN_SETTINGS.WRONG_MULTIPLIERS.guess;
  } else if (!isCorrect && mode === "know") {
    cooldown *= COOLDOWN_SETTINGS.WRONG_MULTIPLIERS.know;
  } else if (!isCorrect && mode === "main" && tries > 2) {
    cooldown *= COOLDOWN_SETTINGS.WRONG_MULTIPLIERS.multFails;
  }

  cooldown = Math.max(
    COOLDOWN_SETTINGS.MIN,
    Math.min(COOLDOWN_SETTINGS.MAX, cooldown),
  );
  const cooldownInSec = cooldown / 1000;
  console.log(cooldownInSec);
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
    const seconds = duration / 1000;

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
  submitted = true;
  // button.disabled = true;
  if (firstTry) {
    card.engaged += 1;
    calcScore(correctAns, mode, duration, card);
  }
  currentTries++;

  applyCooldown(card, correctAns, mode, duration, currentTries);

  if (correctAns) {
    handleCorrectAnswer(card, mode);
  } else {
    handleWrongAnswer(card, selected, mode);

    btnDisabled = false;
    document.querySelectorAll(".submit").forEach((btn) => {
      btn.disabled = false;
    });
  }
}

function startQuestionTimer() {
  let thisQuestionSeconds = 0;
  questionStartTime = performance.now();
  function tick() {
    thisQuestionSeconds += 1;
    const questionSeconds = String(thisQuestionSeconds % 60).padStart(2, 0);
    const questionMinutes = String(
      Math.floor(thisQuestionSeconds / 60),
    ).padStart(2, 0);
    questionTimer.textContent = `${questionMinutes}:${questionSeconds}`;
  }
  questionClock = setInterval(tick, 1000);
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
  totalFrom.textContent = `${totalCorrect} מתוך ${totalQs} (ניחושים ${correctGuesses})`;
}

function renderTimer(time = "00:00") {
  questionTimer.textContent = time;
}

function startCountDown(card) {
  countdownCon.style.display = "block";
  countdown.style.width = "100%";

  let width = 100;
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  const intervalMs = getCountdownDuration(card);

  countdownInterval = setInterval(() => {
    width -= 0.25;
    countdown.style.width = `${width}%`;

    if (width <= 0 || submitted) {
      clearInterval(countdownInterval);
      timeOut = true;
    }
  }, intervalMs);
}

function resetState() {
  flipLogo.style.display = "none";
  countdownCon.style.display = "none";
  blindRecallLogo.classList.add("hidden");
  if (flashEye) clearInterval(flashEye);
  list.style.opacity = "1";
  list.style.pointerEvents = "auto";
  if (questionClock) clearInterval(questionClock);
  if (blind) clearTimeout(blind);

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
  renderTimer();
  if (countdownRound) {
    startCountDown(chosenCard);
    if (blindRound) blindRecall(chosenCard);
  }

  startQuestionTimer();
  updateUI();
}

function blindRecall(card) {
  flashEye = setInterval(() => {
    blindRecallLogo.classList.toggle("hidden");
  }, 500);

  const totalCountdownMs = getCountdownDuration(card) * 400;
  const revealBeforeEnd = card.word_status === "strong" ? 2000 : 1500;
  const hideDuration = Math.max(0, totalCountdownMs - revealBeforeEnd);

  list.style.opacity = "0";
  list.style.pointerEvents = "none";

  blind = setTimeout(() => {
    clearInterval(flashEye);
    blindRecallLogo.classList.add("hidden");
    list.style.opacity = "1";
    list.style.pointerEvents = "auto";
  }, hideDuration);
}

function animatePop(el) {
  el.classList.remove("pop");
  void el.offsetWidth; // force reflow
  el.classList.add("pop");
}

function updateUI() {
  console.log(currentSession);
  if (roundFlip) flipLogo.style.display = "block";
  animatePop(qText);
  knowOrGuess.classList.add("hidden");
  submitMainBtn.classList.remove("hidden");
  feedback.textContent = "";
  submitMainBtn.classList.add("inactive");
}

function startApp() {
  if (sessionClock) clearInterval(sessionClock);
  sessionTimer.textContent = "00:00";
  currentSession = new Map();
  loadProgress();
  resetState();
  renderTimer();
  renderStats();
  startSessionTimer();
}

startApp();

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
