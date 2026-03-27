import { action } from "@reatom/core";
import { currentIndexAtom } from "./question-state";
import { questionsAtom } from "./questions";
import { stopTimer } from "./timer";

export const prevQuestion = action(() => {
  currentIndexAtom.set((i) => Math.max(i - 1, 0));
});

export const nextQuestion = action(() => {
  const max = questionsAtom().length - 1;
  currentIndexAtom.set((i) => Math.min(i + 1, max));
  stopTimer();
});
