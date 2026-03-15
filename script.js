"use strict";
import data from "/dataset.js";

const qText = document.querySelector(".q");
const qLabel = document.querySelector(".q_label");
const ansText = document.querySelector(".ans");
const list = document.querySelector(".wordlist");
const nextBtn = document.querySelector(".next_btn");
const submitBtn = document.querySelector(".submit");
const feedback = document.querySelector(".feedback");
const scoreStat = document.querySelector(".score_stat");
const streakStat = document.querySelector(".streak_stat");
const timer = document.querySelector(".time_stat");
const totalFrom = document.querySelector(".total_from");
const feedbackBg = document.querySelector(".feedbackbg");

// const pairs = (arr1, arr2) => arr1.map((item, i) => [item, arr2[i]]);

// const objectPairs = data.qs.map((item, i) => ({ [i]: item }));

// const objectPairsReduce = data.qs.reduce((obj, item, i) => {
//   obj[i] = {
//     ["question " + (i + 1)]: [item, data.ans[i]],
//     appeared: 0,
//     rightAnswers: 0,
//     wrongAnswers: 0,
//   };
//   return obj;
// }, {});

// function set_word_status(word) {
//   if (this.appeared === 1) {
//     this.word_status = "מילה חדשה";
//   } else if (this.appeared > 1 && this.removed) {
//     this.word_status = "נלמדה";
//   } else {
//     this.word_status = "בתהליך למידה";
//   }
// }

// if (data.qs.length !== data.ans.length)
//   throw new Error("Questions and answers mismatch");

const cards = data.words.slice(100, 105).map((word, i) => ({
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
  removed: false,
  removedTime: 0,
  removedStreak: 0,
  deleted: false,
}));

// const qLentgh = cards.length;
let updatedCards;
let chosenCard;
let firstTry = true;
let currentTries = 0;
let globalStreak = 0;
let globalScore = 0;
let coolDown = 2500;
let totalCorrect = 0;
let totalQs = 0;
let currentSession = new Map();
let startTime;
let answerTime;
// choose a random number between 0 - qLength
// show the quesion text by index qLength -1 becuase indexes start from 0.

function chooseQuestion() {
  let randomIndex;

  //recover removed cards after cooldwown
  for (const card of cards) {
    if (!card.removed) continue;
    console.log("check");
    //   console.log(card.removed);
    const coolDownCalc = coolDown * card.removedStreak;
    console.log(coolDownCalc, card.removedStreak);
    if (Date.now() - card.removedTime > coolDownCalc) {
      card.removed = false;
      card.removedTime = null;
    }
  }

  // remove cards the uswe already know by specific critaeria

  updatedCards = cards.filter((card) => !card.removed);

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
      submitBtn.classList.remove("inactive");
    }
  });

  const answers = chooseAnswers(4, chosenCard);

  //   function chooseAnswers(num, correct) {
  //     console.log(correct);
  //     const appearedMost = cards
  //       .slice()
  //       .sort((a, b) => b.appeared - a.appeared)[0].appeared;
  //     console.log(appearedMost);

  //     const arr = [];
  //     const filtered = cards
  //       .slice()
  //       .filter((card) => card.appeared < appearedMost);
  //     console.log(filtered);
  //     const filteredLength = filtered.length;
  //     while (arr.length < num) {
  //       const randomaAns = Math.trunc(Math.random() * filteredLength);
  //       if (cards[randomaAns] !== correct && !arr.includes(randomaAns))
  //         arr.push(randomaAns);
  //     }
  //     console.log(arr);
  //     const allAnswers = arr.map((num) => filtered[num].answer);
  //     const randomPlace = Math.trunc(Math.random() * num);
  //     arr[randomPlace] = randomIndex;
  //     console.log(arr);
  //     allAnswers[randomPlace] = correct.answer;
  //     return allAnswers;
  //   }
  //   showAnswers();
  // }

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
  startTimer();
  currentTries = 0;
  firstTry = true;
  feedback.textContent = "";
  pickQuestionAndAnswers();
  submitBtn.classList.add("inactive");
}

function skipQ(e) {
  e.preventDefault();
  chosenCard.skipped += 1;
  updateUI();
}

// console.log(pairs(data.words, data.definitions));

submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const selected = document.querySelector('input[name="answer"]:checked');

  if (!selected) {
    feedback.textContent = "לא נבחרה תשובה";
    return;
  }

  console.log("User chose:", selected.value);
  console.log(chosenCard.answer);
  if (selected.value === chosenCard.answer) {
    console.log("correct answer");
    feedback.textContent = "כל הכבוד! תשובה נכונה";

    if (firstTry) {
      chosenCard.rightAnswers += 1;
      chosenCard.wordStreak += 1;
      chosenCard.levelStreak += 1;
      globalStreak += 1;
      totalCorrect += 1;
      totalQs += 1;
      totalFrom.textContent = `${totalCorrect} מתוך ${totalQs}`;

      streakStat.textContent = `${globalStreak}`;
      chosenCard.accuracy = chosenCard.rightAnswers / chosenCard.appeared;
      if (chosenCard.word_status === "unknown") {
        chosenCard.word_status = "recognized";
        chosenCard.levelStreak = 0;
      }

      if (chosenCard.word_status === "new") {
        chosenCard.word_status = "recognized";
        chosenCard.levelStreak = 0;
      }

      if (
        chosenCard.word_status === "recognized" &&
        chosenCard.levelStreak >= 2
      ) {
        chosenCard.word_status = "known";
        chosenCard.levelStreak = 0;
      }
      if (chosenCard.word_status === "known" && chosenCard.levelStreak >= 3) {
        chosenCard.word_status = "mastered";
        chosenCard.levelStreak = 0;
      }

      currentSession.set(chosenCard.id, chosenCard);
    }
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

    if (chosenCard.wordStreak >= 1) {
      chosenCard.removed = true;
      chosenCard.removedTime = Date.now();
      chosenCard.removedStreak += 1;
    }
    scoreStat.textContent = `${globalScore}`;
    feedbackBg.classList.add("correct_bg");
    const duration = performance.now() - startTime;
    chosenCard.recalls.push(Math.floor(duration));
    console.log(chosenCard);

    timer.textContent = "00:00";
    if (clock) clearInterval(clock);
    setTimeout(updateUI, 1000);
  } else {
    let triesMsg;
    const label = selected.closest("li");
    setTimeout(() => {
      feedbackBg.classList.remove("wrong_bg");
      feedback.textContent = "";
    }, 1000);
    feedbackBg.classList.add("wrong_bg");
    console.log("wrong answer");
    submitBtn.classList.add("inactive");
    label.classList.add("wrong");
    selected.disabled = true;
    selected.checked = false;
    chosenCard.removed = false;
    chosenCard.removedTime = null;
    chosenCard.removedStreak = 0;
    chosenCard.wordStreak = 0;
    globalStreak = 0;
    streakStat.textContent = `${globalStreak}`;
    currentTries += 1;
    chosenCard.wrongTries += 1;
    if (firstTry) {
      firstTry = false;
      chosenCard.wrongAnswers += 1;
      chosenCard.accuracy = chosenCard.rightAnswers / chosenCard.appeared;
      totalQs += 1;
      totalFrom.textContent = `${totalCorrect} מתוך ${totalQs}`;
      if (chosenCard.word_status === "new") {
        chosenCard.word_status = "unknown";
        chosenCard.levelStreak = 0;
      }
      if (chosenCard.word_status === "recognized") {
        chosenCard.word_status = "unknown";
        chosenCard.levelStreak = 0;
      }
      if (chosenCard.word_status === "known") {
        chosenCard.word_status = "recognized";
        chosenCard.levelStreak = 0;
      }
      if (chosenCard.word_status === "mastered") {
        chosenCard.word_status = "known";
        chosenCard.levelStreak = 0;
      }

      currentSession.set(chosenCard.id, chosenCard);
    }
    chosenCard.levelStreak = 0;
    if (currentTries === 1) {
      triesMsg = "טעות ראשונה";
    } else if (currentTries === 2) {
      triesMsg = "טעות שנייה";
    } else if (currentTries === 3) {
      triesMsg = "טעות שלישית";
    } else if (currentTries === 4) {
      triesMsg = "טעות רביעית";
    } else if (currentTries >= 5) {
      triesMsg = `טעות מספר ${currentTries} `;
    }
    feedback.textContent = `${triesMsg} נסה שוב`;
  }

  console.log(cards);
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

// function Person() {
//   this.name = "my name";
//   this.phone = "057365736";
// }

// const jon = new Person();
// jon.name = "jon";

// const jane = new Person();
// jane.phone = "032487354";

// Person.prototype.callme = function () {
//   return this.phone;
// };

// console.log(jane.callme());

// const shape = {
//   size: 50,
//   area: 100,
//   calc: function () {
//     return `calculate my ${this.size}`;
//   },
// };

// const tri = Object.create(shape);
// console.log(tri.calc());

// class Ish {
//   constructor(name) {
//     this.name = name;
//   }

//   greet() {
//     console.log(`Hi ${this.name}`);
//   }
// }

// console.log(Ish);
// const loren = new Ish("loren");

// console.log(loren);
// loren.greet();
