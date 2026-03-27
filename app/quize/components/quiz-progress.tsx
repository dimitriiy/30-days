import { cn } from "@/lib/utils";
import { type ComponentProps } from "react";

type QuizProgressProps = ComponentProps<"div"> & {
  current: number;
  total: number;
};

export function QuizProgress({
  current,
  total,
  className,
  ...props
}: QuizProgressProps) {
  const percentage = (current / total) * 100;

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <span className="text-center text-lg font-medium text-white">
        Вопрос {current} из{total}
      </span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--quiz-surface-dim)]">
        <div
          className="h-full rounded-full bg-[var(--quiz-purple)] transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
