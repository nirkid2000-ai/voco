"use strict";
export function startAnimations() {
  const crows = document.querySelectorAll(".crow");
  crows.forEach((crow, index) => {
    startBlinking(crow, index);
    startEyeMovement(crow, index);
  });
}
function startBlinking(crow, index) {
  const initialDelay = 1500 + index * 250;
  setTimeout(() => blink(crow), initialDelay);
}
function blink(crow) {
  const openEyes = [
    crow.querySelector(".eyeL"),
    crow.querySelector(".eyeR"),
    crow.querySelector(".pupilL"),
    crow.querySelector(".pupilR"),
  ];
  const closedEyes = [
    crow.querySelector(".eyeClosedL"),
    crow.querySelector(".eyeClosedR"),
  ];
  hide(openEyes);
  show(closedEyes);
  setTimeout(() => {
    hide(closedEyes);
    show(openEyes);
    const next = 2000 + Math.random() * 3000;
    setTimeout(() => blink(crow), next);
  }, 120);
}
function startEyeMovement(crow, index) {
  const pupilL = crow.querySelector(".pupilL");
  const pupilR = crow.querySelector(".pupilR");
  if (!pupilL || !pupilR) return;
  let lookDir = index % 2 === 0 ? 1 : -1;
  setInterval(() => {
    lookDir *= -1;
    const x = lookDir * 4;
    pupilL.style.transform = `translateX(${x}px)`;
    pupilR.style.transform = `translateX(${x}px)`;
  }, 1800);
}
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
