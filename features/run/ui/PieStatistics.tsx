'use client';

import type { TrainingItem } from "@/entities/workout/model/types";
import { calculateDistanceStats } from "../model/statistics";

import { Card, CardContent } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

interface Props {
  programs: TrainingItem[];
  done: number[];
}

const chartConfig = {
  progress: {
    label: "Progress",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export const PieStatistics = ({ programs, done }: Props) => {
  const { allDistance, doneDistance, progress } = calculateDistanceStats(
    programs,
    done,
  );

  const item = {
    name: "Пройдено",
    progress,
    all: allDistance.toFixed(),
    current: doneDistance.toFixed(),
    href: "#",
    fill: "rgba(62,180,137,1)",
  };
 
  
  return (
    <div className="ptyary-2">
      <Card className="p-0 gap-0 ">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center">
              <ChartContainer
                config={chartConfig}
                className="h-[80px] w-[80px]"
              >
                <RadialBarChart
                  data={[item]}
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
                    fill={item.fill}
                    angleAxisId={0}
                  />
                </RadialBarChart>
              </ChartContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-medium text-foreground">
                  {item.progress}%
                </span>
              </div>
            </div>
            <div>
              <div className="text-base font-medium text-foreground">
                {item.current} km / {item.all} km
              </div>
              <dt className="text-sm text-muted-foreground">{item.name}</dt>
            </div>
          </div>
        </CardContent>
        {/* <CardFooter className="flex items-center justify-end border-t border-border p-0!">
          <a
            href={item.href}
            className="text-sm font-medium text-primary px-6 py-3 hover:text-primary/90"
          >
            View more &#8594;
          </a>
        </CardFooter> */}
      </Card>
    </div>
  );
};
