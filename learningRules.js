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
      fastCorrect: 2,
      correct: 1.5,
      slowCorrect: 1.3,
      correctGuess: 1,
      recoveryCorrect: 1,
      lateCorrect: 1.2,
      strongWrong: 0.6,
      wrongGuess: 0.8,
      wrongAnswer: 0.98,
    },
  },

  speedThresholds: {
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

  stageSettings: {
    0: {
      label: "new",
      status: "מילה חדשה",
      streakThreshold: 1,
      maxLengthDiff: 4,
      0: {
        countdown: 10,
        stars: 0,
        flip: false,
        blind: false,
        demoteTo: [1, 0],
      },
    },
    1: {
      label: "unknown",
      status: "מילה לא מוכרת",
      example: true,
      streakThreshold: 1,
      maxLengthDiff: 4,

      0: {
        countdown: 10,
        stars: 0,
        flip: false,
        blind: false,
        demoteTo: [1, 0],
      },
    },
    2: {
      label: "recognized",
      status: "מילה שאתה מזהה",
      example: true,
      streakThreshold: 2,
      maxLengthDiff: 3,
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
      status: "מילה שאתה מכיר",
      example: false,
      streakThreshold: 2,
      maxLengthDiff: 3,
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
      status: "מילה שאתה מכיר היטב",
      example: false,
      streakThreshold: 2,
      maxLengthDiff: 2,
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
      status: "מילה שאתה יודע בבטחון",
      example: false,
      streakThreshold: 2,
      maxLengthDiff: 2,
      blindTime: 5000,
      0: {
        countdown: 5,
        stars: 70,
        flip: true,
        blind: false,
        demoteTo: [4, 1],
      },
      1: {
        countdown: 5,
        stars: 80,
        flip: false,
        blind: true,
        demoteTo: [5, 0],
      },
    },
    6: {
      label: "mastered",
      status: "מילה שאתה שולט בה",
      example: false,
      streakThreshold: 2,
      maxLengthDiff: 2,
      blindTime: 5000,
      0: {
        countdown: 5,
        stars: 90,
        flip: false,
        blind: true,
        demoteTo: [5, 1],
      },
      1: {
        countdown: 5,
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
  FAST_CORRECT: "fastCorrect",
  FIRST_CORRECT: "correct",
  SLOW_CORRECT: "slowCorrect",
  LATE_CORRECT: "lateCorrect",
  RECOVERY_CORRECT: "recoveryCorrect",
  CORRECT_GUESS: "correctGuess",
  WRONG: {
    WRONG_GUESS: "wrongGuess",
    WRONG_ANSWER: "wrongAnswer",
    STRONG_WRONG: "strongWrong",
  },
};

export const CORRECT_CATEGORIES = new Set([
  ANSWERS_CATEGORIES.FAST_CORRECT,
  ANSWERS_CATEGORIES.FIRST_CORRECT,
  ANSWERS_CATEGORIES.SLOW_CORRECT,
  ANSWERS_CATEGORIES.CORRECT_GUESS,
]);
