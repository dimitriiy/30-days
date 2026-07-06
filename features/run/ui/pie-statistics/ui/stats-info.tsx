"use client";

interface StatsInfoProps {
  current: string;
  all: string;
  skipped: number;
}

export const StatsInfo = ({ current, all, skipped }: StatsInfoProps) => {
  return (
    <div>
      <div className="text-base font-medium text-foreground">
        {current} km / {all} km
      </div>
      <dt className="text-sm text-muted-foreground">Пройдено</dt>
      <div className="text-xs text-muted-foreground mt-1">
        Пропущено: {skipped.toFixed()} km
      </div>
    </div>
  );
};
