"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";

interface RegisterData {
  email: string;
  password: string;
  username: string;
}

interface RegisterResponse {
  message: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
}

interface RegisterError {
  error: string;
}

// Отдельная функция для регистрации
async function registerUser(data: RegisterData): Promise<RegisterResponse> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData: RegisterError = await response.json();
    throw new Error(errorData.error || "Ошибка регистрации");
  }

  return response.json();
}

export function Register({ toggle }: { toggle: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    setIsLoading(true);

    try {
      const result = await registerUser({ email, password, username });
      setSuccess(true);
      console.log("Регистрация успешна:", result.user);

      // Очищаем форму после успешной регистрации
      setEmail("");
      setPassword("");
      setUsername("");

      // Редирект или показываем сообщение о успехе
      // Например: window.location.href = '/login';
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-2xl font-bold text-foreground mb-2">
            Создать аккаунт
          </h2>
          <p className="text-center text-sm text-muted-foreground">
            Введите свои данные для регистрации
          </p>

          {success && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                ✓ Регистрация успешна! Вы можете войти в аккаунт.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                autoComplete="email"
                placeholder="вы@example.com"
                disabled={isLoading}
                className="mt-2"
              />
            </div>

            <div>
              <Label
                htmlFor="username"
                className="text-sm font-medium text-foreground"
              >
                Никнейм
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.trim())}
                placeholder="Ваш никнейм"
                disabled={isLoading}
                className="mt-2"
              />
            </div>

            <div>
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Пароль
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Минимум 6 символов"
                disabled={isLoading}
                className="mt-2"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  ⚠️ {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="mt-4 w-full py-2 font-medium"
              disabled={isLoading || !email || !password || !username}
            >
              {isLoading ? "Создание аккаунта..." : "Зарегистрироваться"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            Уже есть аккаунт?{" "}
            <a
              href="#"
              className="font-medium text-primary hover:text-primary/90 transition-colors"
              onClick={toggle}
            >
              Войти
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
