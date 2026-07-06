"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { TrainingItem } from "@/entities/workout/model/types";
import { type Week, calculateWeekProgress } from "@/features/run/model";

interface WeekRowProps {
  week: Week;
  doneList: number[];
}

export const WeekRow = ({ week, doneList }: WeekRowProps) => {
  return (
    <TableRow key={week.weekNumber}>
      <TableCell className="font-medium">{week.weekNumber}</TableCell>

      <TableCell className="font-medium">
        <div className="text-base font-small text-foreground">
          {calculateWeekProgress(week, doneList)}
        </div>
      </TableCell>

      {week.days.map((w, idx) => (
        <TableCell key={idx} className="align-top relative">
          <DayCell day={w} />
        </TableCell>
      ))}
    </TableRow>
  );
};

interface DayCellProps {
  day: TrainingItem | null;
}

const DayCell = ({ day }: DayCellProps) => {
  if (!day) {
    return (
      <div className="absolute bottom-2">
        <Badge variant="outline">rest</Badge>
      </div>
    );
  }

  return (
    <div className="space-y-1 max-w-[200px] flex flex-col h-full">
      <div className="text-xs text-muted-foreground">
        День {day.day} • {day.date}
      </div>
      {day.distance > 0 ? (
        <>
          <div className="text-xs whitespace-break-spaces pb-2">
            {day.program}
          </div>
          <div className="text-xs font-medium">
            <Badge>{day.distance} км</Badge>
          </div>
        </>
      ) : (
        <div className="absolute bottom-2">
          <Badge variant="outline">rest</Badge>
        </div>
      )}
    </div>
  );
};
