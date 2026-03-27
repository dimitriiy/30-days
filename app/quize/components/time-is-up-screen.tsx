import { cn } from "@/lib/utils";
import { Clock3, X } from "lucide-react";
import { useEffect, type ComponentProps } from "react";
import * as motion from "motion/react-client";
import { audioApi } from "../models";

type TimeIsUpScreenProps = ComponentProps<"section"> & {
  message?: string;
  onClose?: () => void;
};

export function TimeIsUpScreen({
  message = "Время вышло",
  onClose,
  className,
  ...props
}: TimeIsUpScreenProps) {
  useEffect(() => {
    audioApi.playTimeIsUp();
    return () => {
      audioApi.stopTimeIsUp();
    };
  }, []);

  return (
    <motion.section
      className={cn(
        "quiz-time-up-overlay fixed inset-0 z-10 flex h-full w-full flex-col items-center justify-center bg-white px-6 text-center text-[var(--quiz-text-primary)]",
        className,
      )}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full text-[var(--quiz-text-secondary)] transition-colors hover:bg-[var(--quiz-surface)] hover:text-[var(--quiz-text-primary)]"
        >
          <X className="size-5" />
        </button>
      )}

      <div className="quiz-time-up-content flex flex-col items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-[var(--quiz-surface)]">
          <Clock3 className="size-15 text-[var(--quiz-coral)]" />
        </div>
        <p className="text-5xl font-bold tracking-tight">{message}</p>
      </div>
    </motion.section>
  );
}
