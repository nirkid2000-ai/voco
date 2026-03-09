"use strict";

const data = {
  ans: [
    "כלב",
    "חתול",
    "סירה",
    "מים",
    "שולחן",
    "חלון",
    "ביצה",
    "תיק",
    // "אדום",
    // "בשר",
    // "לחם",
    // "חלב",
    // "בית",
    // "דלת",
    // "כיסא",
    // "ספר",
    // "עט",
    // "מחברת",
    // "עיר",
    // "רחוב",
    // "עץ",
    // "פרח",
    // "שמש",
    // "ירח",
    // "כוכב",
    // "הר",
    // "נהר",
    // "ים",
    // "חול",
    // "רוח",
    // "אש",
    // "אדמה",
    // "זהב",
    // "כסף",
    // "זמן",
    // "יום",
    // "לילה",
    // "שנה",
    // "חבר",
    // "משפחה",
    // "ילד",
    // "ילדה",
    // "אוכל",
    // "שתייה",
    // "שוק",
    // "חנות",
    // "מפתח",
    // "טלפון",
    // "מחשב",
    // "עבודה",
  ],

  qs: [
    "Dog",
    "Cat",
    "Boat",
    "Water",
    "Table",
    "Window",
    "Egg",
    "Bag",
    // "Red",
    // "Meat",
    // "Bread",
    // "Milk",
    // "House",
    // "Door",
    // "Chair",
    // "Book",
    // "Pen",
    // "Notebook",
    // "City",
    // "Street",
    // "Tree",
    // "Flower",
    // "Sun",
    // "Moon",
    // "Star",
    // "Mountain",
    // "River",
    // "Sea",
    // "Sand",
    // "Wind",
    // "Fire",
    // "Earth",
    // "Gold",
    // "Silver",
    // "Time",
    // "Day",
    // "Night",
    // "Year",
    // "Friend",
    // "Family",
    // "Boy",
    // "Girl",
    // "Food",
    // "Drink",
    // "Market",
    // "Shop",
    // "Key",
    // "Phone",
    // "Computer",
    // "Work",
  ],
};

const qText = document.querySelector(".q");
const qLabel = document.querySelector(".q_label");
const ansText = document.querySelector(".ans");
const list = document.querySelector(".wordlist");
const nextBtn = document.querySelector(".next_btn");
const submitBtn = document.querySelector(".submit");
const feedback = document.querySelector(".feedback");

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

const cards = data.qs.map((word, i) => ({
  id: i + 1,
  question: word,
  answer: data.ans[i],
  appeared: 0,
  skipped: 0,
  rightAnswers: 0,
  wrongAnswers: 0,
  accuracy: 0,
  wrongTries: 0,
  removed: false,
}));

const qLentgh = cards.length;
let updatedCards;
let chosenCard;
let firstWrong = false;
let currentTries = 0;
// choose a random number between 0 - qLength
// show the quesion text by index qLength -1 becuase indexes start from 0.

function chooseQuestion() {
  let randomIndex;
  // make sure questions cycle without repetition before full cycle
  // check the highest appeared value and only allow questions with lower appered value show
  //if all appered values are equal then choose random from all cards.
  updatedCards = cards.filter((card) => !card.removed);

  if (updatedCards.length > 0) {
    console.log(updatedCards);

    const maxAppeared = updatedCards
      .slice()
      .sort((a, b) => b.appeared - a.appeared)[0].appeared;
    console.log(maxAppeared);

    const sortedQuestions = updatedCards.filter(
      (card) => card.appeared < maxAppeared,
    );
    console.log(sortedQuestions);
    if (sortedQuestions.length > 0) {
      randomIndex = Math.trunc(Math.random() * sortedQuestions.length);
      console.log(randomIndex);
      chosenCard = sortedQuestions[randomIndex];
      qText.textContent = chosenCard.question;
      chosenCard.appeared += 1;
      console.log("sorted", chosenCard);
    } else {
      randomIndex = Math.trunc(Math.random() * updatedCards.length);
      chosenCard = updatedCards[randomIndex];
      qText.textContent = chosenCard.question;
      chosenCard.appeared += 1;
      console.log("not sorted", chosenCard);
    }
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
    const cardsWithoutCorrect = cards.filter((x) => x !== correct);
    const wrongAnsIndexes = [];
    const wrongLength = cardsWithoutCorrect.length;
    while (num > wrongAnsIndexes.length) {
      const randomAnsIndex = Math.trunc(Math.random() * wrongLength);
      if (!wrongAnsIndexes.includes(randomAnsIndex)) {
        wrongAnsIndexes.push(randomAnsIndex);
      }
    }
    console.log(wrongAnsIndexes);
    const AllAns = wrongAnsIndexes.map(
      (index) => cardsWithoutCorrect[index].answer,
    );
    const rightAnsPosition = Math.trunc(Math.random() * num);
    AllAns[rightAnsPosition] = correct.answer;
    return AllAns;
  }
  showAnswers();
}

function updateUI() {
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
      chosenCard.accuracy = chosenCard.rightAnswers / chosenCard.appeared;
    }
    if (
      (chosenCard.accuracy === 1 && chosenCard.appeared >= 1) ||
      (chosenCard.accuracy >= 0.85 && chosenCard.appeared >= 5)
    ) {
      chosenCard.removed = true;
    }

    updateUI();
  } else {
    let triesMsg;
    console.log("wrong answer");
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
  console.log(cards);
});

nextBtn.addEventListener("click", skipQ);

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
