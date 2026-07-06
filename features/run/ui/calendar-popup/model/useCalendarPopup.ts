"use client";

import {
  eventsAtom,
  eventsResource,
  openCreateForm,
  openEditForm,
} from "@/features/run/model";
import { useAtom } from "@reatom/react";

export function useCalendarPopupData() {
  const events = useAtom(eventsAtom);
  const [{ isPending }] = useAtom(eventsResource.status);

  return {
    events,
    isPending,
    onCreate: openCreateForm,
    onEdit: openEditForm,
  };
}
