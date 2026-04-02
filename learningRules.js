export const LEARNING_RULES = {
  minWordGap: 5,

  inputTimeOffsets: {
    touch: 0,
    pointer: 500,
  },

  // cooldown: {
  //   DEFAULT: 30 * 1000,
  //   MIN: 1 * 1000,
  //   MAX: 60 * 1000 * 20,

  //   SPEED_MULTIPLIERS: {
  //     under2s: 1.6,
  //     under4s: 1.5,
  //     normal: 1,
  //   },

  //   CORRECT_MULTIPLIERS: {
  //     know: 1.5,
  //     guess: 1,
  //   },

  //   WRONG_MULTIPLIERS: {
  //     know: 0.6,
  //     guess: 0.8,
  //     multFails: 0.9,
  //   },
  // },

  COOLDOWNS: {
    DEFAULT: 30 * 1000,
    MIN: 1 * 1000,
    MAX: 60 * 1000 * 20,

    MULTIPLIERS: {
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
    QUICK_ANSWER: 2500,
    SLOW_ANSWER: 5000,
    fastMs: 2000,
    mediumMs: 4000,
    recoBoost: 2000,
  },

  promotion: {
    requiredLevelStreak: 2,
  },

  stageCountdowns: {
    new0: 15,
    unknown0: 12,
    unknown1: 10,
    recognized0: 10,
    recognized1: 10,
    known0: 8,
    known1: 6,
    knownWell0: 5,
    knownWell1: 4,
    strong0: 5,
    strong1: 5,
    mastered0: 4,
    mastered1: 4,
  },

  stars: {
    new0: 0,
    unknown0: 0,
    recognized0: 9.5,
    recognized1: 20,
    known0: 30,
    known1: 40,
    knownWell0: 50,
    knownWell1: 60,
    strong0: 70,
    strong1: 80,
    mastered0: 90,
    mastered1: 100,
  },

  diffLevels: {
    A1: "0%",
    A2: "20%",
    B1: "30%",
    B2: "50%",
    C1: "70%",
    C2: "85%",
  },
};
