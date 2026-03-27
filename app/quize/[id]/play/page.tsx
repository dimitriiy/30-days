"use client";

import { reatomComponent } from "@reatom/react";
import {
  ProBadge,
  QuizHeader,
  QuizProgress,
  QuizScreen,
  QuestionItem,
  QuizArrow,
  TimeIsUpScreen,
} from "../../components";
import {
  questionsAtom,
  currentQuestionAtom,
  currentIndexAtom,
  nextQuestion,
  prevQuestion,
  timerInProgressAtom,
  timerAtom,
  startTimer,
  pauseTimer,
  showTimeIsUpScreenAtom,
  showCorrectAnswerAtom,
} from "../../models";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useSyncQuestionIndex } from "../../use-sync-question-index";
import { Hourglass, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const formatTimer = (seconds: number) => {
  const safeValue = Math.max(seconds, 0);
  const mins = Math.floor(safeValue / 60);
  const secs = safeValue % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const QuizPlay = reatomComponent(() => {
  useEffect(() => {
    questionsAtom.load();
  }, []);

  const questions = questionsAtom();
  const currentQuestion = currentQuestionAtom();
  const currentIndex = currentIndexAtom();

  useSyncQuestionIndex(currentIndex);

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90">
        <Spinner className="size-10" />
      </div>
    );
  }
  return (
    <QuizScreen variant="dark">
      <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 pb-4">
        {questions.length === 0 && questionsAtom.isLoading() && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90">
            <Spinner className="size-10" />
          </div>
        )}
        <QuizHeader
          showBack
          trailing={
            <ProBadge onClick={() => showCorrectAnswerAtom.set(true)} />
          }
        />
        <QuizProgress current={currentIndex + 1} total={questions.length} />

        {currentQuestion && (
          <QuestionItem key={currentQuestion.id} question={currentQuestion} />
        )}

        <div className="flex shrink-0 items-center justify-center gap-4">
          <QuizArrow
            direction="left"
            onClick={() => prevQuestion()}
            disabled={currentIndex === 0}
            className="fixed left-5 top-1/2 -translate-y-1/2"
          />
          <button
            className={cn(
              "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--quiz-text-primary)] transition-colors bg-[var(--quiz-surface)] disabled:cursor-default disabled:opacity-30",
            )}
            onClick={timerInProgressAtom() ? pauseTimer : startTimer}
            aria-label={
              timerInProgressAtom()
                ? "Поставить таймер на паузу"
                : "Запустить таймер"
            }
          >
            {timerInProgressAtom() ? (
              <Pause className="size-5 color-white" />
            ) : (
              <Play className="size-5 color-white" />
            )}
          </button>

          <QuizArrow
            direction="right"
            onClick={() => nextQuestion()}
            disabled={currentIndex >= questions.length - 1}
            className="fixed right-5 top-1/2 -translate-y-1/2"
          />
        </div>

        <div className="absolute left-1/2 top-2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--quiz-surface-dim)] bg-white/90 px-3 py-1 text-sm font-medium text-[var(--quiz-text-primary)] shadow-sm backdrop-blur">
          <Hourglass className="size-8 text-[var(--quiz-purple)]" />
          <span className="font-mono tabular-nums text-xl">
            {formatTimer(timerAtom())}
          </span>
        </div>
      </div>
      {showTimeIsUpScreenAtom() && (
        <TimeIsUpScreen onClose={() => showTimeIsUpScreenAtom.set(false)} />
      )}
    </QuizScreen>
  );
});
export default QuizPlay;
