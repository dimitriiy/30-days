"use client";

import { useMemo } from "react";

export function useDoneProgramLookup(doneList: number[]) {
  const doneSet = useMemo(() => new Set(doneList), [doneList]);

  return (id: number) => doneSet.has(id);
}
