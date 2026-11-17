import { useCallback, useEffect, useRef } from "react";
import NoSleep from "nosleep.js";

export function createScreenAwake(makeNoSleep: () => Pick<NoSleep, "enable" | "disable">) {
  let noSleep: Pick<NoSleep, "enable" | "disable"> | null = null;
  let needed = false;

  const allowSleep = () => {
    needed = false;
    noSleep?.disable();
  };

  // NoSleep's video fallback must start inside the user's click handler.
  const preventSleep = () => {
    needed = true;
    try {
      noSleep ??= makeNoSleep();
      void noSleep.enable().then(() => {
        if (!needed) noSleep?.disable();
      }).catch(() => {});
    } catch {
      // The timer still works when screen wake is unavailable.
    }
  };

  return { allowSleep, preventSleep };
}

export function useScreenAwake() {
  const controller = useRef<ReturnType<typeof createScreenAwake> | null>(null);
  const allowSleep = useCallback(() => controller.current?.allowSleep(), []);
  const preventSleep = () => {
    controller.current ??= createScreenAwake(() => new NoSleep());
    controller.current.preventSleep();
  };

  useEffect(() => () => controller.current?.allowSleep(), []);
  return { allowSleep, preventSleep };
}
