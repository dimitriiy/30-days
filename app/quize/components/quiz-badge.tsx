import { cn } from "@/lib/utils";
import { type ComponentProps, type ReactNode } from "react";

type QuizBadgeProps = ComponentProps<"div"> & {
  icon: ReactNode;
  label: string;
};

export function QuizBadge({ icon, label, className, ...props }: QuizBadgeProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-[var(--quiz-radius-md)] bg-[var(--quiz-surface)] px-4 py-3 text-center",
        className
      )}
      {...props}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium text-[var(--quiz-text-secondary)]">
        {label}
      </span>
    </div>
  );
}
