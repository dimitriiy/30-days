"use client";

import React from "react";
import { reatomComponent } from "@reatom/react";
import { Spinner } from "@/components/ui/spinner";
import type { TrainingItem } from "@/entities/workout/model/types";
import { EditDialog } from "./Edit";
import { PieStatistics } from "./PieStatistics";
import { ProgramGrid } from "./ProgramGrid";
import { useDoneProgramLookup } from "../model/useDoneProgramLookup";
import { useTodayProgramRef } from "../model/useTodayProgramRef";
import {
  doneListAtom,
  isModalOpen,
  programsAtom,
  programsResource,
  programsStatus,
  selectedCard,
  toggleDone,
} from "../model/runModel";

const Tool = React.lazy(() => import("./Tool"));

const RunDashboard = reatomComponent(() => {
  const { isPending } = programsStatus();
  const programs = programsAtom();
  const doneList = doneListAtom();
  const isDateDone = useDoneProgramLookup(doneList);
  const { today, todayRef } = useTodayProgramRef(isPending);

  const openDialog = (card: TrainingItem) => {
    selectedCard.set(card);
    isModalOpen.setTrue();
  };

  if (isPending && !programs.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070101]">
        <Spinner color="#fff" className="size-8" />
      </div>
    );
  }

  const currentSelectedCard = selectedCard();

  
  return (
    <div className="flex min-h-screen items-center justify-center font-sans bg-[#070101]">
      <main className="flex min-h-screen w-full flex-col items-center justify-between py-2 px-5 sm:items-start ">
        <ProgramGrid
          programs={programs}
          today={today}
          todayRef={todayRef}
          isDateDone={isDateDone}
          onToggleDone={toggleDone}
          onOpenDialog={openDialog}
        />

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
            <Tool
              doneList={doneList}
              programs={programs}
              bottomSlot={<PieStatistics programs={programs} done={doneList} />}
            />
          </div>
        </React.Suspense>
      </main>

      {
        isPending && programs.length && <div className="fixed right-5 bottom-5 bg-black p-3 rounded-lg opacity-80">
          <Spinner color="#fff" className="size-8" />
        </div>
      }

    </div>
  );
});

export default RunDashboard;
