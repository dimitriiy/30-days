"use client";

import { computed, withAsyncData } from "@reatom/core";
import { useAtom } from "@reatom/react";
import { httpGet } from "@/lib/api";
import type { User } from "./types";
import { isError } from "util";

type UserResponse = { data: User };
type ErrorResponse = { error: string };

const userAtom = computed(async () => {
  return httpGet<UserResponse>(`/api/auth/me`);
}).extend(
  withAsyncData({
    status: true,
  }),
);

/**
 * Проверяет, что пользователь валидный:
 * - есть id (числовой, положительный)
 * - есть email (непустая строка)
 */
function isValidUser(user: unknown): user is User {
  if (!user || typeof user !== "object") return false;

  const u = user as Partial<User>;

  return (
    typeof u.id === "number" &&
    u.id > 0 &&
    typeof u.email === "string" &&
    u.email.length > 0
  );
}

export type UseUserResult = {
  user: User | null;
  isAuthorized: boolean;
  isLoading: boolean;
  error: string | null;
};

export function useUser(): UseUserResult {
  const [data] = useAtom(userAtom.data);
  const [{ isPending, isFulfilled, isRejected }] = useAtom(userAtom.status);

  // Проверяем наличие ошибки в ответе
  const errorMessage =
    data && "error" in data ? (data as ErrorResponse).error : null;

  // Извлекаем пользователя только если успешный ответ и данные валидны
  const userData = data && "data" in data ? data.data : null;
  const user = isValidUser(userData) ? userData : null;

  // Авторизован = запрос завершён успешно + пользователь валиден + нет ошибки
  const isAuthorized = isFulfilled && user !== null && !errorMessage;

  return {
    user,
    isAuthorized,
    isLoading: isPending,
    error:
      isRejected || errorMessage ? (errorMessage ?? "Ошибка загрузки") : null,
  };
}
