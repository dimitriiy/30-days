import { atom, computed } from "@reatom/core";
import { questionsAtom } from "./questions";

export const currentIndexAtom = atom(0, "currentIndex");

export const currentQuestionAtom = computed(
  () => questionsAtom()[currentIndexAtom()] ?? null,
  "currentQuestion",
);
export const showCorrectAnswerAtom = atom(false, "showCorrectAnswer");
