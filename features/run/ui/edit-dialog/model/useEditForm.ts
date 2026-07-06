"use client";

import { useState, useTransition, useCallback } from "react";
import type { TrainingItem } from "@/entities/workout/model/types";
import { httpPut } from "@/lib/api";

interface UseEditFormProps {
  data: TrainingItem;
  close: () => void;
  onSaved?: (updated: TrainingItem) => void;
}

interface UseEditFormResult {
  error: string | null;
  isPending: boolean;
  handleSubmit: React.FormEventHandler<HTMLFormElement>;
}

export function useEditForm({
  data,
  close,
  onSaved,
}: UseEditFormProps): UseEditFormResult {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
    (event) => {
      event.preventDefault();
      setError(null);

      const formData = new FormData(event.currentTarget);
      const program = String(formData.get("program") ?? "").trim();
      const distance = +String(formData.get("distance") ?? "").trim();

      startTransition(async () => {
        try {
          await httpPut("/api/run/programs", {
            ...data,
            program,
            distance,
          });

          const updated: TrainingItem = {
            ...data,
            program,
            distance,
          };

          onSaved?.(updated);
          close();
        } catch (err) {
          console.error(err);
          setError("Что‑то пошло не так. Сервер где‑то в инете плачет.");
        }
      });
    },
    [data, close, onSaved],
  );

  return {
    error,
    isPending,
    handleSubmit,
  };
}
