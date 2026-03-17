"use strict";
import data from "/dataset_c2.js";

const qText = document.querySelector(".q");
const qLabel = document.querySelector(".q_label");
const list = document.querySelector(".wordlist");
const nextBtn = document.querySelector(".next_btn");
const submitMainBtn = document.querySelector(".main_ans");
const knowOrGuess = document.querySelector(".knoworguess");
const feedback = document.querySelector(".feedback");
const scoreStat = document.querySelector(".score_stat");
const streakStat = document.querySelector(".streak_stat");
const timer = document.querySelector(".time_stat");
const totalFrom = document.querySelector(".total_from");
const feedbackBg = document.querySelector(".feedbackbg");

const cards = data.words.map((word, i) => ({
  id: i + 1,
  question: word.en,
  answer: word.he,
  word_status: "new",
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
  removedTime: 0,
  removedStreak: 0,
  deleted: false,
}));

const STATUS = {
  NEW: "new",
  UNKNOWN: "unknown",
  RECOGNIZED: "recognized",
  KNOWN: "known",
  MASTERED: "mastered",
};

//days / hours / (mins) / seconds

86400000 / 24 / 60;

const COOLDOWNSUNITS = {
  COOLDAYS: 86400000,
  COOLHOURS: 86400000 / 24,
  COOLMINUTES: 86400000 / 24 / 60,
};

const COOLDOWNS = {
  new: {
    0: 0,
  },
  unknown: {
    0: 10 * COOLDOWNSUNITS.COOLMINUTES,
  },
  recognized: {
    0: 12 * COOLDOWNSUNITS.COOLHOURS,
    1: 1 * COOLDOWNSUNITS.COOLDAYS,
  },
  known: {
    0: 2 * COOLDOWNSUNITS.COOLDAYS,
    1: 3 * COOLDOWNSUNITS.COOLDAYS,
    2: 5 * COOLDOWNSUNITS.COOLDAYS,
  },
  mastered: {
    0: 7 * COOLDOWNSUNITS.COOLDAYS,
    1: 14 * COOLDOWNSUNITS.COOLDAYS,
    2: 21 * COOLDOWNSUNITS.COOLDAYS,
  },
};

let updatedCards;
let chosenCard;
let firstTry = true;
let currentTries = 0;
let globalStreak = 0;
let globalScore = 0;
let correctGuesses = 0;
let totalGuesses = 0;
let coolDown = 2500;
let totalCorrect = 0;
let totalQs = 0;
let currentSession = new Map();
let startTime;
let answerTime;

function chooseQuestion() {
  let randomIndex;

  for (const card of cards) {
    if (!card.onCooldown) continue;
    if (Date.now() >= card.cooldownUntil) card.onCooldown = false;
  }

  // remove cards the uswe already know by specific critaeria

  updatedCards = cards.filter((card) => !card.onCooldown);

  // make sure questions cycle without repetition before full cycle
  // check the highest appeared value and only allow questions with lower appered value show
  //if all appered values are equal then choose random from all cards.

  if (updatedCards.length > 0) {
    console.log(updatedCards);

    const minAppeared = Math.min(...updatedCards.map((card) => card.appeared));
    console.log(minAppeared);

    const sortedQuestions = updatedCards.filter(
      (card) => card.appeared === minAppeared,
    );
    console.log(sortedQuestions);
    randomIndex = Math.floor(Math.random() * sortedQuestions.length);
    chosenCard = sortedQuestions[randomIndex];
    qText.textContent = chosenCard.question;
    chosenCard.appeared += 1;
    console.log(chosenCard);
    // set_word_status.call(chosenCard);
  } else {
    feedback.textContent = "טוווווווב!!! אתה יודע את כל המילים יא גאון שכמוך";
    qText.textContent = "";
    list.style.display = "none";
    qLabel.style.display = "none";
  }
}

function pickQuestionAndAnswers() {
  chooseQuestion();
  // uppdate 4 snaswers in a a list with radio buttons.
  function showAnswers() {
    list.textContent = "";
    answers.forEach((answer) => {
      list.innerHTML += `
    <li>
      <label class="answer_label">
        <input type="radio" name="answer" value="${answer}">
        ${answer}
      </label>
    </li>
  `;
    });
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

  const answers = chooseAnswers(4, chosenCard);

  function chooseAnswers(num, correct) {
    const wrongAnswers = [];
    while (num > wrongAnswers.length) {
      const randomAns =
        data.words[Math.floor(Math.random() * data.words.length)].he;
      if (!wrongAnswers.includes(randomAns) && randomAns !== correct.answer) {
        wrongAnswers.push(randomAns);
      }
    }
    console.log(wrongAnswers);
    const AllAns = wrongAnswers;
    const rightAnsPosition = Math.trunc(Math.random() * num);
    AllAns[rightAnsPosition] = correct.answer;
    return AllAns;
  }
  showAnswers();
}

function updateUI() {
  console.log(currentSession);
  feedbackBg.classList.remove("correct_bg");
  knowOrGuess.classList.add("hidden");
  submitMainBtn.classList.remove("hidden");
  startTimer();
  currentTries = 0;
  firstTry = true;
  feedback.textContent = "";
  pickQuestionAndAnswers();
  submitMainBtn.classList.add("inactive");
}

function skipQ(e) {
  e.preventDefault();
  chosenCard.skipped += 1;
  updateUI();
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

function markCardRemoved(card) {
  // Choose ONE streak field and use it consistently.
  // Here I assume wordStreak is the correct one.
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

  updateAccuracy(card);
  currentSession.set(card.id, card);

  totalFrom.textContent = `  ${totalCorrect} מתוך ${totalQs} (ניחושים ${correctGuesses})`;
  streakStat.textContent = `${globalStreak}`;
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
  currentSession.set(card.id, card);

  totalFrom.textContent = `  ${totalCorrect} מתוך ${totalQs} (ניחושים ${correctGuesses})`;
  streakStat.textContent = `${globalStreak}`;
}

function handleCorrectAnswer(card, mode) {
  console.log("correct answer");
  feedback.textContent = "כל הכבוד! תשובה נכונה";

  if (firstTry) {
    handleFirstTryCorrect(card, mode);
  }

  applyCorrectScore();
  markCardRemoved(card);

  scoreStat.textContent = `${globalScore}`;
  feedbackBg.classList.add("correct_bg");

  const duration = performance.now() - startTime;
  card.recalls.push(Math.floor(duration));

  timer.textContent = "00:00";
  if (clock) clearInterval(clock);

  console.log(card);

  setTimeout(() => {
    feedbackBg.classList.remove("correct_bg");
    updateUI();
  }, 1000);
}

function handleWrongAnswer(card, selected) {
  console.log("wrong answer");

  const label = selected.closest("li");

  feedbackBg.classList.add("wrong_bg");
  submitMainBtn.classList.add("inactive");

  if (label) label.classList.add("wrong");

  selected.disabled = true;
  selected.checked = false;

  resetCardRemoval(card);

  globalStreak = 0;
  streakStat.textContent = `${globalStreak}`;

  currentTries += 1;

  if (firstTry) {
    handleFirstTryWrong(card);
  } else {
    card.wrongTries += 1;
  }
  knowOrGuess.classList.add("hidden");
  submitMainBtn.classList.remove("hidden");

  feedback.textContent = `${getTriesMessage(currentTries)} נסה שוב`;

  setTimeout(() => {
    feedbackBg.classList.remove("wrong_bg");
    feedback.textContent = "";
  }, 1000);
}

document.querySelectorAll(".submit").forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    const mode = e.currentTarget.dataset.mode;
    console.log(mode);

    const selected = document.querySelector('input[name="answer"]:checked');

    if (!selected) {
      feedback.textContent = "לא נבחרה תשובה";
      return;
    }

    console.log("User chose:", selected.value);
    console.log("Correct answer:", chosenCard.answer);

    if (selected.value === chosenCard.answer) {
      handleCorrectAnswer(chosenCard, mode);
    } else {
      handleWrongAnswer(chosenCard, selected, mode);
    }

    const coolDown =
      COOLDOWNS[chosenCard.word_status]?.[chosenCard.levelStreak];
    if (coolDown > 0) chosenCard.onCooldown = true;
    chosenCard.coolDown = coolDown;
    chosenCard.cooldownUntil = Date.now() + coolDown;
    console.log(cards);
  });
});

nextBtn.addEventListener("click", skipQ);

let clock;

function startTimer() {
  startTime = performance.now();
  console.log(startTime);
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

updateUI();
