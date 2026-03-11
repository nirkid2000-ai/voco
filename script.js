"use strict";

const data = {
  ans: [
    "דיוק",
    "יכולת הסתגלות",
    "ניתוח",
    "הערכה",
    "הטיה",
    "בהירות",
    "לכידות",
    "עקביות",
    "סתירה",
    "אמינות",
    "ביקורת",
    "ציניות",
    "ניכוי",
    "הידרדרות",
    "התלבטות",
    "חריצות",
    "שיח",
    "עיוות",
    "שליטה",
    "יעילות",
    "שוויון",
    "הגזמה",
    "ניצול",
    "היתכנות",
    "שטף",
    "ניסוח",
    "הכללה",
    "השערה",
    "אידיאולוגיה",
    "אשליה",
    "השלכה",
    "תמריץ",
    "הסקה",
    "תחכום",
    "יושרה",
    "התערבות",
    "אינטואיציה",
    "אירוניה",
    "הצדקה",
    "היסוס",
    "המחשה",
    "מורשת",
    "לגיטימיות",
    "תחזוקה",
    "מניפולציה",
    "בשלה",
    "מיתוס",
    "ניואנס",
    "ציות",
    "התיישנות",
    "פרדוקס",
    "דיוק",
    "התמדה",
    "שכנוע",
    "פסימיות",
    "רלוונטיות",
    "חוסן",
    "איפוק",
    "קשיחות",
    "הקרבה",
    "סקפטיות",
    "יציבות",
    "השערה",
    "קיימות",
    "סמליות",
    "טקטיקה",
    "סובלנות",
    "שקיפות",
    "תועלת",
    "תוקף",
    "רבגוניות",
    "חולשה",
    "חוכמה",
    "שאפתנות",
    "בהירות",
    "אמינות",
    "מסירות",
    "חריגות",
    "דחיפות",
    "הסלמה",
    "הערכה",
    "היסוס",
    "עוין",
    "אדישות",
    "הטמעה",
    "דחף",
    "התרשמות",
    "חדשנות",
    "חקירה",
    "בידוד",
    "התמדה",
    "דיוק",
    "דומיננטיות",
    "תפיסה מוטעית",
    "הפרעה",
    "יריבות",
    "התעלות",
    "פגיעות",
  ],

  qs: [
    "Precision",
    "Adaptability",
    "Analysis",
    "Assessment",
    "Bias",
    "Clarity",
    "Coherence",
    "Consistency",
    "Contradiction",
    "Credibility",
    "Criticism",
    "Cynicism",
    "Deduction",
    "Deterioration",
    "Dilemma",
    "Diligence",
    "Discourse",
    "Distortion",
    "Dominance",
    "Effectiveness",
    "Equality",
    "Exaggeration",
    "Exploitation",
    "Feasibility",
    "Fluency",
    "Formulation",
    "Generalization",
    "Hypothesis",
    "Ideology",
    "Illusion",
    "Implication",
    "Incentive",
    "Inference",
    "Ingenuity",
    "Integrity",
    "Intervention",
    "Intuition",
    "Irony",
    "Justification",
    "Reluctance",
    "Illustration",
    "Legacy",
    "Legitimacy",
    "Maintenance",
    "Manipulation",
    "Maturity",
    "Myth",
    "Nuance",
    "Obedience",
    "Obsolescence",
    "Paradox",
    "Accuracy",
    "Perseverance",
    "Persuasion",
    "Pessimism",
    "Relevance",
    "Resilience",
    "Restraint",
    "Rigidity",
    "Sacrifice",
    "Skepticism",
    "Stability",
    "Speculation",
    "Sustainability",
    "Symbolism",
    "Tactic",
    "Tolerance",
    "Transparency",
    "Utility",
    "Validity",
    "Versatility",
    "Vulnerability",
    "Wisdom",
    "Aspiration",
    "Certainty",
    "Reliability",
    "Dedication",
    "Deviation",
    "Urgency",
    "Escalation",
    "Appraisal",
    "Hesitation",
    "Hostility",
    "Indifference",
    "Assimilation",
    "Impulse",
    "Impression",
    "Innovation",
    "Inquiry",
    "Isolation",
    "Persistence",
    "Exactness",
    "Supremacy",
    "Misconception",
    "Disruption",
    "Rivalry",
    "Transcendence",
    "Fragility",
  ],
};

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

console.log(data);

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

function set_word_status(word) {
  if (this.appeared === 1) {
    return "מילה חדשה";
  } else if (this.appeared > 1 && this.removed) {
    return "נלמדה";
  } else {
    return "בתהליך למידה";
  }
}

// if (data.qs.length !== data.ans.length)
//   throw new Error("Questions and answers mismatch");

const cards = data.qs.map((word, i) => ({
  id: i + 1,
  question: word,
  answer: data.ans[i],
  word_status: "new",
  appeared: 0,
  skipped: 0,
  rightAnswers: 0,
  streak: 0,
  wrongAnswers: 0,
  accuracy: 0,
  wrongTries: 0,
  removed: false,
  removedTime: 0,
  removedStreak: 0,
  deleted: false,
}));

// const qLentgh = cards.length;
let updatedCards;
let chosenCard;
let firstWrong = false;
let currentTries = 0;
let globalStreak = 0;
let globalScore = 0;
let coolDown = 2500;
let totalCorrect = 0;
let totalQs = 0;
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
    console.log("sorted", chosenCard);
    set_word_status.call(chosenCard);
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
      <label>
        <input type="radio" name="answer" value="${answer}">
        ${answer}
      </label>
    </li>
  `;
    });
  }

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
      const randomAns = data.ans[Math.floor(Math.random() * data.ans.length)];
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
  timer.textContent = "00:00";
  if (clock) clearInterval(clock);
  startTimer();
  currentTries = 0;
  firstWrong = false;
  feedback.textContent = "";
  pickQuestionAndAnswers();
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
    feedback.textContent = "בחר תשובה או דלג שאלה";
    return;
  }

  console.log("User chose:", selected.value);
  console.log(chosenCard.answer);
  if (selected.value === chosenCard.answer) {
    console.log("correct answer");
    feedback.textContent = "כל הכבוד! תשובה נכונה";
    if (!firstWrong) {
      chosenCard.rightAnswers += 1;
      chosenCard.streak += 1;
      globalStreak += 1;
      totalCorrect += 1;

      streakStat.textContent = `${globalStreak}`;
      chosenCard.accuracy = chosenCard.rightAnswers / chosenCard.appeared;
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

    if (chosenCard.streak >= 1) {
      chosenCard.removed = true;
      chosenCard.removedTime = Date.now();
      chosenCard.removedStreak += 1;
    }
    scoreStat.textContent = `${globalScore}`;

    updateUI();
  } else {
    let triesMsg;
    console.log("wrong answer");
    chosenCard.removed = false;
    chosenCard.removedTime = null;
    chosenCard.removedStreak = 0;
    chosenCard.streak = 0;
    globalStreak = 0;
    streakStat.textContent = `${globalStreak}`;
    currentTries += 1;
    chosenCard.wrongTries += 1;
    if (!firstWrong) {
      firstWrong = true;
      chosenCard.wrongAnswers += 1;
      chosenCard.accuracy = chosenCard.rightAnswers / chosenCard.appeared;
    }
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
    feedback.textContent = `${triesMsg} נסה שוב או דלג שאלה`;
  }
  if (!firstWrong) {
    totalQs += 1;
    totalFrom.textContent = `${totalCorrect} מתוך ${totalQs}`;
  }

  console.log(cards);
});

nextBtn.addEventListener("click", skipQ);

let clock;

function startTimer() {
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
