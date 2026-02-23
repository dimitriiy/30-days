import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { JSX, SVGProps } from "react";

export function Login({ toggle }: { toggle: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-xl font-semibold text-foreground">
            Log in or create account
          </h2>
          <form action="#" method="post" className="mt-6">
            <Label htmlFor="email" className="font-medium text-foreground">
              Email
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              placeholder="john@company.com"
              className="mt-2"
            />
            <Button type="submit" className="mt-4 w-full">
              Sign in
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
