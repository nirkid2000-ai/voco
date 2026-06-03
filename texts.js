"use strict";

export const uiTexts = {
  appName: "VOCRO",
  tagLine: {
    he: "לשפר אוצר מילים במהירות ",
    en: "The fastest way to improve vocabulary",
  },
  courseButtons: {
    english: { he: "אנגלית", en: "English" },
    hebrew: { he: "עברית", en: "Hebrew" },
    spanish: { he: "ספרדית", en: "Spanish" },
    latvian: { he: "לטבית", en: "Latvian" },
  },
  wordStatus: {
    0: { he: "מילה חדשה", en: "New Word" },
    1: { he: "מילה לא מוכרת", en: "Unknown Word" },
    2: { he: "מילה שאתה מזהה", en: "Word You Recognize" },
    3: { he: "מילה שאתה מכיר", en: "Word You Know" },
    4: { he: "מילה שאתה מכיר היטב", en: "Word You Know Well" },
    5: { he: "מילה שאתה יודע בבטחון", en: "Word You Know Very Good" },
    6: { he: "מילה שאתה שולט בה", en: "Word You Master" },
  },
  difficulty: { he: "רמת קושי", en: "Difficulty Level" },
  masteryLevel: { he: "רמת שליטה", en: "Mastery Level" },
  timer: { he: "זמן תרגול: ", en: "Session Duration: " },
  summaryHeader: { he: "סיכום התרגול", en: "Session Summary" },
  summaryLabels: {
    sessionDuration: { he: "משך התרגול: ", en: "Session Duration" },
    totalQuestions: {
      he: "סה״כ שאלות שהופיעו: ",
      en: "Total Questions Answered",
    },
    totalPassed: { he: "סה״כ שאלות שעברת: ", en: "Total Questions Passed" },
    totalKnown: {
      he: "סה״כ שאלות שידעת בזמן: ",
      en: "Total Questions You Knew On Time",
    },
    correctGuesses: {
      he: "סה״כ שאלות שניחשת נכון: ",
      en: "Total Questions You Guessed Correctly",
    },
    totalFailed: {
      he: "סה״כ שאלות שלא ידעת בזמן: ",
      en: "Total Questions You Didn't Know On Time",
    },
    avgRecallTime: {
      he: "זמן מענה ממוצע לשאלה: ",
      en: "Average Answer Time",
    },
    longestStreak: {
      he: "רצף התשובות הנכונות הארוך ביותר: ",
      en: "Longest Correct Streak",
    },
    uniqueWords: {
      he: "מספר המילים השונות שהופיעו: ",
      en: "Unique Words Practiced:",
    },
    improved: { he: "מספר המילים ששיפרת: ", en: "Words Improved:" },
    newWords: {
      he: "מספר המילים החדשות שהתווספו: ",
      en: "New Words Appeared:",
    },
    newLearned: {
      he: "מספר המילים החדשות שלמדת: ",
      en: "New Words Learned:",
    },
    strongest: {
      he: "המילה החזקה ביותר שלך בתרגול: ",
      en: "Your Strongest Word This Session:",
    },
    weakest: {
      he: "המילה החלשה ביותר שלך בתרגול: ",
      en: "Your Weakest Word This Session:",
    },
  },
  removeWord: {
    question: {
      he: "האם אתה בטוח שברצונך להסיר את המילה מהמאגר?",
      en: "Are you sure you want to remove the word from the data?",
    },
    text: {
      he: "המילה הוסרה מהמאגר.",
      en: "The word has been removed from the data.",
    },
  },
  resetProgress: {
    question: {
      he: "האם אתה בטוח שברצונך לאפס את כל נתוני המערכת?",
      en: "Are you sure you want to reset the learning progress?",
    },
    text: {
      he: "תהליך הלמידה התאפס בהצלחה.",
      en: "Learning progress reset successfuly.",
    },
  },
  buttons: {
    home: {
      start: { he: "התחילו ללמוד ", en: "Start Learning" },
    },
    mainApp: {
      submit: {
        know: { he: "אני יודע", en: "I Know" },
        guess: { he: "אני מנחש", en: "I Guess" },
        main: { he: "בחר תשובה", en: "Select Answer" },
      },
      nav: {
        home: { he: "ראשי", en: "Home" },
        end: { he: "סיים תרגול", en: "End Session" },
        reset: { he: "אתחל מערכת", en: "Reset Progress" },
      },
    },
    removeWord: {
      he: "x הסר",
      en: "Remove",
    },
    summary: {
      learnMore: { he: "יאללה עוד נגלה", en: "One More Session" },
    },
    note: {
      saveNote: { he: "שמור", en: "Save" },
      addNote: { he: "הוסף טיפ", en: "Add Tip" },
      openNote: { he: "פתח טיפ", en: "Open Tip" },
      closeNote: { he: "סגור", en: "Close" },
      giveSentence: { he: "תן לי משפט", en: "Give Sentence" },
      showSentence: { he: "פתח משפט", en: "Show Sentence" },
      giveTip: { he: "תן לי טיפ", en: "Give Tip" },
    },
    backToSession: { he: "חזרה לתרגול", en: "Back To Session" },
    yesOrNo: { yes: { he: "כן", en: "Yes" }, no: { he: "לא", en: "No" } },
  },
  expandNote: { he: "לחץ כדי להרחיב את המילה", en: "Click to expand word" },
  tipHolder: {
    he: "שמור כאן את הטיפ שלך לזכירת המילה.",
    en: "Write your tip here to remember the word.",
  },
};

export function setUiText(lang, els) {
  const {
    countdown,
    bubble,
    courseSelection,
    knowOrGuess,
    menuBtns,
    wordTop,
    tagline,
    hebrewUiLangBtn,
    englishUiLangBtn,
    englishCourseBtn,
    hebrewCourseBtn,
    spanishCourseBtn,
    latvianCourseBtn,
    homeStartBtn,
    diffLabel,
    masteryLabel,
    submitMainBtn,
    submitKnowBtn,
    submitGuessBtn,
    backHomeBtn,
    endSessionBtn,
    resetbtn,
    timerLabel,
    studyMoreBtn,
    expandedWord,
    removeWordBtn,
    closeWordBtn,
    saveNoteBtn,
    closeNoteBtn,
    showSentenceBtn,
    giveSentenceBtn,
    saveSentenceBtn,
    closeSentenceBtn,
    giveTipBtn,
    pressInfo,
    sentenceText,
    translationText,
    removeScreen,
    removeQuestionText,
    removeConfrimBtn,
    removeCancelBtn,
    wordRemovedText,
    resetQuestionText,
    resetConfrimBtn,
    resetCancelBtn,
  } = els;

  countdown.classList.remove("countdown_flip");
  if (lang === "en") countdown.classList.add("countdown_flip");

  if (lang === "en") englishUiLangBtn.checked = true;
  if (lang === "he") hebrewUiLangBtn.checked = true;

  englishCourseBtn.closest("li").style.display = "none";
  hebrewCourseBtn.closest("li").style.display = "none";
  if (lang === "en") hebrewCourseBtn.closest("li").style.display = "block";
  if (lang === "he") englishCourseBtn.closest("li").style.display = "block";

  if (lang === "en") countdown.classList.add("countdown_flip");

  sentenceText.classList.remove("rtl", "ltr");
  sentenceText.classList.add(lang === "he" ? "ltr" : "ltr_only");

  removeScreen.classList.remove("rtl_only", "ltr_only");
  removeScreen.classList.add(lang === "he" ? "rtl_only" : "ltr_only");

  bubble.classList.remove("rtl", "ltr");
  bubble.classList.add(lang === "he" ? "rtl" : "ltr");

  expandedWord.classList.remove("rtl_only", "ltr_only");
  expandedWord.classList.add(lang === "he" ? "rtl_only" : "ltr_only");

  courseSelection.classList.remove("rtl", "ltr");
  courseSelection.classList.add(lang === "he" ? "rtl" : "ltr");

  knowOrGuess.classList.remove("rtl", "ltr");
  knowOrGuess.classList.add(lang === "he" ? "rtl" : "ltr");

  menuBtns.classList.remove("reverse_flex", "rtl");
  menuBtns.classList.add(lang === "he" ? "reverse_flex" : "rtl");

  wordTop.classList.remove("reverse_flex", "rtl");
  wordTop.classList.add(lang === "he" ? "rtl" : "reverse_flex");

  tagline.textContent = uiTexts.tagLine[lang];
  englishCourseBtn.textContent = uiTexts.courseButtons.english[lang];
  hebrewCourseBtn.textContent = uiTexts.courseButtons.hebrew[lang];
  spanishCourseBtn.textContent = uiTexts.courseButtons.spanish[lang];
  latvianCourseBtn.textContent = uiTexts.courseButtons.latvian[lang];

  homeStartBtn.textContent = uiTexts.buttons.home.start[lang];
  diffLabel.textContent = uiTexts.difficulty[lang];
  masteryLabel.textContent = uiTexts.masteryLevel[lang];
  submitMainBtn.textContent = uiTexts.buttons.mainApp.submit.main[lang];
  submitKnowBtn.textContent = uiTexts.buttons.mainApp.submit.know[lang];
  submitGuessBtn.textContent = uiTexts.buttons.mainApp.submit.guess[lang];
  backHomeBtn.textContent = uiTexts.buttons.mainApp.nav.home[lang];
  endSessionBtn.textContent = uiTexts.buttons.mainApp.nav.end[lang];
  resetbtn.textContent = uiTexts.buttons.mainApp.nav.reset[lang];
  timerLabel.textContent = uiTexts.timer[lang];
  studyMoreBtn.textContent = uiTexts.buttons.summary.learnMore[lang];

  removeWordBtn.textContent = uiTexts.buttons.removeWord[lang];

  saveNoteBtn.textContent = uiTexts.buttons.note.saveNote[lang];
  closeNoteBtn.textContent = uiTexts.buttons.note.closeNote[lang];
  showSentenceBtn.textContent = uiTexts.buttons.note.showSentence[lang];
  giveTipBtn.textContent = uiTexts.buttons.note.giveTip[lang];

  giveSentenceBtn.textContent = uiTexts.buttons.note.giveSentence[lang];
  saveSentenceBtn.textContent = uiTexts.buttons.note.saveNote[lang];
  closeSentenceBtn.textContent = uiTexts.buttons.note.closeNote[lang];

  pressInfo.textContent = uiTexts.expandNote[lang];

  closeWordBtn.textContent = uiTexts.buttons.backToSession[lang];

  removeQuestionText.textContent = uiTexts.removeWord.question[lang];
  wordRemovedText.textContent = uiTexts.removeWord.text[lang];
  removeConfrimBtn.textContent = uiTexts.buttons.yesOrNo.yes[lang];
  removeCancelBtn.textContent = uiTexts.buttons.yesOrNo.no[lang];

  resetQuestionText.textContent = uiTexts.resetProgress.question[lang];
  //   resetProgressText.textContent = uiTexts.removeWord.text[lang];
  resetConfrimBtn.textContent = uiTexts.buttons.yesOrNo.yes[lang];
  resetCancelBtn.textContent = uiTexts.buttons.yesOrNo.no[lang];

  console.log("uiLang set", lang);
}
