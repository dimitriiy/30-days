"use client";

import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { TrainingItem } from "@/entities/workout/model/types";
import { useGroupedWeeks } from "./model/useGroupedWeeks";
import { StatTableHeader } from "./ui/table-header";
import { WeekRow } from "./ui/week-row";

interface StatTableProps {
  data: TrainingItem[];
  doneList: number[];
}

export const StatTable = ({ data, doneList }: StatTableProps) => {
  const weeks = useGroupedWeeks(data);

  console.log(weeks);
  return (
    <div className="scrollbar-shadcn w-full max-h-[70vh] overflow-auto">
      <table className="w-full min-w-[920px] caption-bottom text-sm">
        <StatTableHeader />
        <TableBody>
          {weeks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                Нет данных
              </TableCell>
            </TableRow>
          ) : (
            weeks.map((week) => (
              <WeekRow key={week.weekNumber} week={week} doneList={doneList} />
            ))
          )}
        </TableBody>
      </table>
    </div>
  );
};
