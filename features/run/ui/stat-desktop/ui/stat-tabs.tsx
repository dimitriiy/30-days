"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatTable } from "../../stat-table/stat-table";
import { WeeklyDistanceChart } from "../../weekly-chart/weekly-chart";
import type { TrainingItem } from "@/entities/workout/model/types";

interface StatTabsProps {
  data: TrainingItem[];
  doneList: number[];
}

export const StatTabs = ({ data, doneList }: StatTabsProps) => {
  return (
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
  );
};
