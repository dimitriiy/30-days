"use client";

import { useCallback } from "react";
import { useAnimationControls } from "motion/react";

export function useProgramAnimation() {
  const controls = useAnimationControls();

  const animateCheck = useCallback(() => {
    controls.start({
      scale: 1.2,
      rotate: 360,
      transition: { duration: 0.5 },
    });
    setTimeout(() => {
      controls.start({ scale: 1, transition: { duration: 0.5 } });
    }, 600);
  }, [controls]);

  return {
    controls,
    animateCheck,
  };
}
