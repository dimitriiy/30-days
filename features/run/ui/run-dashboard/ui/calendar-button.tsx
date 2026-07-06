"use client";

import { GlassButton as Button } from "@/components/ui/glass-button";
import { CalendarDays } from "lucide-react";

interface CalendarButtonProps {
  onClick: () => void;
}

export const CalendarButton = ({ onClick }: CalendarButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="icon"
      className="text-white"
    >
      <CalendarDays />
    </Button>
  );
};
