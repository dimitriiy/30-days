"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Drawer } from "vaul";
import { Check, X } from "lucide-react";

import type { Workout } from "@/server/workouts/program";
import { WorkoutTimer } from "./workout-timer";

type Progress = { done: boolean; comment: string };

export function WorkoutSheet({ workout, progress, open, onOpenChange, onSave, saving, loadFailed }: {
  workout: Workout | null;
  progress: Progress;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (progress: Progress) => Promise<boolean>;
  saving: boolean;
  loadFailed: boolean;
}) {
  const [comment, setComment] = useState(progress.comment);
  const [saved, setSaved] = useState(false);
  const save = async (done: boolean) => {
    if (await onSave({ done, comment })) setSaved(true);
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground={false} handleOnly>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-[var(--workout-overlay)]" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[93dvh] max-w-2xl flex-col rounded-t-[32px] border border-[var(--workout-border)] bg-[var(--workout-sheet)] text-[var(--workout-text)] outline-none">
          <Drawer.Handle />
          <div className="flex items-start justify-between gap-3 px-6 pb-4 pt-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--workout-accent)]">Тренировка {workout?.id} / 30 · {workout?.format}</p>
              <Drawer.Title className="workout-selectable mt-2 text-2xl font-bold leading-tight">{workout?.title ?? "Тренировка"}</Drawer.Title>
              <Drawer.Description className="workout-selectable mt-2 text-sm text-[var(--workout-muted)]">{workout?.load} · {workout?.duration} мин WOD</Drawer.Description>
            </div>
            <Drawer.Close aria-label="Закрыть" className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--workout-chip)]"><X size={19} /></Drawer.Close>
          </div>
          {workout && <div className="overflow-y-auto overscroll-contain px-5 pb-[calc(24px+env(safe-area-inset-bottom))] sm:px-6">
            <WorkoutTimer key={workout.id} workout={workout} />
            <section className="mt-6">
              <h3 className="text-xl font-semibold">План тренировки</h3>
              <div className="workout-markdown mt-3 space-y-3 text-sm leading-relaxed text-[var(--workout-detail)]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{workout.description}</ReactMarkdown>
              </div>
            </section>
            <section className="mt-7">
              <label htmlFor="workout-comment" className="text-lg font-semibold">Мой комментарий <span className="text-sm font-normal text-[var(--workout-muted)]">· необязательно</span></label>
              <textarea id="workout-comment" value={comment} onChange={(event) => { setComment(event.target.value); setSaved(false); }} maxLength={2000} rows={3} placeholder="Вес гантелей, результат, самочувствие…" className="mt-3 w-full resize-y rounded-2xl border border-[var(--workout-border)] bg-[var(--workout-card)] p-4 text-base text-[var(--workout-text)] outline-none placeholder:text-[var(--workout-muted)] focus:border-[var(--workout-accent)]" />
              <p className="mt-1 text-xs text-[var(--workout-muted)]">Сохраняется только для вашего аккаунта</p>
              {saved && <p role="status" className="mt-2 text-sm text-[var(--workout-accent)]">Сохранено</p>}
            </section>
            {loadFailed && <p role="alert" className="mt-4 text-sm text-[var(--workout-error)]">Прогресс не загрузился. Обновите страницу перед сохранением.</p>}
            <div className="mt-5 flex gap-3">
              <button type="button" disabled={saving} onClick={() => void save(progress.done)} className="h-14 flex-1 rounded-2xl bg-[var(--workout-chip)] font-semibold disabled:opacity-50">Сохранить</button>
              <button type="button" disabled={saving} onClick={() => void save(!progress.done)} className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--workout-accent)] font-bold text-[var(--workout-on-accent)] disabled:opacity-50"><Check size={19} />{progress.done ? "Не выполнено" : "Выполнено"}</button>
            </div>
          </div>}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
