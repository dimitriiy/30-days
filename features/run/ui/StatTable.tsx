"use client";

import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import type { TrainingItem } from "@/entities/workout/model/types";
import {
  calculateWeekProgress,
  groupWorkoutsByWeek,
} from "../model/statistics";
import { Badge } from "@/components/ui/badge";

interface StatTableProps {
  data: TrainingItem[];
  doneList: number[];
}

export const StatTable = ({ data, doneList }: StatTableProps) => {
  const weeks = groupWorkoutsByWeek(data);

  return (
    <div className="scrollbar-shadcn w-full max-h-[70vh] overflow-auto">
      <table className="w-full min-w-[920px] caption-bottom text-sm">
        <TableHeader className="sticky top-0 z-10 bg-background">
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
                <TableCell className="font-medium">{week.weekNumber}</TableCell>

                <TableCell className="font-medium">
                  <div className="text-base font-small text-foreground">
                  {calculateWeekProgress(week, doneList)}
              </div>
                </TableCell>

                {week.days.map((w, idx) => (
                  <TableCell key={idx} className="align-top relative">
                    {!w ? (
                      <div className="absolute bottom-2">
                        <Badge variant="outline">rest</Badge>
                      </div>
                    ) : (
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
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </table>
    </div>
  );
};
