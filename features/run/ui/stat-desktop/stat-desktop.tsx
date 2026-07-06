"use client";

import type { TrainingItem } from "@/entities/workout/model/types";
import { StatDialog } from "./ui/stat-dialog";
import { StatTabs } from "./ui/stat-tabs";

interface StatDesktopProps {
  data: TrainingItem[];
  doneList: number[];
  close: () => void;
}

export function StatDesktop({ doneList, data, close }: StatDesktopProps) {
  return (
    <StatDialog open={true} onClose={close}>
      <StatTabs data={data} doneList={doneList} />
    </StatDialog>
  );
}
