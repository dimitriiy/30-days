"use client";

import { Plus } from "lucide-react";
import { GlassButton as Button } from "@/components/ui/glass-button";
import {
  GlassDialogHeader as DialogHeader,
  GlassDialogTitle as DialogTitle,
} from "@/components/ui/glass-dialog";

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
