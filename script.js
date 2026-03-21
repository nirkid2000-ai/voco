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
const countdown = document.querySelector(".countdown");
const countdownCon = document.querySelector(".countdown_con");
const submitButtons = document.querySelectorAll(".submit");

const THIRTY_MINUTES = 30 * 60 * 1000;
const THIRTY_SECONDS = 10 * 1000;

const STORAGE_KEY = "vocab-app-progress-v1";

function createDefaultProgress() {
  return {
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
    isCountdown: false,
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
        appeared: card.appeared,
        rightAnswers: card.rightAnswers,
        wordStreak: card.wordStreak,
        levelStreak: card.levelStreak,
        wrongAnswers: card.wrongAnswers,
        accuracy: card.accuracy,
        wrongTries: card.wrongTries,
        recalls: card.recalls,
        coolDown: card.coolDown,
        onCooldown: card.onCooldown,
        cooldownUntil: card.cooldownUntil,
        sinceCooldown: card.sinceCooldown,
        isCountdown: card.isCountdown,
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

  cards = data.words.map((word, i) => ({
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
  resetState();
  list.style.display = "flex";
  renderStats();
  renderTimer();
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
  new0: 30,
  unknown0: 30,
  recognized0: 30,
  recognized1: 30,
  known0: 25,
  known1: 20,
  knownWell0: 20,
  knownWell1: 15,
  strong0: 10,
  strong1: 5,
  mastered0: 3,
  mastered1: 3,
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
let startTime;
let btnDisabled = false;
let flipQuestion = false;
let countdownInterval;
let timeOut = false;
let submitted = false;
let clock;

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
  if (!chosenCard) {
    chosenCard = cards.reduce((longest, card) =>
      card.cooldownUntil < longest.cooldownUntil ? card : longest,
    );
    console.log(chosenCard, "from during cooldowns");
  }

  // make sure questions cycle without repetition before full cycle
  // check the highest appeared value and only allow questions with lower appered value show
  //if all appered values are equal then choose random from all cards.
  if (chosenCard) {
    if (
      chosenCard.word_status === "strong" ||
      chosenCard.word_status === "mastered"
    )
      flipQuestion = true;
    chosenCard.appeared += 1;
    qText.textContent = flipQuestion ? chosenCard.answer : chosenCard.question;
    starsFill.classList.remove("animate");
    levelText.textContent = HEBSTATUS[chosenCard.word_status];
    difArrow.style.left = DIFFLEVELS[chosenCard.diff];
    starsFill.style.setProperty(
      "--fill",
      `${STARS[chosenCard.word_status + chosenCard.levelStreak]}%`,
    );
    // } else {
    // feedback.textContent = "טוווווווב!!! אתה יודע את כל המילים יא גאון שכמוך";
    // qText.textContent = "";
    // list.style.display = "none";
    // qLabel.style.display = "none";
  }
}

function pickQuestionAndAnswers() {
  chooseQuestion();
  // uppdate 4 naswers in a a list with radio buttons.
  if (chosenCard) {
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

    const status = chosenCard.word_status;

    const numberOfAns =
      status === "mastered"
        ? 6
        : status === "knownWell" || status === "strong"
          ? 5
          : 4;

    // const answerKey = flipQuestion ? "he" : "en";
    const correctAnswer = flipQuestion
      ? chosenCard.question
      : chosenCard.answer;

    const answers = chooseAnswers(numberOfAns, correctAnswer);

    function chooseAnswers(num, correctAnswer) {
      const answerKey = flipQuestion ? "he" : "en";

      const maxLenDiff =
        chosenCard.word_status === "new" || chosenCard.word_status === "unknown"
          ? 4
          : chosenCard.word_status === "recognized" ||
              chosenCard.word_status === "known"
            ? 3
            : 2;

      const strictPool = data.words.filter((word) => {
        const candidate = word[answerKey];
        if (candidate === correctAnswer) return false;
        if (word.level !== chosenCard.diff) return false;
        return Math.abs(candidate.length - correctAnswer.length) <= maxLenDiff;
      });

      const sameLevelPool = data.words.filter((word) => {
        const candidate = word[answerKey];
        return candidate !== correctAnswer && word.level === chosenCard.diff;
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

    showAnswers();
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

  if (card.word_status === STATUS.RECOGNIZED && card.levelStreak >= 2) {
    card.word_status = STATUS.KNOWN;
    card.levelStreak = 0;
    return;
  }

  if (card.word_status === STATUS.KNOWN && card.levelStreak >= 2) {
    card.word_status = STATUS.KNOWWELL;
    card.levelStreak = 0;
    card.isCountdown = true;
  }

  if (card.word_status === STATUS.KNOWWELL && card.levelStreak >= 2) {
    card.word_status = STATUS.STRONG;
    card.levelStreak = 0;
    card.isCountdown = true;
  }

  if (card.word_status === STATUS.STRONG && card.levelStreak >= 2) {
    card.word_status = STATUS.MASTERED;
    card.levelStreak = 0;
    card.isCountdown = true;
  }
  if (card.word_status === STATUS.MASTERED) {
    if (card.levelStreak >= 2) {
      card.levelStreak = 1;
      card.isCountdown = true;
    }
  }
}

function demoteCard(card) {
  if (card.word_status === STATUS.NEW) {
    card.word_status = STATUS.UNKNOWN;
    card.levelStreak = 0;
    card.isCountdown = false;

    return;
  }

  if (card.word_status === STATUS.RECOGNIZED) {
    card.word_status = STATUS.UNKNOWN;
    card.levelStreak = 1;
    card.isCountdown = false;

    return;
  }

  if (card.word_status === STATUS.KNOWN) {
    card.word_status = STATUS.RECOGNIZED;
    card.levelStreak = 1;
    card.isCountdown = false;

    return;
  }
  if (card.word_status === STATUS.KNOWWELL) {
    card.word_status = STATUS.KNOWN;
    card.levelStreak = 1;
    card.isCountdown = false;

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
  const duration = performance.now() - startTime;
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
  console.log("clear count");
  clearInterval(countdownInterval);
  countdown.style.width = `0%`;
  // countdownCon.style.display = "none";

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

  console.log(currentTries);
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
  const key = flipQuestion ? "question" : "answer";
  const correctAns = selected.value === chosenCard[key];
  const duration = performance.now() - startTime;
  submitted = true;
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

function startCountDown() {
  countdownCon.style.display = "block";
  let width = 100;
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  countdownInterval = setInterval(
    () => {
      width -= 0.25;
      countdown.style.width = `${width}%`;

      if (width <= 0 || submitted) {
        clearInterval(countdownInterval);
        timeOut = true;
      }
    },
    `${COUNTDOWNTIMES[chosenCard.word_status + chosenCard.levelStreak]}` * 2.5,
  );
}

function resetState() {
  if (clock) clearInterval(clock);
  submitButtons.forEach((button) => {
    button.disabled = false;
  });
  currentTries = 0;
  firstTry = true;
  flipQuestion = false;
  btnDisabled = false;
  timeOut = false;
  submitted = false;
  pickQuestionAndAnswers();
  renderTimer();
  if (chosenCard.isCountdown) startCountDown();
  startTimer();
  updateUI();
}

function updateUI() {
  countdownCon.style.display = "none";
  feedbackBg.classList.remove("correct_bg");
  knowOrGuess.classList.add("hidden");
  submitMainBtn.classList.remove("hidden");
  feedback.textContent = "";
  submitMainBtn.classList.add("inactive");
}

function startApp() {
  loadProgress();
  resetState();
  renderTimer();
  renderStats();
}

startApp();

resetbtn.addEventListener("click", resetProgress);

submitButtons.forEach((button) => {
  button.addEventListener("click", onSubmit);
});
