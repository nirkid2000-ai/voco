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
    "אדום",
    "בשר",
    "לחם",
    "חלב",
    "בית",
    "דלת",
    "כיסא",
    "ספר",
    "עט",
    "מחברת",
    "עיר",
    "רחוב",
    "עץ",
    "פרח",
    "שמש",
    "ירח",
    "כוכב",
    "הר",
    "נהר",
    "ים",
    "חול",
    "רוח",
    "אש",
    "אדמה",
    "זהב",
    "כסף",
    "זמן",
    "יום",
    "לילה",
    "שנה",
    "חבר",
    "משפחה",
    "ילד",
    "ילדה",
    "אוכל",
    "שתייה",
    "שוק",
    "חנות",
    "מפתח",
    "טלפון",
    "מחשב",
    "עבודה",
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
    "Red",
    "Meat",
    "Bread",
    "Milk",
    "House",
    "Door",
    "Chair",
    "Book",
    "Pen",
    "Notebook",
    "City",
    "Street",
    "Tree",
    "Flower",
    "Sun",
    "Moon",
    "Star",
    "Mountain",
    "River",
    "Sea",
    "Sand",
    "Wind",
    "Fire",
    "Earth",
    "Gold",
    "Silver",
    "Time",
    "Day",
    "Night",
    "Year",
    "Friend",
    "Family",
    "Boy",
    "Girl",
    "Food",
    "Drink",
    "Market",
    "Shop",
    "Key",
    "Phone",
    "Computer",
    "Work",
  ],
};

const qText = document.querySelector(".q");
const ansText = document.querySelector(".ans");
const list = document.querySelector(".wordlist");
const nextBtn = document.querySelector(".next_btn");
const submitBtn = document.querySelector(".submit");

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
  rightAnswers: 0,
  wrongAnswers: 0,
}));

console.log(cards);

const qLentgh = cards.length;
let randomQ;

// choose a random number between 1 - qLength
randomQ = Math.trunc(Math.random() * qLentgh) + 1;
// show the quesion text by index qLength -1 becuase indexes start from 0.
qText.textContent = cards[randomQ - 1].question;

function pickQuestionAndAnswers() {
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

  const answers = chooseAnswers(4, randomQ);
  function chooseAnswers(num, correct) {
    const arr = [];
    while (arr.length < num) {
      const randomaAns = Math.trunc(Math.random() * qLentgh);
      if (randomaAns !== correct - 1 && !arr.includes(randomaAns))
        arr.push(randomaAns);
    }
    const randomPlace = Math.trunc(Math.random() * num);
    arr[randomPlace] = correct - 1;
    const allAnswers = arr.map((num) => cards[num].answer);
    return allAnswers;
  }
  showAnswers();
}

submitBtn.addEventListener("click", () => {
  const selected = document.querySelector('input[name="answer"]:checked');

  if (!selected) {
    alert("Please choose an option");
    return;
  }

  console.log("User chose:", selected.value);
  console.log(cards[randomQ - 1].answer);
  if (selected.value === cards[randomQ - 1].answer) {
    console.log("correct answer");
  } else {
    console.log("wrong answer");
  }
});

function updateUI() {
  pickQuestionAndAnswers();
}

// console.log(pairs(data.words, data.definitions));

nextBtn.addEventListener("click", updateUI);

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
