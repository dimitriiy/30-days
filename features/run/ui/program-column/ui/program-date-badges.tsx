"use client";

import { GlassBadge as Badge } from "@/components/ui/glass-badge";
import clsx from "clsx";

interface ProgramDateBadgesProps {
  fullDateLabel: string;
  shortDateLabel: string;

  isRest: boolean;
}

export const ProgramDateBadges = ({
  fullDateLabel,
  shortDateLabel,
  isRest,
}: ProgramDateBadgesProps) => {
  return (
    <div className="thead p-2 font-bold capitalize flex justify-between rounded-t-xl">
      <Badge
        className={`${clsx("text-md", {
          "bg-[#00a22282]": !isRest,
        })}`}
      >
        {fullDateLabel}
      </Badge>
      <Badge className="text-md">{shortDateLabel}</Badge>
    </div>
  );
};
