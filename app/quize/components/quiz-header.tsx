"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ComponentProps, type ReactNode } from "react";

type QuizHeaderProps = ComponentProps<"header"> & {
  title?: string;
  showBack?: boolean;
  trailing?: ReactNode;
  variant?: "dark" | "light";
};

export function QuizHeader({
  title,
  showBack = false,
  trailing,
  variant = "light",
  className,
  ...props
}: QuizHeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn("flex items-center justify-between px-5 py-2", className)}
      {...props}
    >
      <div className="w-10">
        {showBack && (
          <button
            onClick={() => router.back()}
            className={cn(
              "flex size-10 items-center justify-center rounded-full transition-colors cursor-pointer",
              variant === "dark"
                ? "text-white hover:bg-white/10"
                : "text-[var(--quiz-text-primary)] hover:bg-[var(--quiz-surface)]",
            )}
          >
            <ChevronLeft className="size-5" />
          </button>
        )}
      </div>
      {title && (
        <h2
          className={cn(
            "text-sm font-semibold",
            variant === "dark"
              ? "text-white"
              : "text-[var(--quiz-text-primary)]",
          )}
        >
          {title}
        </h2>
      )}
      <div className="w-10 flex justify-end">{trailing}</div>
    </header>
  );
}
