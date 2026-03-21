"use client";

import {
  DialogContent,
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProgramItem } from "../page";
import { StatTable } from "./StatTable";
import { WeeklyDistanceChart } from "./WeeklyChart";

interface DataTableProps<TData, TValue> {
  data: TData[];
  doneList: number[];
  close: () => void;
}

export type Week = {
  weekNumber: number;
  days: ProgramItem[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Workout = any;
export function groupWorkoutsByWeek(workouts: Workout[]) {
  const weeks: Record<number, (Workout | null)[]> = {};

  workouts.forEach((w) => {
    const weekNumber = Math.ceil(w.day / 7); // 1,2,3,...
    const indexInWeek = (w.day - 1) % 7; // 0..6

    if (!weeks[weekNumber]) {
      weeks[weekNumber] = Array(7).fill(null);
    }

    weeks[weekNumber][indexInWeek] = w;
  });

  // превращаем в массив для рендера
  return Object.entries(weeks)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([weekNumber, days]) => ({
      weekNumber: Number(weekNumber),
      days, // длина 7, элементы Workout | null
    })) as Week[];
}

export function StatDesktop<TData, TValue>({
  doneList,
  data,
  close,
}: DataTableProps<TData, TValue>) {
  // console.log(weeks, doneList);
  return (
    <Dialog open={true} onOpenChange={close}>
      <DialogHeader>
        <DialogTitle>Общая статистика</DialogTitle>
      </DialogHeader>
      <DialogContent
        className={
          "lg:max-w-screen-lg overflow-y-scroll max-h-screen no-scrollbar"
        }
      >
        <div className="px-1  w-full h-full">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="chart">Пиздатые графики</TabsTrigger>
              <TabsTrigger value="table">Норм таблицы</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="w-full">
              <WeeklyDistanceChart doneList={doneList} data={data} />
            </TabsContent>

            <TabsContent value="table" className="w-full max-h-[80vh]">
              <StatTable doneList={doneList} data={data} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
