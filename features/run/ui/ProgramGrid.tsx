import type { TrainingItem } from "@/entities/workout/model/types";
import { ProgramColumn } from "./ProgramColumn";
import React from "react";

type ProgramGridProps = {
  programs: TrainingItem[];
  today: string;
  todayRef: React.RefObject<HTMLDivElement | null>;
  isDateDone: (programId: number) => boolean;
  onToggleDone: (item: TrainingItem, done: boolean) => void;
  onOpenDialog: (program: TrainingItem) => void;
};


export const  ProgramGrid = React.memo(({
  programs,
  today,
  todayRef,
  isDateDone,
  onToggleDone,
  onOpenDialog,
}: ProgramGridProps) =>  {
  return (
    <div className="lg:grid flex-wrap lg:grid-cols-7 gap-4 flex">
      {programs.map((program) => {
        const isToday = program.date === today;

        return (
          <ProgramColumn
            key={program.id}
            data={program}
            onChange={onToggleDone}
            checked={isDateDone(program.id)}
            isToday={isToday}
            todayRef={isToday ? todayRef : undefined}
            onClick={() => onOpenDialog(program)}
          />
        );
      })}
    </div>
  );
})