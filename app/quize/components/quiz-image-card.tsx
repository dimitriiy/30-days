import { cn } from "@/lib/utils";
import { type ComponentProps, type ReactNode } from "react";

type QuizImageCardProps = ComponentProps<"div"> & {
  icon: ReactNode;
};

export function QuizImageCard({ icon, className, ...props }: QuizImageCardProps) {
  return (
    <div
      className={cn(
        "flex h-48 items-center justify-center rounded-[var(--quiz-radius-xl)] bg-[var(--quiz-card-image-bg)] shadow-[var(--quiz-shadow)]",
        className
      )}
      {...props}
    >
      <span className="text-6xl drop-shadow-lg">{icon}</span>
    </div>
  );
}
