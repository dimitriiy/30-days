"use client";

import {
  DialogContent,
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TrainingItem } from "@/entities/workout/model/types";
import { StatTable } from "./StatTable";
import { WeeklyDistanceChart } from "./WeeklyChart";

interface DataTableProps {
  data: TrainingItem[];
  doneList: number[];
  close: () => void;
}

export function StatDesktop({
  doneList,
  data,
  close,
}: DataTableProps) {
  // console.log(weeks, doneList);
  return (
    <Dialog open={true} onOpenChange={close}>
      <DialogHeader>
        <DialogTitle>Общая статистика</DialogTitle>
      </DialogHeader>
      <DialogContent
        className={
          "lg:max-w-screen-lg max-h-screen"
        }
      >
        <div className="scrollbar-shadcn px-1 w-full h-full max-h-[80vh] overflow-y-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="chart">Пиздатые графики</TabsTrigger>
              <TabsTrigger value="table">Норм таблицы</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="w-full">
              <WeeklyDistanceChart doneList={doneList} data={data} />
            </TabsContent>

            <TabsContent value="table" className="w-full max-h-[80vh]">
              <StatTable doneList={doneList} data={data} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
