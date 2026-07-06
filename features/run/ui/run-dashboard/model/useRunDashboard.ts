"use client";

import { useCallback } from "react";
import type { TrainingItem } from "@/entities/workout/model/types";
import {
  useDoneProgramLookup,
  useTodayProgramRef,
  doneListAtom,
  isCalendarOpen,
  isModalOpen,
  programsAtom,
  programsResource,
  programsStatus,
  selectedCard,
  toggleDone,
} from "@/features/run/model";
import { useAtom } from "@reatom/react";

export function useRunDashboard() {
  const status = useAtom(programsStatus);
  const isPending = status.isPending;
  const programs = useAtom(programsAtom);
  const doneList = useAtom(doneListAtom);
  const isDateDone = useDoneProgramLookup(doneList);
  const { today, todayRef } = useTodayProgramRef(isPending);

  const openDialog = useCallback((card: TrainingItem) => {
    selectedCard.set(card);
    isModalOpen.setTrue();
  }, []);

  const closeDialog = useCallback(() => {
    selectedCard.set(null);
    isModalOpen.setFalse();
  }, []);

  const handleSaved = useCallback(() => {
    programsResource.retry();
  }, []);

  return {
    isPending,
    programs,
    doneList,
    today,
    todayRef,
    isDateDone,
    selectedCard: useAtom(selectedCard),
    isModalOpen: useAtom(isModalOpen),
    isCalendarOpen: useAtom(isCalendarOpen),
    openDialog,
    closeDialog,
    handleSaved,
    toggleDone,
    openCalendar: isCalendarOpen.setTrue,
    closeCalendar: isCalendarOpen.setFalse,
  };
}
