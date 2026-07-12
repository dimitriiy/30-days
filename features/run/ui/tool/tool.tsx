"use client";

import React from "react";
import * as motion from "motion/react-client";
import { StatDesktop } from "../stat-desktop/stat-desktop";
import { useToolState } from "./model/useToolState";
import { StatTrigger } from "./ui/stat-trigger";
import { FlipTimer } from "./ui/flip-timer";
import type { TrainingItem } from "@/entities/workout/model/types";

const TARGET_DATE = new Date(2026, 8, 27);

interface ToolProps {
  topSlot?: React.ReactNode;
  bottomSlot?: React.ReactNode;
  programs: TrainingItem[];
  doneList: number[];
}

const Tool = ({ topSlot, bottomSlot, programs, doneList }: ToolProps) => {
  const { show, open, close } = useToolState();

  return (
    <>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
        <div className="m-3  p-2 rounded-2xl">
          {topSlot}
          <FlipTimer targetDate={TARGET_DATE} />
          <StatTrigger onClick={open}>{bottomSlot}</StatTrigger>
        </div>
      </motion.div>

      {show && (
        <StatDesktop doneList={doneList} data={programs} close={close} />
      )}
    </>
  );
};

export default Tool;
