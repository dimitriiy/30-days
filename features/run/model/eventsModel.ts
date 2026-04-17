import {
  action,
  atom,
  computed,
  reatomBoolean,
  withAsync,
  withAsyncData,
  withCallHook,
  withTransaction,
  wrap,
} from "@reatom/core";
import type { RunEvent } from "@/entities/run-event/model/types";
import { httpDelete, httpGet, httpPost, httpPut } from "@/lib/api";
import { toast } from "sonner";

export const isEventFormOpen = reatomBoolean(false, "events.isFormOpen");

export const editingEvent = atom<RunEvent | null>(null, "events.editing");

export const openCreateForm = action(() => {
  editingEvent.set(null);
  isEventFormOpen.set(true);
}, "events.openCreateForm");

export const openEditForm = action((event: RunEvent) => {
  editingEvent.set(event);
  isEventFormOpen.set(true);
}, "events.openEditForm");

export const closeEventForm = action(() => {
  editingEvent.set(null);
  isEventFormOpen.set(false);
}, "events.closeForm");

export const eventsResource = computed(async () => {
  const data = await wrap(httpGet<RunEvent[]>("/api/run/events"));
  return { eventsData: data };
}, "events.resource").extend(
  withAsyncData({
    initState: {
      eventsData: [] as RunEvent[],
    },
    status: true,
  }),
);

export const eventsAtom = computed(
  () => eventsResource.data().eventsData,
  "events.list",
);

export const eventsStatus = eventsResource.status;

export const createEvent = action(
  async (input: Omit<RunEvent, "id">) => {
    await wrap(
      httpPost<{ success: boolean; data: RunEvent }>("/api/run/events", input),
    );
    eventsResource.retry();
    closeEventForm();
    toast.success("Событие создано!", { position: "top-right" });
  },
  "events.create",
).extend(withAsync(), withTransaction());

createEvent.onReject.extend(
  withCallHook((error) => {
    toast.error("Ошибка создания!", {
      description: (error.error as Error).message,
      position: "top-right",
    });
  }),
);

export const updateEvent = action(
  async (input: RunEvent) => {
    await wrap(
      httpPut<{ success: boolean; data: RunEvent[] }>("/api/run/events", input),
    );
    eventsResource.retry();
    closeEventForm();
    toast.success("Событие обновлено!", { position: "top-right" });
  },
  "events.update",
).extend(withAsync(), withTransaction());

updateEvent.onReject.extend(
  withCallHook((error) => {
    toast.error("Ошибка обновления!", {
      description: (error.error as Error).message,
      position: "top-right",
    });
  }),
);

export const deleteEvent = action(
  async (id: number) => {
    await wrap(
      httpDelete<{ success: boolean; data: RunEvent[] }>("/api/run/events", {
        id,
      }),
    );
    eventsResource.retry();
    closeEventForm();
    toast.success("Событие удалено!", { position: "top-right" });
  },
  "events.delete",
).extend(withAsync(), withTransaction());

deleteEvent.onReject.extend(
  withCallHook((error) => {
    toast.error("Ошибка удаления!", {
      description: (error.error as Error).message,
      position: "top-right",
    });
  }),
);
