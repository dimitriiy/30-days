"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [fullScreen, setFullScreen] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string; error: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastSentComment = useRef(progress.comment);

  const showToast = useCallback((message: string, error = false) => {
    setToast({ id: Date.now(), message, error });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const saveComment = useCallback((value: string) => {
    if (loadFailed || value === lastSentComment.current) return;
    lastSentComment.current = value;
    void onSave({ done: progress.done, comment: value }).then((ok) => {
      if (!ok) {
        if (lastSentComment.current === value) lastSentComment.current = progress.comment;
        showToast("Не удалось сохранить. Попробуйте ещё раз.", true);
      }
    });
  }, [loadFailed, onSave, progress.done, progress.comment, showToast]);

  useEffect(() => {
    if (comment === lastSentComment.current || loadFailed) return;
    const timer = setTimeout(() => saveComment(comment), 700);
    return () => clearTimeout(timer);
  }, [comment, loadFailed, saveComment]);

  const toggleDone = () => {
    const wasDone = progress.done;
    lastSentComment.current = comment;
    void onSave({ done: !wasDone, comment }).then((ok) => {
      if (!ok) {
        lastSentComment.current = progress.comment;
        showToast("Не удалось сохранить. Попробуйте ещё раз.", true);
      } else if (!wasDone) showToast("Тренировка выполнена");
    });
  };

  return (
    <Drawer.Root open={open} onOpenChange={(next) => { if (!next) saveComment(comment); onOpenChange(next); }} shouldScaleBackground={false} handleOnly dismissible={!fullScreen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-[var(--workout-overlay)]" />
        <Drawer.Content className={`fixed z-50 mx-auto flex flex-col border border-[var(--workout-border)] bg-[var(--workout-sheet)] text-[var(--workout-text)] outline-none ${fullScreen ? "inset-0 h-dvh max-w-none" : "inset-x-0 bottom-0 max-h-[93dvh] max-w-2xl rounded-t-[32px]"}`}>
          {!fullScreen && <Drawer.Handle />}
          <div className={fullScreen ? "sr-only" : "flex items-start justify-between gap-3 px-6 pb-4 pt-5"}>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--workout-accent)]">Тренировка {workout?.id} / 30 · {workout?.format}</p>
              <Drawer.Title className="workout-selectable mt-2 text-2xl font-bold leading-tight">{workout?.title ?? "Тренировка"}</Drawer.Title>
              <Drawer.Description className="workout-selectable mt-2 text-sm text-[var(--workout-muted)]">{workout?.load} · {workout?.duration} мин WOD</Drawer.Description>
            </div>
            {!fullScreen && <Drawer.Close aria-label="Закрыть" className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--workout-chip)]"><X size={19} /></Drawer.Close>}
          </div>
          {workout && <div className={fullScreen ? "flex min-h-0 flex-1 flex-col overflow-hidden" : "overflow-y-auto overscroll-contain px-5 pb-[calc(24px+env(safe-area-inset-bottom))] sm:px-6"}>
            <WorkoutTimer key={workout.id} workout={workout} fullScreen={fullScreen} onFullScreenChange={setFullScreen} />
            {!fullScreen && <><section className="mt-6">
              <h3 className="text-xl font-semibold">План тренировки</h3>
              <div className="workout-markdown mt-3 space-y-3 text-sm leading-relaxed text-[var(--workout-detail)]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{[workout.intro, ...workout.parts.map((part) => part.content), workout.notes].filter(Boolean).join("\n\n")}</ReactMarkdown>
              </div>
            </section>
            <section className="mt-7">
              <label htmlFor="workout-comment" className="text-lg font-semibold">Мой комментарий <span className="text-sm font-normal text-[var(--workout-muted)]">· необязательно</span></label>
              <textarea id="workout-comment" value={comment} onChange={(event) => setComment(event.target.value)} onBlur={() => saveComment(comment)} maxLength={2000} rows={3} placeholder="Вес гантелей, результат, самочувствие…" className="mt-3 w-full resize-y rounded-2xl border border-[var(--workout-border)] bg-[var(--workout-card)] p-4 text-base text-[var(--workout-text)] outline-none placeholder:text-[var(--workout-muted)] focus:border-[var(--workout-accent)]" />
              <p className="mt-1 text-xs text-[var(--workout-muted)]">Сохраняется только для вашего аккаунта</p>
            </section>
            {loadFailed && <p role="alert" className="mt-4 text-sm text-[var(--workout-error)]">Прогресс не загрузился. Обновите страницу перед сохранением.</p>}
            <div className="mt-5 flex gap-3">
              {progress.done ? (
                <button type="button" disabled={saving} onClick={toggleDone} className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--workout-danger)] font-bold text-[var(--workout-on-danger)] transition-transform active:scale-[0.98] disabled:opacity-50"><X size={19} />Отменить</button>
              ) : (
                <button type="button" disabled={saving} onClick={toggleDone} className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--workout-accent)] font-bold text-[var(--workout-on-accent)] transition-transform active:scale-[0.98] disabled:opacity-50"><Check size={19} />Выполнено</button>
              )}
            </div></>}
          </div>}
        </Drawer.Content>
        {toast && <div key={toast.id} role={toast.error ? "alert" : "status"} className={`workout-toast flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold shadow-xl ${toast.error ? "bg-[var(--workout-danger)] text-[var(--workout-on-danger)]" : "bg-[var(--workout-accent)] text-[var(--workout-on-accent)]"}`}>{toast.error ? <X size={16} /> : <Check size={16} />}{toast.message}</div>}
      </Drawer.Portal>
    </Drawer.Root>
  );
}
