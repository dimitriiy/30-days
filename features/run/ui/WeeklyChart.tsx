"use client";

import React from "react";
import type { TrainingItem } from "@/entities/workout/model/types";
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
import {
  groupWorkoutsByWeek,
  prepareWeeklyDistanceData,
} from "../model/statistics";
interface Props {
  data: TrainingItem[];
  doneList: number[];
}

export function WeeklyDistanceChart(props: Props) {
  const data = prepareWeeklyDistanceData(
    props.doneList,
    groupWorkoutsByWeek(props.data),
  );
  const isMobile = typeof window !== "undefined" && window.innerWidth < 480;

  return (
    <div style={{ width: "100%", height: isMobile ? '33vh' : 420 }} className="">
      <ResponsiveContainer className=''>
        <BarChart
          data={data}
          margin={{ top: 20, right: 24, left: 8, bottom: 8 }}
        >
           <defs>
      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#8884d8" stopOpacity={1} />
        <stop offset="100%" stopColor="#000" stopOpacity={0} />
      </linearGradient>
      <defs>
    <linearGradient id="colorPv" x1="-2.5328" y1="6.14922" x2="244.967" y2="183.149" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ADE8F4" stopOpacity="0.08" />
      <stop offset="0.0001" stopColor="#00A3FF" />
      <stop offset="0.635417" stopColor="#FA00FF" stopOpacity="0.85" />
      <stop offset="1" stopColor="#FF00B8" />
    </linearGradient>
  </defs>
    </defs>

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
            fill="url(#colorUv)"
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
            fill="url(#colorUv)"
          />
          <Bar dataKey="doneDistance" name="doneDistance" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={`cell-${entry.week}`}

                fill={entry.doneDistance > 0 ? "rgba(62,180,137,0.7)" : "url(#colorUv)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
