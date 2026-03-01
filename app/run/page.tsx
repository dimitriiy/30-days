"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Spinner } from "@/components/ui/spinner";
import { EditDialog } from "./components/Edit";

import { Statistics } from "./components/Statistics";
import { ProgramColumn } from "./components/ProgramColumn";
import { getTodayString } from "@/lib/dates";
import { reatomComponent } from "@reatom/react";
import {
  doneListAtom,
  isModalOpen,
  programsAtom,
  programsResource,
  programsStatus,
  selectedCard,
  toggleDone,
} from "./model";

const Coutdown = React.lazy(() => import("./components/Coutdown"));

export type ProgramItem = {
  date: string; // "dd.mm.yyyy"
  day: number;
  program: string;
  id: number;
  distance: number;
};

const Dashboard = reatomComponent(() => {
  const { isFirstPending, isPending } = programsStatus();

  const programs = programsAtom();
  const doneList = doneListAtom();

  console.log(doneList);
  const openDialog = (card: ProgramItem) => {
    selectedCard.set(card);
    isModalOpen.setTrue();
  };

  const today = useMemo(() => getTodayString(), []);
  const todayRef = useRef<HTMLDivElement | null>(null);

  // автоскролл к карточке сегодняшнего дня
  useEffect(() => {
    if (!isPending && todayRef.current) {
      todayRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [isPending]);

  const isDateDone = useCallback(
    (id: number) => !!doneList.find((doneId) => doneId === id),
    [doneList],
  );

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070101]">
        <Spinner color="#fff" className="size-8" />
      </div>
    );
  }

  const currentSelectedCard = selectedCard();
  return (
    <div className="flex min-h-screen items-center justify-center font-sans bg-[#070101]">
      <main className="flex min-h-screen w-full flex-col items-center justify-between py-2 px-5 sm:items-start">
        <div className="flex flex-wrap item-st">
          {programs.map((program: ProgramItem) => {
            const isToday = program.date === today;

            return (
              <ProgramColumn
                key={program.id}
                data={program}
                onChange={toggleDone}
                checked={isDateDone(program.id)}
                isToday={isToday}
                todayRef={isToday ? todayRef : undefined}
                onClick={() => openDialog(program)}
              />
            );
          })}
        </div>

        {isModalOpen() && currentSelectedCard && (
          <EditDialog
            data={currentSelectedCard}
            onSaved={() => programsResource.retry()}
            close={() => {
              selectedCard.set(null);
              isModalOpen.setFalse();
            }}
          />
        )}
        <React.Suspense>
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2">
            <Coutdown
              bottomSlot={<Statistics programs={programs} done={doneList} />}
            />
          </div>
        </React.Suspense>
      </main>
    </div>
  );
});

export default Dashboard;
