"use strict";

import { ANSWERS_CATEGORIES } from "/learningRules.js";
import { getTriesMessage } from "/quizHelpers.js";

export const Messages = {
  [ANSWERS_CATEGORIES.FAST_CORRECT]: "וואו! זה היה מהיר!",
  [ANSWERS_CATEGORIES.LATE_CORRECT]: "תשובה נכונה אבל מאוחר מדי",
  [ANSWERS_CATEGORIES.SLOW_CORRECT]: "תשובה נכונה אבל טיפה לאט ",
  [ANSWERS_CATEGORIES.FIRST_CORRECT]: "כל הכבוד! תשובה נכונה",
  [ANSWERS_CATEGORIES.CORRECT_GUESS]: "יפה. ניחוש מוצלח",
  [ANSWERS_CATEGORIES.RECOVERY_CORRECT]: "הפעם הצלחת",
  [ANSWERS_CATEGORIES.WRONG.STRONG_WRONG]: (currentTries) =>
    `${getTriesMessage(currentTries)} נסה שוב`,
  [ANSWERS_CATEGORIES.WRONG.WRONG_ANSWER]: (currentTries) =>
    `${getTriesMessage(currentTries)} נסה שוב`,
  [ANSWERS_CATEGORIES.WRONG.WRONG_GUESS]: "ניחוש לא מוצלח. נסו שוב...",
};
