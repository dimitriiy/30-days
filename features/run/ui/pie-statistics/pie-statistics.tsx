"use client";

import { GlassCard as Card, GlassCardContent as CardContent } from "@/components/ui/glass-card";
import { ProgressChart } from "./ui/progress-chart";
import { StatsInfo } from "./ui/stats-info";
import { useDistanceStats } from "./model";
import type { TrainingItem } from "@/entities/workout/model/types";

interface PieStatisticsProps {
  programs: TrainingItem[];
  done: number[];
}

export const PieStatistics = ({ programs, done }: PieStatisticsProps) => {
  const { allDistance, doneDistance, progress, skippedDistance } =
    useDistanceStats(programs, done);

  return (
    <div className="py-2">
      <Card className="p-0 gap-0">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <ProgressChart progress={progress} />
            <StatsInfo
              current={doneDistance.toFixed()}
              all={allDistance.toFixed()}
              skipped={skippedDistance}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
