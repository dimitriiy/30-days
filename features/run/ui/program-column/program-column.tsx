"use client";

import { useCallback } from "react";
import type { TrainingItem } from "@/entities/workout/model/types";
import { motion } from "motion/react";
import { useProgramColumnMeta, useProgramAnimation } from "./model";
import { ProgramDateBadges } from "./ui/program-date-badges";
import { ProgramContent } from "./ui/program-content";
import { ProgramCheckbox } from "./ui/program-checkbox";
import { DistanceBadge } from "./ui/distance-badge";
import {
  GlassCard as Card,
  GlassCardContent as CardContent,
} from "@/components/ui/glass-card";

interface ProgramColumnProps {
  data: TrainingItem;
  onChange: (item: TrainingItem, done: boolean) => void;
  onClick: () => void;
  checked: boolean;
  isToday?: boolean;
  todayRef?: React.RefObject<HTMLDivElement | null>;
}

export const ProgramColumn = ({
  data,
  onChange,
  checked,
  isToday,
  todayRef,
  onClick,
}: ProgramColumnProps) => {
  const { animateCheck } = useProgramAnimation();
  const { fullDateLabel, shortDateLabel, isRestDay, programItems } =
    useProgramColumnMeta(data);

  const handleCheckboxChange = useCallback(
    (value: boolean) => {
      if (value) {
        animateCheck();
      }
      onChange(data, value);
    },
    [data, onChange, animateCheck],
  );

  return (
    <div className="flex-1 h-full min-h-[200px] min-w-[200px] rounded-xl text-white m-1 relative">
      <Card
        onClick={onClick}
        ref={isToday ? todayRef : undefined}
        className="h-full min-h-[200px] min-w-[200px] flex flex-col"
      >
        <ProgramDateBadges
          fullDateLabel={fullDateLabel}
          shortDateLabel={shortDateLabel}
          isRest={data.program.includes("Отдых")}
        />
        <div className="tbody p-2 flex-1 flex flex-col">
          <div className="top flex justify-between mb-2">
            <div className="tday font-bold">День {data.day}</div>
            <ProgramCheckbox
              checked={checked}
              onChange={handleCheckboxChange}
            />
          </div>

          <ProgramContent items={programItems} />
          {!isRestDay && <DistanceBadge distance={data.distance} />}
        </div>
      </Card>
    </div>
  );
};
