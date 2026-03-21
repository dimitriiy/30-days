import type { ProgramItem } from "../page";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

interface Props {
  programs: ProgramItem[];
  done: number[];
}

const chartConfig = {
  progress: {
    label: "Progress",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export const PieStatistics = ({ programs, done }: Props) => {
  const accDistance = programs.reduce((acc, c) => (acc += c.distance), 0);

  const doneSet = new Set(done);
  const doneDistance = programs
    .filter((p) => doneSet.has(p.id))
    .reduce((acc, c) => (acc += c.distance), 0);

  const progress = Math.floor((doneDistance / accDistance) * 100);

  const item = {
    name: "Пройдено",
    progress,
    all: accDistance.toFixed(),
    current: doneDistance.toFixed(),
    href: "#",
    fill: "var(--chart-4)",
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
              <dd className="text-base font-medium text-foreground">
                {item.current} km / {item.all} km
              </dd>
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
