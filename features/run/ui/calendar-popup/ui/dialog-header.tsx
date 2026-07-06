"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CalendarDialogHeaderProps {
  onCreate: () => void;
}

export const CalendarDialogHeader = ({ onCreate }: CalendarDialogHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <span>Run events</span>
        <Button size="icon-xs" variant="ghost" onClick={onCreate}>
          <Plus />
        </Button>
      </DialogTitle>
    </DialogHeader>
  );
};
