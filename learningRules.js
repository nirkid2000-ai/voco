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

  promotion: {
    requiredLevelStreak: 2,
  },

  stageCountdowns: {
    new0: 20,
    unknown0: 15,
    // unknown1: 10,
    recognized0: 12,
    recognized1: 10,
    known0: 8,
    known1: 7,
    knownWell0: 6,
    knownWell1: 6,
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
