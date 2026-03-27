import { cn } from "@/lib/utils";
import { type ComponentProps } from "react";

type QuizScreenProps = ComponentProps<"div"> & {
  variant?: "dark" | "light";
};

export function QuizScreen({
  variant = "light",
  className,
  children,
  ...props
}: QuizScreenProps) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden",
        variant === "dark" &&
          "bg-gradient-to-b from-[var(--quiz-navy)] to-[var(--quiz-navy-deep)] text-white",
        variant === "light" && "bg-white text-[var(--quiz-text-primary)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
