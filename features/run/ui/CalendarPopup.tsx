"use client";

import { reatomComponent } from "@reatom/react";
import { Pencil, Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  eventsAtom,
  eventsStatus,
  openCreateForm,
  openEditForm,
} from "../model/eventsModel";
import { EventFormPopup } from "./EventFormPopup";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const CalendarPopup = reatomComponent(({ open, onClose }: Props) => {
  const events = eventsAtom();
  const { isPending } = eventsStatus();

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Run events</span>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => openCreateForm()}
              >
                <Plus />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            {isPending && !events.length ? (
              <div className="flex justify-center py-6">
                <Spinner className="size-6" />
              </div>
            ) : events.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                Нет событий
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between border rounded-md p-2 border-neutral-950"
                    onClick={() => openEditForm(event)}
                  >
                    <div className="font-bold min-w-0">
                      <div className="text-red-600 text-sm">{event.date}</div>
                      <div className="text-sm truncate">{event.location}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xl text-black">
                        {event.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EventFormPopup />
    </>
  );
});
