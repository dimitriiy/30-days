"use client";

import { useMemo } from "react";
import type { TrainingItem } from "@/entities/workout/model/types";
import { calculateDistanceStats } from "@/features/run/model";

export interface DistanceStats {
  allDistance: number;
  doneDistance: number;
  progress: number;
  skippedDistance: number;
}

export function useDistanceStats(
  programs: TrainingItem[],
  done: number[]
): DistanceStats {
  return useMemo(() => {
    return calculateDistanceStats(programs, done);
  }, [programs, done]);
}
