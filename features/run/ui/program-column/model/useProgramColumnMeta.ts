"use client";

import { useMemo } from "react";
import type { TrainingItem } from "@/entities/workout/model/types";

function formatRuDate(dateString: string): string {
  const [d, m, y] = dateString.split(".");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "full",
    timeStyle: "long",
  }).format(date);
}

function splitDateLabels(formattedDate: string, rawDate: string): [string, string] {
  const primary = formattedDate.split(",")?.[0] ?? formattedDate;
  const secondary = rawDate.replace(/\.\d{4}$/, "");
  return [primary, secondary];
}

export interface ProgramColumnMeta {
  fullDateLabel: string;
  shortDateLabel: string;
  isRestDay: boolean;
  programItems: string[];
}

export function useProgramColumnMeta(data: TrainingItem): ProgramColumnMeta {
  return useMemo(() => {
    const formatted = formatRuDate(data.date);
    const [fullDateLabel, shortDateLabel] = splitDateLabels(formatted, data.date);

    return {
      fullDateLabel,
      shortDateLabel,
      isRestDay: data.program.includes("Отдых"),
      programItems: data.program
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
  }, [data.date, data.program]);
}
