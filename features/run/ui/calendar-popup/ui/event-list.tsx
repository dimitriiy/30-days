"use client";

import type { RunEvent } from "@/entities/run-event/model/types";

interface EventListProps {
  events: RunEvent[];
  onEdit: (event: RunEvent) => void;
}

export const EventList = ({ events, onEdit }: EventListProps) => {
  return (
    <div className="flex flex-col gap-2">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-center justify-between border rounded-md p-2 border-neutral-950 cursor-pointer"
          onClick={() => onEdit(event)}
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
  );
};
