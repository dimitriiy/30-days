import Link from "next/link";
import { Activity, ArrowRight, Dumbbell } from "lucide-react";
import "./workouts/workouts.css";

export default function Home() {
  return (
    <main className="workouts-theme flex min-h-dvh items-center justify-center bg-[var(--workout-bg)] px-5 py-10 text-[var(--workout-text)]">
      <div className="w-full max-w-lg">
        <div className="inline-flex items-center gap-3 font-bold"><span className="grid size-11 place-items-center rounded-2xl bg-[var(--workout-accent)] text-[var(--workout-on-accent)]"><Activity size={24} /></span>30 DAYS <span className="text-[var(--workout-accent)]">/</span> WOD</div>
        <div className="mt-14 grid size-20 place-items-center rounded-[24px] bg-[var(--workout-surface)] text-[var(--workout-accent)]"><Dumbbell size={38} /></div>
        <p className="mt-9 text-xs font-bold uppercase tracking-[0.22em] text-[var(--workout-accent)]">Тренируйся в своём темпе</p>
        <h1 className="mt-3 text-5xl font-extrabold leading-tight tracking-tight">Сильнее.<br />Каждый раз.</h1>
        <p className="mt-5 max-w-sm text-base leading-relaxed text-[var(--workout-muted)]">30 тренировок с гантелями дома. 20–22 минуты, понятный план и твой личный прогресс.</p>
        <Link href="/workouts" className="mt-9 flex h-15 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--workout-accent)] font-bold text-[var(--workout-on-accent)]">Открыть программу <ArrowRight size={20} /></Link>
      </div>
    </main>
  );
}
