"use client";

import { GlassBadge as Badge } from "@/components/ui/glass-badge";

interface ProgramDateBadgesProps {
  fullDateLabel: string;
  shortDateLabel: string;
}

export const ProgramDateBadges = ({
  fullDateLabel,
  shortDateLabel,
}: ProgramDateBadgesProps) => {
  return (
    <div className="thead p-2 font-bold capitalize flex justify-between rounded-t-xl">
      <Badge className="text-md">{fullDateLabel}</Badge>
      <Badge className="text-md">{shortDateLabel}</Badge>
    </div>
  );
};
