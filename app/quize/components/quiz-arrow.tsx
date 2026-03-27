import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ComponentProps } from "react";

type QuizArrowProps = Omit<ComponentProps<"button">, "children"> & {
  direction: "left" | "right";
};

export function QuizArrow({ direction, className, ...props }: QuizArrowProps) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;

  return (
    <button
      className={cn(
        "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--quiz-text-primary)] transition-colors bg-[var(--quiz-surface)] hover:blue  disabled:cursor-default disabled:opacity-30",
        className,
      )}
      {...props}
    >
      <Icon className="size-5" />
    </button>
  );
}
