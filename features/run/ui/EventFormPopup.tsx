"use client";

import { useState } from "react";
import { reatomComponent } from "@reatom/react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RunEvent } from "@/entities/run-event/model/types";
import {
  closeEventForm,
  createEvent,
  deleteEvent,
  editingEvent,
  isEventFormOpen,
  updateEvent,
} from "../model/eventsModel";

interface FormState {
  date: string;
  name: string;
  location: string;
  pic: string;
}

function toInputDate(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split(".");
  if (!d || !m || !y) return "";
  return `${y}-${m}-${d}`;
}

function toDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  if (!d || !m || !y) return "";
  return `${d}.${m}.${y}`;
}

export const EventFormPopup = reatomComponent(() => {
  const open = isEventFormOpen();
  const event = editingEvent();
  const isEdit = event !== null;

  const [form, setForm] = useState<FormState>(() =>
    event
      ? {
          date: toInputDate(event.date),
          name: event.name,
          location: event.location,
          pic: event.pic ?? "",
        }
      : { date: "", name: "", location: "", pic: "" },
  );

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const payload = {
      date: toDisplayDate(form.date),
      name: form.name,
      location: form.location,
      pic: form.pic || undefined,
    };

    if (isEdit) {
      updateEvent({ ...payload, id: event.id });
    } else {
      createEvent(payload);
    }
  };

  const handleDelete = () => {
    if (isEdit) {
      deleteEvent(event.id);
    }
  };

  const isValid = form.date && form.name && form.location;

  return (
    <Dialog open={open} onOpenChange={() => closeEventForm()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Редактировать событие" : "Новое событие"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-date">Дата</Label>
            <Input
              id="event-date"
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-name">Название</Label>
            <Input
              id="event-name"
              placeholder="Morning Run"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-location">Локация</Label>
            <Input
              id="event-location"
              placeholder="Central Park"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-pic">Картинка (URL)</Label>
            <Input
              id="event-pic"
              placeholder="https://..."
              value={form.pic}
              onChange={(e) => handleChange("pic", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          {isEdit && (
            <Button variant="destructive" onClick={handleDelete}>
              Удалить
            </Button>
          )}
          <Button disabled={!isValid} onClick={handleSubmit}>
            {isEdit ? "Сохранить" : "Создать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
