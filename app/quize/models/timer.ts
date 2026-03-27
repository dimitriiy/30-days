import { action, atom, effect } from "@reatom/core";
import { audioApi } from "./audio";
import { TIMER_DURATION } from "./constants";
import { currentQuestionAtom, showCorrectAnswerAtom } from "./question-state";

export const showTimeIsUpScreenAtom = atom(false, "showTimeIsUpScreen");

export const timerAtom = atom(
  currentQuestionAtom()?.timerDuration ?? TIMER_DURATION,
  "timer",
);

effect(() => {
  timerAtom.set(currentQuestionAtom()?.timerDuration ?? TIMER_DURATION);

  if (currentQuestionAtom()) {
    showCorrectAnswerAtom.set(false);
  }
});

export const timerInProgressAtom = atom(false, "timerInProgress");

let timerIntervalId: ReturnType<typeof setInterval> | null = null;

const clearTimerInterval = () => {
  if (timerIntervalId !== null) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
};

export const startTimer = action(() => {
  if (timerInProgressAtom() || timerAtom() <= 0) {
    return;
  }

  timerAtom.set(currentQuestionAtom()?.timerDuration ?? TIMER_DURATION);

  timerInProgressAtom.set(true);

  clearTimerInterval();
  timerIntervalId = setInterval(() => {
    const nextValue = Math.max(timerAtom() - 1, 0);
    timerAtom.set(nextValue);
    if (nextValue === 0) {
      stopTimer();
      showTimeIsUpScreenAtom.set(true);
    }
  }, 1000);

  audioApi.playTick();
});

export const stopTimer = action(() => {
  timerInProgressAtom.set(false);

  clearTimerInterval();
  audioApi.stopTick();
});

export const pauseTimer = action(() => {
  timerInProgressAtom.set(false);
  clearTimerInterval();
  audioApi.stopTick();
});
