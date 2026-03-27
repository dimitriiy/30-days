import { cn } from "@/lib/utils";
import { type ComponentProps } from "react";

export function ProBadge({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "inline-flex hover:bg-[var(--quiz-purple-light)] cursor-pointer items-center justify-center rounded-[var(--quiz-radius-md)] bg-[var(--quiz-purple)] px-4 py-2 text-sm font-bold tracking-wide text-white shadow-[0_4px_20px_rgba(108,92,231,0.4)]",
        className,
      )}
      {...props}
    >
      ?
    </button>
  );
}
