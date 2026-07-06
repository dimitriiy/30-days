"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

const CHART_CONFIG = {
  progress: {
    label: "Progress",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

interface ProgressChartProps {
  progress: number;
}

export const ProgressChart = ({ progress }: ProgressChartProps) => {
  const data = [
    {
      name: "Пройдено",
      progress,
      fill: "rgba(62,180,137,1)",
    },
  ];

  return (
    <div className="relative flex items-center justify-center">
      <ChartContainer config={CHART_CONFIG} className="h-[80px] w-[80px]">
        <RadialBarChart
          data={data}
          innerRadius={30}
          outerRadius={60}
          barSize={6}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
            axisLine={false}
          />
          <RadialBar
            dataKey="progress"
            background
            cornerRadius={10}
            fill={data[0].fill}
            angleAxisId={0}
          />
        </RadialBarChart>
      </ChartContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-medium text-foreground">
          {progress}%
        </span>
      </div>
    </div>
  );
};
