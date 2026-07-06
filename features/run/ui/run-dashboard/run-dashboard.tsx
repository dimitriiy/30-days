"use client";

import React from "react";
import { reatomComponent } from "@reatom/react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import type { TrainingItem } from "@/entities/workout/model/types";
import { EditDialog } from "../edit-dialog/edit-dialog";
import { PieStatistics } from "../pie-statistics/pie-statistics";
import { ProgramGrid } from "../program-grid/program-grid";
import { CalendarPopup } from "../calendar-popup/calendar-popup";
import {
  doneListAtom,
  isCalendarOpen,
  isModalOpen,
  programsAtom,
  programsResource,
  programsStatus,
  selectedCard,
  toggleDone,
} from "../../model/runModel";
import { useDoneProgramLookup } from "../../model/useDoneProgramLookup";
import { useTodayProgramRef } from "../../model/useTodayProgramRef";
import { CalendarButton } from "./ui/calendar-button";
import { LoadingScreen } from "./ui/loading-screen";
import { BackgroundSpinner } from "./ui/background-spinner";
import { httpPost } from "@/lib/api";

const Tool = React.lazy(() => import("../tool/tool"));

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

  const handleLogout = async () => {
    // TODO: Implement logout logic

    await httpPost("/api/auth/logout", {});

    console.log("Logout clicked");
  };

  if (isPending && !programs.length) {
    return <LoadingScreen />;
  }

  const currentSelectedCard = selectedCard();

  return (
    <div className="flex min-h-screen items-center justify-center font-sans bg-[#070101]">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 rounded-b-md bg-[#252525]/95 backdrop-blur-sm border-b border-gray-800/50">
        <div className="flex items-center justify-between px-5 py-3">
          <CalendarButton onClick={isCalendarOpen.setTrue} />
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="icon"
            className="hover:bg-red-500/10 hover:text-red-500 text-white"
            aria-label="Logout"
          >
            <LogOut />
          </Button>
        </div>
      </header>

      <main className="flex min-h-screen w-full flex-col items-center justify-between pt-16 py-2 px-5 sm:items-start">
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

      {isCalendarOpen() && (
        <CalendarPopup
          open={isCalendarOpen()}
          onClose={isCalendarOpen.setFalse}
        />
      )}
      {isPending && programs.length && <BackgroundSpinner />}
    </div>
  );
});

export default RunDashboard;
