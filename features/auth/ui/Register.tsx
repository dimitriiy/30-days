"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, ArrowRight, Dumbbell } from "lucide-react";

type RegisterData = { email: string; password: string; username: string };

async function registerUser(data: RegisterData): Promise<void> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || errorData.error || "Ошибка регистрации");
  }
}

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await registerUser({ email, password, username });
      setSuccess(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Неизвестная ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="workouts-theme flex min-h-dvh items-center justify-center bg-[var(--workout-bg)] px-5 py-10 text-[var(--workout-text)]">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-3 text-base font-bold"><span className="grid size-11 place-items-center rounded-2xl bg-[var(--workout-accent)] text-[var(--workout-on-accent)]"><Activity size={24} strokeWidth={2.5} /></span>30 DAYS <span className="text-[var(--workout-accent)]">/</span> WOD</Link>
        <div className="mt-10 grid size-16 place-items-center rounded-[20px] bg-[var(--workout-accent)] text-[var(--workout-on-accent)]"><Dumbbell size={30} /></div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-[var(--workout-accent)]">Начни движение</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Твой первый шаг.</h1>
        <p className="mt-3 text-sm text-[var(--workout-muted)]">Создай аккаунт и сохраняй свой прогресс.</p>
        {success ? <div role="status" className="mt-8 rounded-[28px] border border-[var(--workout-accent-border)] bg-[var(--workout-surface)] p-6"><p className="font-semibold">Аккаунт создан!</p><Link href="/login" className="mt-4 inline-flex items-center gap-2 text-[var(--workout-accent)]">Войти <ArrowRight size={18} /></Link></div> : <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-[28px] border border-[var(--workout-border)] bg-[var(--workout-surface)] p-6">
          <div><label htmlFor="email" className="text-sm font-semibold">Электронная почта</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value.trim())} autoComplete="email" placeholder="you@example.com" required disabled={isLoading} className="mt-2 h-14 w-full rounded-2xl border border-[var(--workout-border)] bg-[var(--workout-card)] px-4 text-base outline-none placeholder:text-[var(--workout-muted)] focus:border-[var(--workout-accent)]" /></div>
          <div><label htmlFor="username" className="text-sm font-semibold">Имя</label><input id="username" type="text" value={username} onChange={(event) => setUsername(event.target.value.trim())} placeholder="Как к вам обращаться?" required disabled={isLoading} className="mt-2 h-14 w-full rounded-2xl border border-[var(--workout-border)] bg-[var(--workout-card)] px-4 text-base outline-none placeholder:text-[var(--workout-muted)] focus:border-[var(--workout-accent)]" /></div>
          <div><label htmlFor="password" className="text-sm font-semibold">Пароль</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" placeholder="Минимум 6 символов" minLength={6} required disabled={isLoading} className="mt-2 h-14 w-full rounded-2xl border border-[var(--workout-border)] bg-[var(--workout-card)] px-4 text-base outline-none placeholder:text-[var(--workout-muted)] focus:border-[var(--workout-accent)]" /></div>
          {error && <p role="alert" className="rounded-xl bg-[var(--workout-error-bg)] p-3 text-sm text-[var(--workout-error)]">{error}</p>}
          <button type="submit" disabled={isLoading} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--workout-accent)] font-bold text-[var(--workout-on-accent)] disabled:opacity-50">{isLoading ? "Создаём…" : "Зарегистрироваться"}<ArrowRight size={19} /></button>
        </form>}
        <p className="mt-7 text-center text-sm text-[var(--workout-muted)]">Уже есть аккаунт? <Link href="/login" className="font-semibold text-[var(--workout-accent)]">Войти</Link></p>
      </div>
    </main>
  );
}
