"use client";

import { GlassButton as Button } from "@/components/ui/glass-button";
import { GlassInput as Input } from "@/components/ui/glass-input";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../model/useAuth";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login({ email, password });
  };

  return (
    <div className="glass-bg flex items-center justify-center min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-xl font-semibold text-white">
            Войти или создать аккаунт
          </h2>
          <form onSubmit={handleSubmit} className="mt-6">
            <label htmlFor="email" className="font-medium text-white">
              Электронная почта
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              placeholder="ivan@company.com"
              className="mt-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label
              htmlFor="password"
              className="mt-4 block font-medium text-white"
            >
              Пароль
            </label>
            <Input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="Введите пароль"
              className="mt-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

            <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
              {isLoading ? "Вход..." : "Войти"}
            </Button>

            <p className="mt-6 text-sm text-white/60 text-center">
              Нет аккаунта?{" "}
              <Link
                href="/register"
                className="font-medium text-cyan-300 hover:text-cyan-300/90 transition-colors"
              >
                Регистрация
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
