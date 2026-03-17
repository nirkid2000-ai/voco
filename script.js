"use strict";
import data from "/dataset_c2.js";

const qText = document.querySelector(".q");
const qLabel = document.querySelector(".q_label");
const list = document.querySelector(".wordlist");
const nextBtn = document.querySelector(".next_btn");
const submitMainBtn = document.querySelector(".main_ans");
const submitKnowBtn = document.querySelector(".know_ans");
const submitGuessBtn = document.querySelector(".guess_ans");
const knowOrGuess = document.querySelector(".knoworguess");
const feedback = document.querySelector(".feedback");
const scoreStat = document.querySelector(".score_stat");
const streakStat = document.querySelector(".streak_stat");
const timer = document.querySelector(".time_stat");
const totalFrom = document.querySelector(".total_from");
const feedbackBg = document.querySelector(".feedbackbg");

const STATUS = {
  NEW: "new",
  UNKNOWN: "unknown",
  RECOGNIZED: "recognized",
  KNOWN: "known",
  MASTERED: "mastered",
};

const TIME = {
  DAY: 86400000,
  HOUR: 86400000 / 24,
  MINUTE: 86400000 / 24 / 60,
};

const COOLDOWNS = {
  new: {
    0: 0,
  },
  unknown: {
    0: 10 * TIME.MINUTE,
  },
  recognized: {
    0: 12 * TIME.HOUR,
    1: 1 * TIME.DAY,
  },
  known: {
    0: 2 * TIME.DAY,
    1: 3 * TIME.DAY,
    2: 5 * TIME.DAY,
  },
  mastered: {
    0: 7 * TIME.DAY,
    1: 14 * TIME.DAY,
    2: 21 * TIME.DAY,
  },
};

const cards = data.words.map((word, i) => ({
  id: i + 1,
  question: word.en,
  answer: word.he,
  word_status: STATUS.NEW,
  appeared: 0,
  skipped: 0,
  rightAnswers: 0,
  wordStreak: 0,
  levelStreak: 0,
  wrongAnswers: 0,
  accuracy: 0,
  wrongTries: 0,
  recalls: [],
  coolDown: null,
  onCooldown: false,
  cooldownUntil: null,
  removed: false,
  removedTime: null,
  removedStreak: 0,
  deleted: false,
}));

let chosenCard = null;
let updatedCards = [];
let firstTry = true;
let currentTries = 0;
let globalStreak = 0;
let globalScore = 0;
let correctGuesses = 0;
let totalGuesses = 0;
let totalCorrect = 0;
let totalQs = 0;
let currentSession = new Map();
let startTime = 0;
let clock = null;

/* -------------------- helpers -------------------- */

function updateStatsUI() {
  scoreStat.textContent = `${globalScore}`;
  streakStat.textContent = `${globalStreak}`;
  totalFrom.textContent = `${totalCorrect} מתוך ${totalQs} (ניחושים ${correctGuesses}/${totalGuesses})`;
}

function clearFeedbackState() {
  feedback.textContent = "";
  feedbackBg.classList.remove("correct_bg", "wrong_bg");
}

function setSubmitStateInitial() {
  submitMainBtn.classList.add("inactive");
  submitMainBtn.classList.remove("hidden");
  knowOrGuess.classList.add("hidden");
}

function getSelectedAnswer() {
  return document.querySelector('input[name="answer"]:checked');
}

function updateAccuracy(card) {
  card.accuracy = card.appeared > 0 ? card.rightAnswers / card.appeared : 0;
}

function getCooldown(card) {
  return COOLDOWNS[card.word_status]?.[card.levelStreak] ?? 0;
}

function applyCooldown(card) {
  const coolDown = getCooldown(card);
  card.coolDown = coolDown;
  card.onCooldown = coolDown > 0;
  card.cooldownUntil = Date.now() + coolDown;
}

function releaseExpiredCooldowns() {
  for (const card of cards) {
    if (!card.onCooldown) continue;
    if (Date.now() >= card.cooldownUntil) {
      card.onCooldown = false;
      card.cooldownUntil = null;
    }
  }
}

function getAvailableCards() {
  releaseExpiredCooldowns();
  return cards.filter(
    (card) => !card.onCooldown && !card.deleted && !card.removed,
  );
}

function getTriesMessage(tries) {
  if (tries === 1) return "טעות ראשונה";
  if (tries === 2) return "טעות שנייה";
  if (tries === 3) return "טעות שלישית";
  if (tries === 4) return "טעות רביעית";
  return `טעות מספר ${tries}`;
}

/* -------------------- progression -------------------- */

function promoteCard(card) {
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

  if (card.word_status === STATUS.RECOGNIZED && card.levelStreak >= 1) {
    card.word_status = STATUS.KNOWN;
    card.levelStreak = 0;
    return;
  }

  if (card.word_status === STATUS.KNOWN && card.levelStreak >= 3) {
    card.word_status = STATUS.MASTERED;
    card.levelStreak = 0;
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
    card.levelStreak = 0;
    return;
  }

  if (card.word_status === STATUS.KNOWN) {
    card.word_status = STATUS.RECOGNIZED;
    card.levelStreak = 0;
    return;
  }

  if (card.word_status === STATUS.MASTERED) {
    card.word_status = STATUS.KNOWN;
    card.levelStreak = 0;
  }
}

/* -------------------- score / removal -------------------- */

function applyCorrectScore() {
  if (currentTries === 0) {
    globalScore += 100;
  } else if (currentTries === 1) {
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

function markCardRemoved(card) {
  if (card.wordStreak >= 1) {
    card.removed = true;
    card.removedTime = Date.now();
    card.removedStreak += 1;
  }
}

function resetCardRemoval(card) {
  card.removed = false;
  card.removedTime = null;
  card.removedStreak = 0;
  card.wordStreak = 0;
}

/* -------------------- timer -------------------- */

function stopTimer() {
  if (clock) clearInterval(clock);
  clock = null;
  timer.textContent = "00:00";
}

function startTimer() {
  stopTimer();
  startTime = performance.now();

  let totalSeconds = 0;

  clock = setInterval(() => {
    totalSeconds += 1;
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    timer.textContent = `${minutes}:${seconds}`;
  }, 1000);
}

/* -------------------- question / answers -------------------- */

function chooseQuestion() {
  updatedCards = getAvailableCards();

  if (updatedCards.length === 0) {
    feedback.textContent = "טוווווווב!!! אתה יודע את כל המילים יא גאון שכמוך";
    qText.textContent = "";
    list.innerHTML = "";
    list.style.display = "none";
    qLabel.style.display = "none";
    submitMainBtn.classList.add("hidden");
    knowOrGuess.classList.add("hidden");
    stopTimer();
    return null;
  }

  const minAppeared = Math.min(...updatedCards.map((card) => card.appeared));
  const candidates = updatedCards.filter(
    (card) => card.appeared === minAppeared,
  );
  const randomIndex = Math.floor(Math.random() * candidates.length);

  chosenCard = candidates[randomIndex];
  chosenCard.appeared += 1;

  qText.textContent = chosenCard.question;
  list.style.display = "";
  qLabel.style.display = "";

  return chosenCard;
}

function chooseAnswers(num, correctCard) {
  const wrongAnswers = [];

  while (wrongAnswers.length < num) {
    const randomAns =
      data.words[Math.floor(Math.random() * data.words.length)].he;

    if (!wrongAnswers.includes(randomAns) && randomAns !== correctCard.answer) {
      wrongAnswers.push(randomAns);
    }
  }

  const allAnswers = [...wrongAnswers];
  const rightAnsPosition = Math.floor(Math.random() * num);
  allAnswers[rightAnsPosition] = correctCard.answer;

  return allAnswers;
}

function renderAnswers(answers) {
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

function pickQuestionAndAnswers() {
  const card = chooseQuestion();
  if (!card) return;

  const answers = chooseAnswers(4, card);
  renderAnswers(answers);
}

/* -------------------- answer logic -------------------- */

function handleFirstTryCorrect(card, mode) {
  if (mode === "know") {
    card.levelStreak += 1;
    promoteCard(card);
  }

  if (mode === "guess") {
    correctGuesses += 1;
    totalGuesses += 1;
  }

  card.rightAnswers += 1;
  card.wordStreak += 1;

  globalStreak += 1;
  totalCorrect += 1;
  totalQs += 1;

  updateAccuracy(card);
  currentSession.set(card.id, card);
  updateStatsUI();
}

function handleFirstTryWrong(card, mode) {
  if (mode === "guess") {
    totalGuesses += 1;
  }

  firstTry = false;
  card.wrongAnswers += 1;
  card.levelStreak = 0;
  card.wrongTries += 1;

  globalStreak = 0;
  totalQs += 1;

  updateAccuracy(card);
  demoteCard(card);
  currentSession.set(card.id, card);
  updateStatsUI();
}

function handleCorrectAnswer(card, mode) {
  feedback.textContent = "כל הכבוד! תשובה נכונה";
  feedbackBg.classList.add("correct_bg");

  if (firstTry) {
    handleFirstTryCorrect(card, mode);
  }

  applyCorrectScore();
  markCardRemoved(card);

  const duration = performance.now() - startTime;
  card.recalls.push(Math.floor(duration));

  scoreStat.textContent = `${globalScore}`;
  stopTimer();

  applyCooldown(card);

  setTimeout(() => {
    updateUI();
  }, 1000);
}

function handleWrongAnswer(card, selected, mode) {
  const li = selected.closest("li");

  feedbackBg.classList.add("wrong_bg");
  submitMainBtn.classList.add("inactive");

  if (li) li.classList.add("wrong");

  selected.disabled = true;
  selected.checked = false;

  resetCardRemoval(card);

  currentTries += 1;

  if (firstTry) {
    handleFirstTryWrong(card, mode);
  } else {
    card.wrongTries += 1;
  }

  globalStreak = 0;
  streakStat.textContent = `${globalStreak}`;

  knowOrGuess.classList.add("hidden");
  submitMainBtn.classList.remove("hidden");

  feedback.textContent = `${getTriesMessage(currentTries)} נסה שוב`;

  setTimeout(() => {
    feedbackBg.classList.remove("wrong_bg");
  }, 1000);
}

/* -------------------- submit flow -------------------- */

function submitAnswer(mode) {
  if (!chosenCard) return;

  const selected = getSelectedAnswer();

  if (!selected) {
    feedback.textContent = "לא נבחרה תשובה";
    return;
  }

  const isCorrect = selected.value === chosenCard.answer;

  if (isCorrect) {
    handleCorrectAnswer(chosenCard, mode);
  } else {
    handleWrongAnswer(chosenCard, selected, mode);
  }

  console.log({
    mode,
    selected: selected.value,
    correct: chosenCard.answer,
    chosenCard,
    cards,
  });
}

/* -------------------- UI cycle -------------------- */

function updateUI() {
  console.log(currentSession);
  clearFeedbackState();
  currentTries = 0;
  firstTry = true;
  setSubmitStateInitial();
  pickQuestionAndAnswers();
  startTimer();
}

function skipQ(e) {
  e.preventDefault();
  if (!chosenCard) return;

  chosenCard.skipped += 1;
  updateUI();
}

/* -------------------- listeners -------------------- */

list.addEventListener("change", (e) => {
  if (e.target.name !== "answer") return;

  if (firstTry) {
    submitMainBtn.classList.add("hidden");
    knowOrGuess.classList.remove("hidden");
  } else {
    submitMainBtn.classList.remove("inactive");
  }
});

document.querySelectorAll(".submit").forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    const mode = e.currentTarget.dataset.mode;
    submitAnswer(mode);
  });
});

nextBtn.addEventListener("click", skipQ);

/* -------------------- init -------------------- */

updateStatsUI();
updateUI();
