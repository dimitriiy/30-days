"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, ArrowRight, Dumbbell } from "lucide-react";

import { useAuth } from "../model/useAuth";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useAuth(undefined, { redirectAfterLogin: "/workouts" });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();
    await login({ email, password });
  };

  return (
    <main className="workouts-theme flex min-h-dvh items-center justify-center bg-[var(--workout-bg)] px-5 py-10 text-[var(--workout-text)]">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-3 text-base font-bold"><span className="grid size-11 place-items-center rounded-2xl bg-[var(--workout-accent)] text-[var(--workout-on-accent)]"><Activity size={24} strokeWidth={2.5} /></span>30 DAYS <span className="text-[var(--workout-accent)]">/</span> WOD</Link>
        <div className="mt-12 grid size-16 place-items-center rounded-[20px] bg-[var(--workout-accent)] text-[var(--workout-on-accent)]"><Dumbbell size={30} /></div>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-[var(--workout-accent)]">Продолжай движение</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">С возвращением.</h1>
        <p className="mt-3 text-sm text-[var(--workout-muted)]">Войди и продолжи свою программу из 30 тренировок.</p>
        <form onSubmit={handleSubmit} className="mt-9 space-y-5 rounded-[28px] border border-[var(--workout-border)] bg-[var(--workout-surface)] p-6">
          <div><label htmlFor="email" className="text-sm font-semibold">Электронная почта</label><input type="email" id="email" name="email" autoComplete="email" placeholder="you@example.com" className="mt-2 h-14 w-full rounded-2xl border border-[var(--workout-border)] bg-[var(--workout-card)] px-4 text-base outline-none placeholder:text-[var(--workout-muted)] focus:border-[var(--workout-accent)]" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          <div><label htmlFor="password" className="text-sm font-semibold">Пароль</label><input type="password" id="password" name="password" autoComplete="current-password" placeholder="Введите пароль" className="mt-2 h-14 w-full rounded-2xl border border-[var(--workout-border)] bg-[var(--workout-card)] px-4 text-base outline-none placeholder:text-[var(--workout-muted)] focus:border-[var(--workout-accent)]" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
          {error && <p role="alert" className="rounded-xl bg-[var(--workout-error-bg)] p-3 text-sm text-[var(--workout-error)]">{error}</p>}
          <button type="submit" disabled={isLoading} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--workout-accent)] font-bold text-[var(--workout-on-accent)] disabled:opacity-50">{isLoading ? "Входим…" : "Войти"}<ArrowRight size={19} /></button>
        </form>
        <p className="mt-7 text-center text-sm text-[var(--workout-muted)]">Нет аккаунта? <Link href="/register" className="font-semibold text-[var(--workout-accent)]">Зарегистрироваться</Link></p>
      </div>
    </main>
  );
}
