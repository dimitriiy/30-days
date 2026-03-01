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
import type { ProgramItem } from "./page";
import { httpGet, httpPut } from "@/lib/api";
import { toast } from "sonner";

export const isModalOpen = reatomBoolean(false, "isModalOpen");

export const selectedCard = atom<ProgramItem | null>(null);

export const programsResource = computed(async () => {
  const [programsData, doneProgramsIds] = await Promise.all([
    wrap(httpGet<ProgramItem[]>("/api/run/programs")),
    wrap(httpGet<number[]>("/api/run/done")),
  ]);
  return { programsData, doneProgramsIds };
}, "programs.resource").extend(
  withAsyncData({
    initState: {
      programsData: [] as ProgramItem[],
      doneProgramsIds: [] as number[],
    },
    status: true,
  }),
);

export const programsAtom = computed(
  () => programsResource.data().programsData,
  "programs.list",
);

export const doneListAtom = atom<number[]>([], "programs.doneList").extend(
  // берёт значение из ресурса при загрузке, но не мешает прямым .set()
  withComputed(() => programsResource.data().doneProgramsIds),
  withRollback(),
);

export const programsStatus = programsResource.status;

export const toggleDone = action(async (data: ProgramItem, done: boolean) => {
  doneListAtom.set((prev) => {
    const exists = prev.includes(data.id);
    return exists ? prev.filter((id) => id !== data.id) : [...prev, data.id];
  });

  const response = await wrap(
    httpPut<{ data: number[] }>("/api/run/done", { id: data.id, done }),
  );

  if (response?.data) {
    doneListAtom.set(response.data);
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
