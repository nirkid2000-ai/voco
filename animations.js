"use strict";

let lookDir = 1;

export function startAnimations() {
  startBlinking();
  startEyeMovement();
}

function startBlinking() {
  setTimeout(blink, 1500);
}

function blink() {
  const openEyes = [
    document.getElementById("eyeL"),
    document.getElementById("eyeR"),
    document.getElementById("pupilL"),
    document.getElementById("pupilR"),
  ];

  const closedEyes = [
    document.getElementById("eyeClosedL"),
    document.getElementById("eyeClosedR"),
  ];

  hide(openEyes);
  show(closedEyes);

  setTimeout(() => {
    hide(closedEyes);
    show(openEyes);

    const next = 2000 + Math.random() * 3000;
    setTimeout(blink, next);
  }, 120);
}

function startEyeMovement() {
  const pupilL = document.getElementById("pupilL");
  const pupilR = document.getElementById("pupilR");

  if (!pupilL || !pupilR) return;

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
