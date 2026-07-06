"use client";

import { useMemo } from "react";
import type { TrainingItem } from "@/entities/workout/model/types";
import {
  groupWorkoutsByWeek,
  prepareWeeklyDistanceData,
} from "@/features/run/model";

export function useWeeklyChartData(data: TrainingItem[], doneList: number[]) {
  return useMemo(() => {
    return prepareWeeklyDistanceData(doneList, groupWorkoutsByWeek(data));
  }, [data, doneList]);
}

export function useIsMobile(): boolean {
  return typeof window !== "undefined" && window.innerWidth < 480;
}
