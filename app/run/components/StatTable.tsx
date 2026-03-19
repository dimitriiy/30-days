"use client";

import { ColumnDef } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DialogContent,
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getTodayString } from "@/lib/dates";
import { useMemo } from "react";
import type { ProgramItem } from "../page";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  doneList: number[];
  close: () => void;
}

export type Week = {
  weekNumber: number;
  days: ProgramItem[];
};
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

export function StatTable<TData, TValue>({
  doneList,
  data,
  close,
}: DataTableProps<TData, TValue>) {
  const weeks = groupWorkoutsByWeek(data);
  const today = useMemo(() => getTodayString(), []);

  const getProgress = (week: Week) => {
    console.log(
      week,
      week.days.filter((w) => doneList.includes(w.day)),
    );
    const done = week.days
      .filter((w) => doneList.includes(w.day))
      .reduce((acc, c) => (acc += c.distance), 0);

    const all = week.days.reduce((acc, c) => (acc += c.distance), 0);

    return `${done}/${all}`;
  };

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
        <div className="px-4 ">
          <Table className="">
            <TableHeader className="sticky">
              <TableRow>
                <TableHead className="">W</TableHead>
                <TableHead className="">S</TableHead>
                <TableHead className="">D 1</TableHead>
                <TableHead className="">D 2</TableHead>
                <TableHead className="">D 3</TableHead>
                <TableHead>D 4</TableHead>
                <TableHead>D 5</TableHead>
                <TableHead>D 6</TableHead>
                <TableHead>D 7</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Нет данных
                  </TableCell>
                </TableRow>
              ) : (
                weeks.map((week) => (
                  <TableRow key={week.weekNumber}>
                    <TableCell className="font-medium">
                      {week.weekNumber}
                    </TableCell>

                    <TableCell className="font-medium">
                      <Badge variant="outline">
                        <span className="bold text-xl">
                          {getProgress(week)}
                        </span>
                      </Badge>
                    </TableCell>

                    {week.days.map((w, idx) => (
                      <TableCell key={idx} className="align-top relative">
                        <div className="space-y-1 max-w-[200px] flex flex-col h-full">
                          <div className="text-xs text-muted-foreground">
                            День {w.day} • {w.date}
                          </div>
                          {w.distance > 0 ? (
                            <>
                              <div className="text-xs whitespace-break-spaces pb-2">
                                {w.program}
                              </div>
                              <div className="text-xs font-medium">
                                <Badge>{w.distance} км</Badge>
                              </div>
                            </>
                          ) : (
                            <div className="absolute bottom-2">
                              <Badge variant="outline">rest</Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
