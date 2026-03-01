"use client";

import { httpGet } from "@/lib/api";
import Link from "next/link";

import { computed, withAsyncData } from "@reatom/core";
import { reatomComponent } from "@reatom/react";

import { Spinner } from "@/components/ui/spinner";
import type { User } from "./api/auth/register/route";

const user = computed(async () => {
  return httpGet(`/api/auth/me`);
}).extend(withAsyncData());

const Home = reatomComponent(() => {
  const data = user.data() as { data: User };
  const ready = user.ready();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <img className="sprite-animation" src="/run.jpg" alt="Next.js logo" />
        <div className="flex flex-col  gap-6 text-center  sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 text-center flex justify-center">
            {ready ? (
              `Привяу ${data?.data?.username ?? ""}!`
            ) : (
              <Spinner className="size-12" />
            )}
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            <Link href="/run">
              Would you like some <b>побегать</b>?
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
});

export default Home;
