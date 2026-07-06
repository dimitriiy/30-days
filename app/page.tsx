"use client";

import Link from "next/link";

import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/entities/user/model/useUser";

export default function Home() {
  const { user, isLoading, isAuthorized } = useUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col justify-center  items-center py-32 px-16 bg-white dark:bg-black ">
        <img className="sprite-animation" src="/run.jpg" alt="Next.js logo" />
        <div className="flex flex-col  gap-6 text-center  sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 text-center flex justify-center">
            {isLoading ? (
              <Spinner className="size-12" />
            ) : isAuthorized ? (
              `Привяу ${user?.username ?? ""}!`
            ) : (
              "Ошибочка вышла("
            )}
          </h1>

          {isAuthorized && (
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              <Link href="/run">
                Would you like some <b>побегать</b>?
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
