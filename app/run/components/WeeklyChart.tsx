"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { groupWorkoutsByWeek, type Week } from "./StatDesktop";

export function prepareWeeklyDistanceData(
  doneList: number[],
  weeks: Week[],
): WeeklyChartItem[] {
  const doneSet = new Set(doneList);

  return weeks.map((week) => {
    const plannedDistance = week.days.reduce(
      (sum, day) => sum + (Number(day.distance) || 0),
      0,
    );

    const doneDaysList = week.days.filter((day) => doneSet.has(day.id));

    const doneDistance = doneDaysList.reduce(
      (sum, day) => sum + (Number(day.distance) || 0),
      0,
    );

    return {
      week: week.weekNumber,
      plannedDistance: Number(plannedDistance.toFixed(3)),
      doneDistance: Number(doneDistance.toFixed(3)),
      doneDays: doneDaysList.length,
    };
  });
}
interface Props {
  data: TData[];
  doneList: number[];
  close: () => void;
}

export function WeeklyDistanceChart(props: Props) {
  const data = prepareWeeklyDistanceData(
    props.doneList,
    groupWorkoutsByWeek(props.data),
  );
  const isMobile = typeof window !== "undefined" && window.innerWidth < 480;

  return (
    <div style={{ width: "100%", height: isMobile ? 300 : 420 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 24, left: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="week"
            tickFormatter={(value) =>
              isMobile ? `${value}` : `Неделя ${value}`
            }
          />
          {!isMobile && (
            <YAxis
              label={{
                value: "Км за неделю",
                angle: -90,
                position: "insideLeft",
              }}
            />
          )}
          <Tooltip
            formatter={(value, name) => [
              `${value} км`,
              name === "plannedDistance" ? "План" : "Выполнено",
            ]}
            labelFormatter={(label) => `Неделя ${label}`}
          />
          <Legend
            fill="red"
            formatter={(value) =>
              value === "plannedDistance"
                ? "Плановая дистанция"
                : "Выполненная дистанция"
            }
          />
          <Bar
            dataKey="plannedDistance"
            name="plannedDistance"
            radius={[6, 6, 0, 0]}
            fill="#3636366e"
          />
          <Bar dataKey="doneDistance" name="doneDistance" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={`cell-${entry.week}`}
                fill={entry.doneDistance > 0 ? "#ff5f5a" : "#94a3b8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
