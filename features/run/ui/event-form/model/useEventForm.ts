"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { RunEvent } from "@/entities/run-event/model/types";
import {
  closeEventForm,
  createEvent,
  deleteEvent,
  editingEvent,
  isEventFormOpen,
  updateEvent,
} from "@/features/run/model";
import { useAtom } from "@reatom/react";

interface FormState {
  date: string;
  name: string;
  location: string;
  pic: string;
}

function toInputDate(ddmmyyyy: string | undefined | null): string {
  if (!ddmmyyyy) return "";
  const [d, m, y] = ddmmyyyy.split(".");
  if (!d || !m || !y) return "";
  return `${y}-${m}-${d}`;
}

function toDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  if (!d || !m || !y) return "";
  return `${d}.${m}.${y}`;
}

function getInitialForm(event: RunEvent | null): FormState {
  return event
    ? {
        date: toInputDate(event.date),
        name: event.name,
        location: event.location,
        pic: event.pic ?? "",
      }
    : { date: "", name: "", location: "", pic: "" };
}

export function useEventForm() {
  const [open] = useAtom(isEventFormOpen);
  const [editingEventData] = useAtom(editingEvent);
  const isEdit = editingEventData !== null;

  const [form, setForm] = useState<FormState>(() => getInitialForm(editingEventData));

  useEffect(() => {
    if (open) {
      setForm(getInitialForm(editingEventData));
    }
  }, [open, editingEventData]);

  const handleChange = useCallback((field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const getPayload = useCallback(() => {
    return {
      date: toDisplayDate(form.date),
      name: form.name,
      location: form.location,
      pic: form.pic || undefined,
    };
  }, [form]);

  const handleSubmit = useCallback(() => {
    const payload = getPayload();

    if (isEdit && editingEventData) {
      updateEvent({ ...payload, id: editingEventData.id });
    } else {
      createEvent(payload);
    }
  }, [isEdit, editingEventData, getPayload]);

  const handleDelete = useCallback(() => {
    if (isEdit && editingEventData) {
      deleteEvent(editingEventData.id);
    }
  }, [isEdit, editingEventData]);

  const isValid = useMemo(
    () => Boolean(form.date && form.name && form.location),
    [form],
  );

  return {
    open,
    isEdit,
    form,
    isValid,
    handleChange,
    handleSubmit,
    handleDelete,
    close: closeEventForm,
  };
}
