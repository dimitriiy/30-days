"use client";

import { useCallback } from "react";
import type { TrainingItem } from "@/entities/workout/model/types";
import { motion } from "motion/react";
import { useProgramColumnMeta, useProgramAnimation } from "./model";
import { ProgramDateBadges } from "./ui/program-date-badges";
import { ProgramContent } from "./ui/program-content";
import { ProgramCheckbox } from "./ui/program-checkbox";
import { DistanceBadge } from "./ui/distance-badge";

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
  const { controls, animateCheck } = useProgramAnimation();
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
    <motion.div
      initial={{ scale: 0.9 }}
      whileInView={{ scale: 1 }}
      animate={controls}
      onClick={onClick}
      ref={isToday ? todayRef : undefined}
      className={`shadow-2xl min-h-[200px] min-w-[200px] rounded-xl flex-1 text-white  m-1 relative ${
        !isRestDay ? "bg-[#252525]" : "bg-[#363636]"
      } ${
        isToday
          ? "ring-1 ring-yellow-400 ring-offset-2 ring-offset-[#070101]"
          : checked
            ? "ring-[#00fb0042] ring-1 ring-offset-[#070101]"
            : ""
      }`}
    >
      <ProgramDateBadges
        fullDateLabel={fullDateLabel}
        shortDateLabel={shortDateLabel}
      />

      <div className="tbody p-2">
        <div className="top flex justify-between mb-2">
          <div className="tday font-bold">День {data.day}</div>
          <ProgramCheckbox checked={checked} onChange={handleCheckboxChange} />
        </div>

        <ProgramContent items={programItems} />
        {!isRestDay && <DistanceBadge distance={data.distance} />}
      </div>
    </motion.div>
  );
};
