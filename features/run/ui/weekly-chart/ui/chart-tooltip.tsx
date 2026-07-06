"use client";

import type { WeeklyChartItem } from "@/features/run/model";

interface ChartTooltipProps {
  data: WeeklyChartItem[];
}

export function formatTooltipLabel(label: number, data: WeeklyChartItem[]): string {
  const weekData = data.find((d) => d.week === label);
  if (weekData?.weekStart && weekData?.weekEnd) {
    const formatDateStr = (dateStr: string) => {
      const parts = dateStr.split(".");
      return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : dateStr;
    };
    return `Неделя ${label} (${formatDateStr(weekData.weekStart)} - ${formatDateStr(weekData.weekEnd)})`;
  }
  return `Неделя ${label}`;
}

export function formatTooltipValue(value: number, name: string): [string, string] {
  return [`${value} км`, name === "plannedDistance" ? "План" : "Выполнено"];
}

export function formatLegendValue(value: string): string {
  return value === "plannedDistance" ? "Плановая дистанция" : "Выполненная дистанция";
}

export function formatXAxisTick(value: number, isMobile: boolean): string {
  return isMobile ? `${value}` : `Неделя ${value}`;
}
