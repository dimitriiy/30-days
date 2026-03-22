import {
  action,
  atom,
  computed,
  reatomBoolean,
  withAsync,
  withAsyncData,
  withCallHook,
  withComputed,
  withRollback,
  withTransaction,
  wrap,
} from "@reatom/core";
import type { TrainingItem } from "@/entities/workout/model/types";
import { httpGet, httpPut } from "@/lib/api";
import { toast } from "sonner";

export const isModalOpen = reatomBoolean(false, "isModalOpen");

export const selectedCard = atom<TrainingItem | null>(null);

export const programsResource = computed(async () => {
  const programsData = await wrap(httpGet<TrainingItem[]>("/api/run/programs"));
  return { programsData };
}, "programs.resource").extend(
  withAsyncData({
    initState: {
      programsData: [] as TrainingItem[],
    },
    status: true,
  }),
);

export const programsAtom = computed(
  () => programsResource.data().programsData,
  "programs.list",
);

export const doneListAtom = atom<number[]>([], "programs.doneList").extend(
  // Синхронизируем done-ids с серверным полем isDone.
  withComputed(() =>
    programsResource
      .data()
      .programsData.filter((item) => item.isDone)
      .map((item) => item.id),
  ),
  withRollback(),
);

export const programsStatus = programsResource.status;

export const toggleDone = action(async (data: TrainingItem, done: boolean) => {
  doneListAtom.set((prev) => {
    const exists = prev.includes(data.id);
    return exists ? prev.filter((id) => id !== data.id) : [...prev, data.id];
  });

  const response = await wrap(
    httpPut<{ data: TrainingItem[] }>("/api/run/programs", { id: data.id, done }),
  );

  if (response?.data) {
    doneListAtom.set(response.data.filter((item) => item.isDone).map((item) => item.id));
  }

  toast.success("Успех!", { position: "top-right" });
}, "programs.toggleDone").extend(withAsync(), withTransaction());

toggleDone.onReject.extend(
  withCallHook((error) => {
    toast.error("Не фортануло!", {
      description: (error.error as Error).message,
      position: "top-right",
    });
  }),
);
