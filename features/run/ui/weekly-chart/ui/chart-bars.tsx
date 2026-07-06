"use client";

import { Bar, Cell } from "recharts";
import type { WeeklyChartItem } from "@/features/run/model";

interface ChartBarsProps {
  data: WeeklyChartItem[];
}

export const ChartBars = ({ data }: ChartBarsProps) => {
  return (
    <>
      <Bar
        dataKey="plannedDistance"
        name="plannedDistance"
        radius={[6, 6, 0, 0]}
        fill="url(#colorUv)"
      />
      <Bar dataKey="doneDistance" name="doneDistance" radius={[6, 6, 0, 0]}>
        {data.map((entry) => (
          <Cell
            key={`cell-${entry.week}`}
            fill={
              entry.doneDistance > 0 ? "rgba(62,180,137,0.7)" : "url(#colorUv)"
            }
          />
        ))}
      </Bar>
    </>
  );
};
