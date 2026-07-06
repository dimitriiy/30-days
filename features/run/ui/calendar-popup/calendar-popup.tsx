"use client";

import { GlassDialog as Dialog, GlassDialogContent as DialogContent } from "@/components/ui/glass-dialog";
import { EventFormPopup } from "../event-form/event-form";
import { CalendarDialogHeader } from "./ui/dialog-header";
import { EventList } from "./ui/event-list";
import { EmptyState } from "./ui/empty-state";
import { LoadingState } from "./ui/loading-state";
import {
  eventsAtom,
  eventsStatus,
  openCreateForm,
  openEditForm,
} from "../../model/eventsModel";
import { useAtom, useAction } from "@reatom/react";

interface CalendarPopupProps {
  open: boolean;
  onClose: () => void;
}

export const CalendarPopup = ({ open, onClose }: CalendarPopupProps) => {
  const [events] = useAtom(eventsAtom);
  const [status] = useAtom(eventsStatus);
  const isPending = status.isPending;
  const handleCreateForm = useAction(openCreateForm);
  const handleEditForm = useAction(openEditForm);

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-sm">
          <CalendarDialogHeader onCreate={handleCreateForm} />

          <div className="py-2">
            {isPending && events.length === 0 ? (
              <LoadingState />
            ) : events.length === 0 ? (
              <EmptyState />
            ) : (
              <EventList events={events} onEdit={handleEditForm} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EventFormPopup />
    </>
  );
};
