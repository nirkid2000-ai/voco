export const LEARNING_RULES = {
  minWordGap: 5,

  inputTimeOffsets: {
    touch: 0,
    pointer: 600,
  },

  cooldown: {
    DEFAULT: 30 * 1000,
    MIN: 1 * 1000,
    MAX: 60 * 1000 * 20,

    SPEED_MULTIPLIERS: {
      under2s: 1.6,
      under4s: 1.5,
      normal: 1,
    },

    CORRECT_MULTIPLIERS: {
      know: 1.5,
      guess: 1,
    },

    WRONG_MULTIPLIERS: {
      know: 0.6,
      guess: 0.8,
      multFails: 0.9,
    },
  },

  speedThresholds: {
    fastMs: 2000,
    mediumMs: 4000,
    recoBoost: 2000,
  },

  promotion: {
    requiredLevelStreak: 2,
  },

  stageCountdowns: {
    new0: 30,
    unknown0: 16,
    unknown1: 14,
    recognized0: 12,
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
