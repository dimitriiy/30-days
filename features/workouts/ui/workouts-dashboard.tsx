"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Activity, ArrowRight, Check, ChevronRight, Clock3, Infinity as InfinityIcon, Layers3, ListChecks, LogOut, Repeat2, Timer } from "lucide-react";

import { httpGet, httpPut } from "@/lib/api";
import { useAuth } from "@/features/auth/model/useAuth";
import type { Workout, WorkoutFormat } from "@/server/workouts/program";
const WorkoutSheet = dynamic(() => import("./workout-sheet").then((module) => module.WorkoutSheet));

type Progress = { done: boolean; comment: string };
type ProgressMap = Record<string, Progress>;

const formats: Record<WorkoutFormat, { label: string; icon: typeof Timer }> = {
  EMOM: { label: "Каждую минуту", icon: Repeat2 },
  E2MOM: { label: "Каждые 2 минуты", icon: Clock3 },
  E3MOM: { label: "Каждые 3 минуты", icon: Clock3 },
  AMRAP: { label: "Максимум раундов", icon: InfinityIcon },
  "FOR TIME": { label: "На время", icon: Timer },
  TABATA: { label: "20 / 10 секунд", icon: Activity },
  INTERVALS: { label: "Интервалы", icon: Activity },
  MIXED: { label: "Несколько блоков", icon: Layers3 },
};
const empty: Progress = { done: false, comment: "" };
const weeks = ["База", "Объём", "Интенсивность", "Пик и тест"];

export function WorkoutsDashboard({ workouts }: { workouts: Workout[] }) {
  const { logout } = useAuth();
  const [progress, setProgress] = useState<ProgressMap>({});
  const [selected, setSelected] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    httpGet<ProgressMap>("/api/workouts/progress")
      .then(setProgress)
      .catch(() => { setLoadFailed(true); setError("Не удалось загрузить прогресс. Обновите страницу."); })
      .finally(() => setLoading(false));
  }, []);

  const save = async (value: Progress): Promise<boolean> => {
    if (!selected || saving || loadFailed) return false;
    const id = selected.id;
    setSaving(true);
    setError("");
    try {
      const saved = await httpPut<Progress>("/api/workouts/progress", { id, ...value });
      setProgress((previous) => ({ ...previous, [id]: saved }));
      return true;
    } catch {
      setError("Не удалось сохранить. Попробуйте ещё раз.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const done = workouts.filter((workout) => progress[workout.id]?.done).length;
  const next = workouts.find((workout) => !progress[workout.id]?.done) ?? workouts[0];

  return (
    <div className="workouts-theme min-h-dvh bg-[var(--workout-bg)] font-sans text-[var(--workout-text)]">
      <main className="mx-auto max-w-3xl px-5 pb-28 pt-[max(28px,env(safe-area-inset-top))] sm:px-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[var(--workout-accent)] text-[var(--workout-on-accent)]"><Activity size={24} strokeWidth={2.5} /></span><span className="text-base font-bold tracking-wide">30 DAYS <span className="text-[var(--workout-accent)]">/</span> WOD</span></div>
          <Link href="/" aria-label="На главную" className="grid size-11 place-items-center rounded-full bg-[var(--workout-surface)] text-[var(--workout-text)]"><ArrowRight size={19} className="rotate-180" /></Link>
        </header>

        <section className="mt-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--workout-accent)]">Твоя программа</p>
          <h1 className="mt-3 text-[clamp(2.3rem,8vw,4rem)] font-extrabold leading-[1.08] tracking-tight">Сильнее с каждым<br /><span className="text-[var(--workout-accent)]">тренировочным днём.</span></h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--workout-muted)]">30 тренировок с гантелями дома. Выбирай комплекс в своём темпе — даты и расписание не нужны.</p>
        </section>

        <section className="mt-8 flex items-center gap-5 rounded-[28px] border border-[var(--workout-border)] bg-[var(--workout-surface)] p-5" aria-label="Прогресс программы">
          <div className="grid size-20 shrink-0 place-items-center rounded-full p-2" style={{ background: `conic-gradient(var(--workout-accent) ${done / 30 * 100}%, var(--workout-ring) 0)` }}><div className="grid size-full place-items-center rounded-full bg-[var(--workout-surface)] text-xl font-bold">{done}<span className="sr-only"> из 30 выполнено</span></div></div>
          <div className="min-w-0"><p className="text-lg font-bold">Твой прогресс</p><p className="mt-1 text-sm text-[var(--workout-muted)]">{loading ? "Загружаем…" : `${done} из 30 тренировок выполнено`}</p><p className="mt-2 text-xs text-[var(--workout-accent)]">Каждая тренировка — шаг вперёд</p></div>
        </section>

        {error && <p role="alert" className="mt-4 rounded-xl bg-[var(--workout-error-bg)] p-3 text-sm text-[var(--workout-error)]">{error}</p>}

        <button type="button" onClick={() => setSelected(next)} className="mt-5 flex w-full items-center justify-between gap-3 rounded-[24px] bg-[var(--workout-accent)] p-5 text-left text-[var(--workout-on-accent)] transition-transform active:scale-[0.98]">
          <div><p className="text-xs font-bold uppercase tracking-widest">{done === 30 ? "Повторить программу" : "Следующая тренировка"}</p><p className="mt-2 line-clamp-2 text-xl font-bold">{next.title}</p><p className="mt-1 text-sm opacity-75">№ {next.id} · {next.duration} мин · {next.format}</p></div><ChevronRight size={24} className="shrink-0" />
        </button>

        <div className="mt-10 flex items-center justify-between"><h2 className="text-2xl font-bold">Все тренировки</h2><span className="text-sm text-[var(--workout-muted)]">30 комплексов</span></div>
        {weeks.map((week, index) => (
          <section key={week} className="mt-7" aria-label={`Блок ${index + 1}: ${week}`}>
            <div className="mb-4 flex items-center gap-3"><span className="text-xs font-bold uppercase tracking-widest text-[var(--workout-accent)]">Блок 0{index + 1}</span><span className="h-px flex-1 bg-[var(--workout-border)]" /><span className="text-xs text-[var(--workout-muted)]">{week}</span></div>
            <div className="space-y-3">
              {workouts.slice(index * 7, index === 3 ? 30 : (index + 1) * 7).map((workout) => {
                const { icon: Icon, label } = formats[workout.format];
                const isDone = progress[workout.id]?.done;
                return <button key={workout.id} type="button" onClick={() => setSelected(workout)} className="flex w-full items-center gap-4 rounded-[22px] border border-[var(--workout-border)] bg-[var(--workout-surface)] p-4 text-left transition-colors hover:border-[var(--workout-accent)] active:bg-[var(--workout-hover)]">
                  <span className={`grid size-12 shrink-0 place-items-center rounded-2xl font-bold ${isDone ? "bg-[var(--workout-accent)] text-[var(--workout-on-accent)]" : "bg-[var(--workout-chip)] text-[var(--workout-accent)]"}`}>{isDone ? <Check size={23} /> : String(workout.id).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{workout.title}</span><span className="mt-1 flex items-center gap-1.5 text-xs text-[var(--workout-muted)]"><Icon size={14} />{workout.format} · {label} · {workout.duration} мин</span></span><ChevronRight size={19} className="shrink-0 text-[var(--workout-muted)]" />
                </button>;
              })}
            </div>
          </section>
        ))}
        <p className="mt-8 flex items-center justify-center gap-2 text-xs text-[var(--workout-muted)]"><ListChecks size={16} />Разминка 4 мин и заминка 1–2 мин — отдельно от WOD</p>
      </main>
      <nav aria-label="Навигация" className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--workout-border)] bg-[var(--workout-nav)] px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl"><div className="mx-auto flex max-w-3xl items-center justify-between"><span className="flex items-center gap-2 text-sm font-bold text-[var(--workout-accent)]"><Activity size={20} />Тренировки</span><span className="text-xs text-[var(--workout-muted)]">{done} / 30</span><button type="button" onClick={() => void logout()} aria-label="Выйти из аккаунта" className="grid size-11 place-items-center rounded-full bg-[var(--workout-surface)] text-[var(--workout-text)]"><LogOut size={18} /></button></div></nav>
      {selected && !loading && <WorkoutSheet key={selected.id} workout={selected} progress={progress[selected.id] ?? empty} open onOpenChange={(open) => { if (!open) setSelected(null); }} onSave={save} saving={saving || loadFailed} loadFailed={loadFailed} />}
    </div>
  );
}
