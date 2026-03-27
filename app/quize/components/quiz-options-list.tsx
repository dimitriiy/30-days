"use client";

import { QuizOption } from "./quiz-option";

type QuizOptionsListProps = {
  options: string[];
  selected?: number | null;
  onSelect?: (index: number) => void;
  showCorrectAnswer?: boolean;
  correctIndex?: number | null;
};

export function QuizOptionsList({
  options,
  selected,
  onSelect,
  showCorrectAnswer,
  correctIndex = null,
}: QuizOptionsListProps) {
  const isCorrect = (index: number) =>
    Boolean(
      showCorrectAnswer && correctIndex !== null && correctIndex === index,
    );

  const isWrong = (index: number) =>
    Boolean(
      showCorrectAnswer &&
      selected !== null &&
      selected === index &&
      correctIndex !== null &&
      selected !== correctIndex,
    );

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option, index) => (
        <QuizOption
          key={index}
          selected={selected === index}
          correct={isCorrect(index)}
          wrong={isWrong(index)}
          onClick={() => onSelect?.(index)}
        >
          {option}
        </QuizOption>
      ))}
    </div>
  );
}
