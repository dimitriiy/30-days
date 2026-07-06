"use client";

import { useMemo } from "react";
import type { TrainingItem } from "@/entities/workout/model/types";
import { groupWorkoutsByWeek } from "@/features/run/model";

export function useGroupedWeeks(data: TrainingItem[]) {
  return useMemo(() => groupWorkoutsByWeek(data), [data]);
}
