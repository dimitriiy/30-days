"use client";

import { useEffect, useMemo, useRef } from "react";
import { getTodayString } from "@/lib/dates";

export function useTodayProgramRef(isPending: boolean) {
  const today = useMemo(() => getTodayString(), []);
  const todayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isPending && todayRef.current) {
      todayRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [isPending]);

  return {
    today,
    todayRef,
  };
}
