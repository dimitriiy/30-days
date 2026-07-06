"use client";

interface DistanceBadgeProps {
  distance: number;
}

export const DistanceBadge = ({ distance }: DistanceBadgeProps) => {
  return (
    <div className="text-sm absolute bg-yellow-300 text-black rounded-full p-2 text-center flex items-center justify-center bottom-2 right-2">
      {distance}km
    </div>
  );
};
