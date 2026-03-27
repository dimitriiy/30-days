"use client";

import { useMemo, useState } from "react";
import { BaseQuestion } from "../system";
import { QuizOptionsList } from "./quiz-options-list";

type QeustionFooterProps = {
  question: BaseQuestion;
  showCorrectAnswer: boolean;
};

export function QeustionFooter({
  question,
  showCorrectAnswer,
}: QeustionFooterProps) {
  const derivedOptions = question.options ?? null;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const correctIndex = useMemo(() => {
    if (!showCorrectAnswer) return null;
    if (!question.correctAnswer) return null;
    if (!derivedOptions) return null;

    const idx = derivedOptions.indexOf(question.correctAnswer);
    return idx >= 0 ? idx : null;
  }, [derivedOptions, question.correctAnswer, showCorrectAnswer]);

  if (!derivedOptions) return null;

  return (
    <div className="shrink-0 m-4 w-full">
      <QuizOptionsList
        options={derivedOptions}
        selected={selectedIndex}
        onSelect={showCorrectAnswer ? undefined : setSelectedIndex}
        showCorrectAnswer={showCorrectAnswer}
        correctIndex={correctIndex}
      />
    </div>
  );
}
