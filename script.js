"use strict";
import data from "/latvian.js";

const qText = document.querySelector(".q");
const levelText = document.querySelector(".word_level");
const difArrow = document.querySelector(".arrow");
const qLabel = document.querySelector(".q_label");
const list = document.querySelector(".wordlist");
const submitMainBtn = document.querySelector(".main_ans");
const resetbtn = document.querySelector(".reset");
const knowOrGuess = document.querySelector(".knoworguess");
const feedback = document.querySelector(".feedback");
const scoreStat = document.querySelector(".score_stat");
const streakStat = document.querySelector(".streak_stat");
const timer = document.querySelector(".time_stat");
const totalFrom = document.querySelector(".total_from");
const feedbackBg = document.querySelector(".feedbackbg");
const starsFill = document.querySelector(".stars-fill");

const THIRTY_MINUTES = 30 * 60 * 1000;
const THIRTY_SECONDS = 10 * 1000;

const STORAGE_KEY = "vocab-app-progress-v1";

function createInitialCards() {
  return data.words.slice(1, 10).map((word, i) => ({
    id: i + 1,
    question: word.he,
    answer: word.en,
    diff: word.level,
    word_status: "new",
    appeared: 0,
    rightAnswers: 0,
    wordStreak: 0,
    levelStreak: 0,
    wrongAnswers: 0,
    accuracy: 0,
    wrongTries: 0,
    recalls: [],
    coolDown: THIRTY_SECONDS,
    onCooldown: false,
    cooldownUntil: null,
    sinceCooldown: null,
  }));
}

let cards = createInitialCards();

function saveProgress() {
  const state = {
    cards,
    globalScore,
    globalStreak,
    correctGuesses,
    totalGuesses,
    totalCorrect,
    totalQs,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    cards = createInitialCards();

    if (!raw) return;

    const state = JSON.parse(raw);
    if (!state) return;

    if (Array.isArray(state.cards)) {
      const savedCardsById = new Map(
        state.cards.map((card) => [card.id, card]),
      );

      cards = cards.map((card) => {
        const saved = savedCardsById.get(card.id);
        return saved ? { ...card, ...saved } : card;
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

  cards = data.words.slice(1, 10).map((word, i) => ({
    id: i + 1,
    question: word.he,
    answer: word.en,
    diff: word.level,
    word_status: "new",
    appeared: 0,
    rightAnswers: 0,
    wordStreak: 0,
    levelStreak: 0,
    wrongAnswers: 0,
    accuracy: 0,
    wrongTries: 0,
    recalls: [],
    coolDown: THIRTY_SECONDS,
    onCooldown: false,
    cooldownUntil: null,
    sinceCooldown: null,
  }));

  globalScore = 0;
  globalStreak = 0;
  correctGuesses = 0;
  totalGuesses = 0;
  totalCorrect = 0;
  totalQs = 0;
  updateUI();
  timer.textContent = "00:00";
  scoreStat.textContent = `${globalScore}`;
  streakStat.textContent = `${globalStreak}`;
  totalFrom.textContent = `  ${totalCorrect} מתוך ${totalQs} (ניחושים ${correctGuesses})`;
}

const STATUS = {
  NEW: "new",
  UNKNOWN: "unknown",
  RECOGNIZED: "recognized",
  KNOWN: "known",
  MASTERED: "mastered",
};

const HEBSTATUS = {
  new: "מילה חדשה",
  unknown: "מילה לא מוכרת",
  recognized: "מילה שאתה מזהה",
  known: "מילה שאתה מכיר",
  mastered: "מילה שאתה שולט בה",
};

const STARS = {
  new0: 0,
  unknown0: 0,
  recognized0: 20,
  known0: 40,
  known1: 60,
  known2: 80,
  mastered0: 100,
};

const DIFFLEVELS = {
  A1: "10%",
  A2: "30%",
  B1: "50%",
  B2: "60%",
  C1: "70%",
  C2: "90%",
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
let startTime;
let answerTime;
let btnDisabled = false;

function chooseQuestion() {
  console.log(cards);
  let randomIndex;
  let fromCooldowns = [];

  let noCooldownsCards = [];
  chosenCard = null;
  const now = Date.now();

  for (const card of cards) {
    if (!card.onCooldown) continue;
    if (card.onCooldown && card.cooldownUntil && now >= card.cooldownUntil) {
      card.sinceCooldown = now - card.cooldownUntil;
      fromCooldowns.push(card);
    }
  }
  console.log(fromCooldowns);
  // remove cards the user already know by specific critaeria

  if (fromCooldowns.length) {
    chosenCard = fromCooldowns.reduce((longest, card) =>
      card.sinceCooldown > longest.sinceCooldown ? card : longest,
    );
    console.log(chosenCard, "from cooldowns");
  }

  if (!chosenCard) {
    noCooldownsCards = cards.filter((card) => !card.onCooldown);
    if (noCooldownsCards.length > 0) {
      const minAppeared = Math.min(
        ...noCooldownsCards.map((card) => card.appeared),
      );

      const sortedQuestions = noCooldownsCards.filter(
        (card) => card.appeared === minAppeared,
      );
      randomIndex = Math.floor(Math.random() * sortedQuestions.length);
      chosenCard = sortedQuestions[randomIndex];
      console.log("not from cooldown", chosenCard);
    }
  }

  // make sure questions cycle without repetition before full cycle
  // check the highest appeared value and only allow questions with lower appered value show
  //if all appered values are equal then choose random from all cards.
  if (chosenCard) {
    chosenCard.appeared += 1;
    qText.textContent = chosenCard.question;
    starsFill.classList.remove("animate");
    levelText.textContent = HEBSTATUS[chosenCard.word_status];
    difArrow.style.left = DIFFLEVELS[chosenCard.diff];
    starsFill.style.setProperty(
      "--fill",
      `${STARS[chosenCard.word_status + chosenCard.levelStreak]}%`,
    );
  } else {
    feedback.textContent = "טוווווווב!!! אתה יודע את כל המילים יא גאון שכמוך";
    qText.textContent = "";
    list.style.display = "none";
    qLabel.style.display = "none";
  }
}

function pickQuestionAndAnswers() {
  chooseQuestion();
  // uppdate 4 naswers in a a list with radio buttons.
  function showAnswers() {
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

  const numberOfAns =
    chosenCard.word_status === "known"
      ? 5
      : chosenCard.word_status === "mastered"
        ? 6
        : 4;
  const answers = chooseAnswers(numberOfAns, chosenCard);

  function chooseAnswers(num, correct) {
    const wrongAnswers = [];
    while (num > wrongAnswers.length) {
      const randomAns =
        data.words[Math.floor(Math.random() * data.words.length)].en;
      if (!wrongAnswers.includes(randomAns) && randomAns !== correct.answer) {
        wrongAnswers.push(randomAns);
      }
    }
    const AllAns = wrongAnswers;
    const rightAnsPosition = Math.trunc(Math.random() * num);
    AllAns[rightAnsPosition] = correct.answer;
    return AllAns;
  }
  showAnswers();
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

function updateUI() {
  if (clock) clearInterval(clock);

  btnDisabled = false;
  document.querySelectorAll(".submit").forEach((button) => {
    button.disabled = false;
  });
  feedbackBg.classList.remove("correct_bg");
  knowOrGuess.classList.add("hidden");
  submitMainBtn.classList.remove("hidden");
  currentTries = 0;
  firstTry = true;
  renderTimer();

  feedback.textContent = "";
  pickQuestionAndAnswers();
  submitMainBtn.classList.add("inactive");
  startTimer();
}

function updateAccuracy(card) {
  card.accuracy = card.appeared > 0 ? card.rightAnswers / card.appeared : 0;
}

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
  if (card.word_status === STATUS.MASTERED) {
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

function updateWordStats(card) {
  levelText.textContent = HEBSTATUS[card.word_status];
  difArrow.style.left = DIFFLEVELS[card.diff];
  starsFill.style.setProperty(
    "--fill",
    `${STARS[card.word_status + card.levelStreak]}%`,
  );
}

function getTriesMessage(tries) {
  if (tries === 1) return "טעות ראשונה";
  if (tries === 2) return "טעות שנייה";
  if (tries === 3) return "טעות שלישית";
  if (tries === 4) return "טעות רביעית";
  return `טעות מספר ${tries}`;
}

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

function handleFirstTryCorrect(card, mode) {
  if (mode === "know") {
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

  updateWordStats(card);
  updateAccuracy(card);
  currentSession.set(card.id, card);

  renderStats();

  saveProgress();
}

function handleFirstTryWrong(card, mode) {
  if (mode === "know") {
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
  updateWordStats(card);
  currentSession.set(card.id, card);

  renderStats();

  saveProgress();
}

function handleCorrectAnswer(card, mode) {
  feedback.textContent = "כל הכבוד! תשובה נכונה";

  if (firstTry) {
    handleFirstTryCorrect(card, mode);
  }

  applyCorrectScore();

  renderStats();
  feedbackBg.classList.add("correct_bg");

  renderTimer();
  if (clock) clearInterval(clock);

  setTimeout(() => {
    feedbackBg.classList.remove("correct_bg");
    updateUI();
  }, 1000);
}

function handleWrongAnswer(card, selected) {
  const label = selected.closest("li");

  feedbackBg.classList.add("wrong_bg");
  submitMainBtn.classList.add("inactive");

  if (label) label.classList.add("wrong");

  selected.disabled = true;
  selected.checked = false;

  globalStreak = 0;
  renderStats();

  console.log(currentTries);
  if (firstTry) {
    handleFirstTryWrong(card);
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

function applyCooldown(isCorrect, mode, timeToAnswer, tries) {
  console.log("cooldown:");
  chosenCard.onCooldown = true;

  let cooldown = chosenCard.coolDown ?? 30 * 60 * 1000;

  const speedMult =
    timeToAnswer / 1000 < 2 ? 1.2 : timeToAnswer / 1000 < 4 ? 1.1 : 1;

  // const MIN = 10 * 60 * 1000;
  // const MAX = 21 * 24 * 60 * 60 * 1000;
  const MIN = 1000;
  const MAX = 100000;
  if (isCorrect && mode === "know") {
    cooldown *= 1.4 * speedMult;
  } else if (isCorrect && mode === "guess") {
    cooldown *= 1;
  } else if (!isCorrect && mode === "guess") {
    cooldown *= 0.8;
  } else if (!isCorrect && mode === "know") {
    cooldown *= 0.6;
  } else if (!isCorrect && mode === "main" && tries > 2) {
    cooldown *= 0.9;
  }

  cooldown = Math.max(MIN, Math.min(MAX, cooldown));
  const cooldownInSec = cooldown / 1000;
  console.log(cooldownInSec);
  chosenCard.coolDown = cooldown;
  chosenCard.cooldownUntil = Date.now() + cooldown;
  saveProgress();
}

document.querySelectorAll(".submit").forEach((button) => {
  button.addEventListener("click", onSubmit);
});

function onSubmit(e) {
  e.preventDefault();

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

  const correctAns = selected.value === chosenCard.answer;
  const duration = performance.now() - startTime;

  currentTries++;
  // button.disabled = true;
  applyCooldown(correctAns, mode, duration, currentTries);

  if (correctAns) {
    handleCorrectAnswer(chosenCard, mode);
  } else {
    handleWrongAnswer(chosenCard, selected, mode);

    btnDisabled = false;
    document.querySelectorAll(".submit").forEach((btn) => {
      btn.disabled = false;
    });
  }
}
let clock;

function startTimer() {
  startTime = performance.now();
  let totalSeconds = 0;
  let seconds = 0;
  let minutes = 0;
  function tick() {
    totalSeconds += 1;
    seconds = String(totalSeconds % 60).padStart(2, 0);
    minutes = String(Math.floor(totalSeconds / 60)).padStart(2, 0);
    timer.textContent = `${minutes}:${seconds}`;
  }
  clock = setInterval(tick, 1000);
}

function renderStats() {
  scoreStat.textContent = `${globalScore}`;
  streakStat.textContent = `${globalStreak}`;
  totalFrom.textContent = `${totalCorrect} מתוך ${totalQs} (ניחושים ${correctGuesses})`;
}

function renderTimer(time = "00:00") {
  timer.textContent = time;
}

resetbtn.addEventListener("click", resetProgress);

loadProgress();
updateUI();
renderTimer();
renderStats();
