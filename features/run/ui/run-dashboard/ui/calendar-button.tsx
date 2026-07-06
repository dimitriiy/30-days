"use client";

import { Button } from "@/components/ui/button";
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
