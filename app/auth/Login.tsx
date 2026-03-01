import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function httpPost(url: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export function Login({ toggle }: { toggle: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await httpPost("/api/auth/login", { email, password });
      console.log("Успешный вход:", data);
    } catch (err) {
      setError((err as Error).message || "Не удалось войти");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-xl font-semibold text-foreground">
            Войти или создать аккаунт
          </h2>
          <form onSubmit={handleSubmit} className="mt-6">
            <Label htmlFor="email" className="font-medium text-foreground">
              Электронная почта
            </Label>
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

            <Label
              htmlFor="password"
              className="mt-4 block font-medium text-foreground"
            >
              Пароль
            </Label>
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

            <Button type="submit" className="mt-4 w-full" disabled={loading}>
              {loading ? "Вход..." : "Войти"}
            </Button>

            <p className="mt-6 text-sm text-muted-foreground text-center">
              Нет аккаунта?{" "}
              <a
                href="#"
                className="font-medium text-primary hover:text-primary/90 transition-colors"
                onClick={toggle}
              >
                Регистрация
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
