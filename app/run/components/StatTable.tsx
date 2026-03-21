"use client";

import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";

import { groupWorkoutsByWeek, StatDesktop, type Week } from "./StatDesktop";
import { getTodayString } from "@/lib/dates";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";

export const StatTable = ({ data, doneList }) => {
  const weeks = groupWorkoutsByWeek(data);
  const today = useMemo(() => getTodayString(), []);

  const getProgress = (week: Week) => {
    const done = week.days
      .filter((w) => doneList.includes(w.day))
      .reduce((acc, c) => (acc += c.distance), 0);

    const all = week.days.reduce((acc, c) => (acc += c.distance), 0);

    return `${done}/${all}`;
  };

  console.log(JSON.stringify({ weeks, doneList }));
  return (
    <Table className="h-full overflow-auto">
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
              <TableCell className="font-medium">{week.weekNumber}</TableCell>

              <TableCell className="font-medium">
                <Badge variant="outline">
                  <span className="bold text-xl">{getProgress(week)}</span>
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
  );
};
