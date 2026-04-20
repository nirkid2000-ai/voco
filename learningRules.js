import { ANSWER_KEYS } from "./quizHelpers.js";

export const LEARNING_RULES = {
  minWordGap: 5,

  inputOffsets: {
    touch: 0,
    pointer: 500,
  },

  cooldowns: {
    defaultMs: 30000,
    minMs: 1000,
    maxMs: 1200000,
    multipliers: {
      [ANSWER_KEYS.VERY_FAST_CORRECT]: 2.25,
      [ANSWER_KEYS.FAST_CORRECT]: 2,
      [ANSWER_KEYS.FIRST_CORRECT]: 1.5,
      [ANSWER_KEYS.SLOW_CORRECT]: 1.3,
      [ANSWER_KEYS.CORRECT_GUESS]: 1,
      [ANSWER_KEYS.RECOVERY_CORRECT]: 1,
      [ANSWER_KEYS.LATE_CORRECT]: 1.2,
      [ANSWER_KEYS.STRONG_WRONG]: 0.6,
      [ANSWER_KEYS.WRONG_GUESS]: 0.8,
      [ANSWER_KEYS.WRONG_ANSWER]: 0.98,
    },
  },

  speedThresholds: {
    veryQuickMs: 1500,
    quickMs: 2500,
    slowMs: 6000,
  },

  // promotion: {
  //   requiredLevelStreak: 2,
  // },

  // stageCountdowns: {
  //   new0: 20,
  //   unknown0: 15,
  //   // unknown1: 10,
  //   recognized0: 12,
  //   recognized1: 10,
  //   known0: 8,
  //   known1: 7,
  //   knownWell0: 6,
  //   knownWell1: 6,
  //   strong0: 5,
  //   strong1: 5,
  //   mastered0: 4,
  //   mastered1: 4,
  // },

  // stars: {
  //   new0: 0,
  //   unknown0: 0,
  //   recognized0: 9.5,
  //   recognized1: 20,
  //   known0: 30,
  //   known1: 40,
  //   knownWell0: 50,
  //   knownWell1: 60,
  //   strong0: 70,
  //   strong1: 80,
  //   mastered0: 90,
  //   mastered1: 100,
  // },

  uiTexts: {
    appName: "VOCRO",
    tagLine: {
      he: "ללמוד אוצר מילים במהירות ",
      en: " The fastest way to learn vocabulary",
    },
    wordStatus: {
      0: { he: "מילה חדשה", en: "New Word" },
      1: { he: "מילה לא מוכרת", en: "Unknown Word" },
      2: { he: "מילה שאתה מזהה", en: "Word You Recognize" },
      3: { he: "מילה שאתה מכיר", en: "Word You Know" },
      4: { he: "מילה שאתה מכיר היטב", en: "Word You Know Well" },
      5: { he: "מילה שאתה יודע בבטחון", en: "Word You Know Very good" },
      6: { he: "מילה שאתה שולט בה", en: "Word You Master" },
    },
    difficulty: { he: "רמת קושי", en: " Difficulty Level" },
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
        en: "Total Questions You Guessed correctly",
      },
      totalFailed: {
        he: "סה״כ שאלות שלא ידעת בזמן: ",
        en: "Total Questions You Didn't Knew On Time",
      },
      avgRecallTime: { he: "זמן מענה ממוצע לשאלה: ", en: "Averge Answer Time" },
      longestStrike: {
        he: "רצף התשובות הנכונות הארוך ביותר: ",
        en: "Longest Correct Streak",
      },
      uniqueWords: {
        he: "מספר המילים השונות שהופיעו: ",
        en: "Unique Words Practiced:",
      },
      improved: { he: "מספר המילים ששיפרת: ", en: "Words improved:" },
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
        en: "Your Strongest Word This Session: ",
      },
      weakest: {
        he: " המילה החלשה ביותר שלך בתרגול: ",
        en: "Your Weakest Word This Session: ",
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
      summary: { learnMore: { he: "יאללה עוד נגלה", en: "One More Session" } },
    },
  },

  stageSettings: {
    0: {
      label: "new",
      // status: "מילה חדשה",
      streakThreshold: 1,
      maxLengthDiff: 4,
      score: 2,
      0: {
        countdown: 30,
        stars: 0,
        flip: false,
        blind: false,
        demoteTo: [1, 0],
      },
    },
    1: {
      label: "unknown",
      // status: "מילה לא מוכרת",
      example: true,
      streakThreshold: 1,
      maxLengthDiff: 4,
      score: 2,

      0: {
        countdown: 20,
        stars: 0,
        flip: false,
        blind: false,
        demoteTo: [1, 0],
      },
    },
    2: {
      label: "recognized",
      // status: "מילה שאתה מזהה",
      example: true,
      streakThreshold: 2,
      maxLengthDiff: 3,
      score: 3,

      0: {
        countdown: 7,
        stars: 9.5,
        flip: false,
        blind: false,
        demoteTo: [1, 0],
      },
      1: {
        countdown: 7,
        stars: 20,
        flip: false,
        blind: false,
        demoteTo: [1, 0],
      },
    },
    3: {
      label: "known",
      // status: "מילה שאתה מכיר",
      example: false,
      streakThreshold: 2,
      maxLengthDiff: 3,
      score: 4,

      0: {
        countdown: 6,
        stars: 30,
        flip: false,
        blind: false,
        demoteTo: [2, 1],
      },
      1: {
        countdown: 6,
        stars: 40,
        flip: false,
        blind: false,
        demoteTo: [2, 1],
      },
    },
    4: {
      label: "knownWell",
      // status: "מילה שאתה מכיר היטב",
      example: false,
      streakThreshold: 2,
      maxLengthDiff: 2,
      score: 5,

      0: {
        countdown: 5,
        stars: 50,
        flip: true,
        blind: false,
        demoteTo: [3, 1],
      },
      1: {
        countdown: 5,
        stars: 60,
        flip: false,
        blind: false,
        demoteTo: [4, 0],
      },
    },
    5: {
      label: "strong",
      // status: "מילה שאתה יודע בבטחון",
      example: false,
      streakThreshold: 2,
      maxLengthDiff: 2,
      blindTime: 3500,
      score: 6,

      0: {
        countdown: 3,
        stars: 70,
        flip: true,
        blind: false,
        demoteTo: [4, 1],
      },
      1: {
        countdown: 3,
        stars: 80,
        flip: false,
        blind: true,
        demoteTo: [5, 0],
      },
    },
    6: {
      label: "mastered",
      // status: "מילה שאתה שולט בה",
      example: false,
      streakThreshold: 2,
      maxLengthDiff: 2,
      blindTime: 2500,
      score: 8,

      0: {
        countdown: 3,
        stars: 90,
        flip: false,
        blind: true,
        demoteTo: [5, 1],
      },
      1: {
        countdown: 3,
        stars: 100,
        flip: true,
        blind: true,
        demoteTo: [6, 0],
      },
    },
  },

  scoring: {
    streakBonuses: [
      { streak: 5, type: "add", value: 200 },
      { streak: 10, type: "add", value: 400 },
      { streak: 25, type: "add", value: 600 },
      { streak: 50, type: "mult", value: 2 },
      { streak: 100, type: "mult", value: 3 },
    ],
  },

  boost: {
    earlyLevelBoost: {
      requiredEngaged: 4,
      requiredCorrect: 4,
      requiredFast: 2,
    },
  },

  diffLevels: {
    A1: 0,
    A2: 20,
    B1: 30,
    B2: 50,
    C1: 70,
    C2: 85,
  },
};

export const ANSWERS_CATEGORIES = {
  VERY_FAST_CORRECT: {
    passed: true,
    label: "veryFastCorrect",
    score: 12,
    overlayDuration: 1500,
  },
  FAST_CORRECT: {
    passed: true,
    label: "fastCorrect",
    score: 10,
    overlayDuration: 1500,
  },
  FIRST_CORRECT: {
    passed: true,
    label: "correct",
    score: 7,
    overlayDuration: 2000,
  },
  SLOW_CORRECT: {
    passed: true,
    label: "slowCorrect",
    score: 4,
    overlayDuration: 2000,
  },
  LATE_CORRECT: {
    passed: false,
    label: "lateCorrect",
    score: 2,
    overlayDuration: 2500,
  },
  RECOVERY_CORRECT: {
    passed: false,
    label: "recoveryCorrect",
    score: 0,
    overlayDuration: 3500,
  },
  CORRECT_GUESS: {
    passed: true,
    label: "correctGuess",
    score: 4,
    overlayDuration: 2500,
  },
  WRONG_GUESS: {
    passed: false,
    label: "wrongGuess",
    score: 0,
    overlayDuration: 5000,
  },
  WRONG_ANSWER: {
    passed: false,
    label: "wrongAnswer",
    score: 0,
    overlayDuration: 5000,
  },
  STRONG_WRONG: {
    passed: false,
    label: "strongWrong",
    score: 0,
    overlayDuration: 5000,
  },
};

export const FEEDBACK_MEESAGES = {
  answers: {
    [ANSWER_KEYS.VERY_FAST_CORRECT]: {
      he: "וואו! נכון במהירות האור",
      en: "Right at the speed of light",
    },
    [ANSWER_KEYS.FAST_CORRECT]: {
      he: "נכון ומהר. כל הכבוד!",
      en: "Nice! Correct and quick.",
    },
    [ANSWER_KEYS.FIRST_CORRECT]: {
      he: "נכון מאוד!",
      en: "Well done. That's correct.",
    },
    [ANSWER_KEYS.CORRECT_GUESS]: {
      he: "ניחוש מוצלח",
      en: "Good Guess",
    },
    [ANSWER_KEYS.SLOW_CORRECT]: {
      he: "קצת לאט אבל צדקת",
      en: " A bit slow but correct",
    },
    [ANSWER_KEYS.LATE_CORRECT]: {
      he: "נכון אבל מאוחר מדי...",
      en: "Correct, but too late...",
    },
    [ANSWER_KEYS.RECOVERY_CORRECT]: {
      he: "הפעם צדקת",
      en: "Now you're right",
    },
    [ANSWER_KEYS.STRONG_WRONG]: {
      he: "דווקא לא... נסה שוב",
      en: "Nope. Try again...",
    },
    [ANSWER_KEYS.WRONG_ANSWER]: {
      he: (currentTries) => `${getTriesMessage(currentTries)} נסה שוב`,
      en: "Wrong again... one more time",
    },
    [ANSWER_KEYS.WRONG_GUESS]: {
      he: "ניחוש לא מוצלח... נסה שוב",
      en: "Wrong guess, try again.",
    },
  },
  noAnswer: { he: "לא נבחרה תשובה.", en: "No answer selected." },
  sessionError: {
    noData: { he: "אין לי נתונים להציג.", en: "I have no data to show." },
    notResolved: {
      he: "ענה על השאלה בכדי לסיים את הסשן",
      en: "Answer the question before ending the session.",
    },
  },
  overlay: {
    time: { he: "זמן מענה: ", en: "Answer Time: " },
    avgTime: { he: "זמן מענה ממוצע: ", en: "Avergae answer time: " },
    units: { he: "שניות", en: " Seconds" },
    cooldownTime: { he: "זמן השהייה: ", en: "Cooldown Time:" },
  },
};

export const CORRECT_CATEGORIES = new Set([
  ANSWERS_CATEGORIES.VERY_FAST_CORRECT.label,
  ANSWERS_CATEGORIES.FAST_CORRECT.label,
  ANSWERS_CATEGORIES.FIRST_CORRECT.label,
  ANSWERS_CATEGORIES.SLOW_CORRECT.label,
  ANSWERS_CATEGORIES.CORRECT_GUESS.label,
]);

export const KNOW_CATEGORIES = new Set([
  ANSWERS_CATEGORIES.VERY_FAST_CORRECT.label,
  ANSWERS_CATEGORIES.FAST_CORRECT.label,
  ANSWERS_CATEGORIES.FIRST_CORRECT.label,
  ANSWERS_CATEGORIES.SLOW_CORRECT.label,
]);

function getTriesMessage(tries) {
  if (tries === 1) return "טעות ראשונה";
  if (tries === 2) return "טעות שנייה";
  if (tries === 3) return "טעות שלישית";
  // if (tries === 4) return "טעות רביעית";
  return `טעות מספר ${tries}`;
}
