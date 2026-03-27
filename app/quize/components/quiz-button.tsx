"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";

const quizButtonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--quiz-teal)] text-white hover:bg-[var(--quiz-teal-hover)] shadow-[0_4px_16px_rgba(0,201,167,0.3)]",
        outline:
          "border-2 border-[var(--quiz-navy)] text-[var(--quiz-navy)] bg-transparent hover:bg-[var(--quiz-navy)] hover:text-white",
        danger:
          "bg-[var(--quiz-coral)] text-white hover:bg-[var(--quiz-coral-hover)] shadow-[0_4px_16px_rgba(232,80,91,0.3)]",
        ghost:
          "text-[var(--quiz-text-secondary)] hover:text-[var(--quiz-text-primary)] hover:bg-[var(--quiz-surface)]",
        "outline-light":
          "border-2 border-white/30 text-white bg-transparent hover:bg-white/10",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-[var(--quiz-radius-full)]",
        md: "h-11 px-6 text-sm rounded-[var(--quiz-radius-full)]",
        lg: "h-13 px-8 text-base rounded-[var(--quiz-radius-full)]",
        xl: "h-14 px-10 text-lg rounded-[var(--quiz-radius-full)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type QuizButtonProps = ComponentProps<"button"> &
  VariantProps<typeof quizButtonVariants>;

export function QuizButton({
  className,
  variant,
  size,
  ...props
}: QuizButtonProps) {
  return (
    <button
      className={cn(quizButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { quizButtonVariants };
