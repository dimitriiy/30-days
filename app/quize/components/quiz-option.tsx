"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps } from "react";

type QuizOptionProps = ComponentProps<"button"> & {
  selected?: boolean;
  correct?: boolean;
  wrong?: boolean;
};

export function QuizOption({
  className,
  selected,
  correct,
  wrong,
  children,
  ...props
}: QuizOptionProps) {
  return (
    <button
      className={cn(
        "w-full font-bold rounded-[var(--quiz-radius-full)] border-2 px-6 py-3.5 text-center text-2xl transition-all duration-200 cursor-pointer active:scale-[0.98]",
        !selected &&
          !correct &&
          !wrong &&
          "border-[var(--quiz-surface-dim)] bg-[var(--quiz-surface)] text-[var(--quiz-text-primary)] hover:border-[var(--quiz-purple-light)] hover:bg-[var(--quiz-purple-light)]/5",
        selected &&
          "border-[var(--quiz-purple)] bg-[var(--quiz-purple)]/10 text-[var(--quiz-purple)]",
        correct &&
          "border-[var(--quiz-teal)] bg-[var(--quiz-teal)]/10 text-[var(--quiz-teal)] animate-infinite animate-shake",
        wrong &&
          "border-[var(--quiz-coral)] bg-[var(--quiz-coral)]/10 text-[var(--quiz-coral)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
