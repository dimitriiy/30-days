"use client";

import React from "react";
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";
import type { CSSProperties } from "react";

const FLIP_CLOCK_STYLES = {
  "--fcc-digit-block-width": "26px",
  "--fcc-digit-block-height": "60px",
  "--fcc-digit-font-size": "25px",
} as CSSProperties;

interface FlipTimerProps {
  targetDate: Date;
}

export const FlipTimer = ({ targetDate }: FlipTimerProps) => {
  return (
    <FlipClockCountdown
      to={targetDate.getTime()}
      showLabels={false}
      style={FLIP_CLOCK_STYLES}
    />
  );
};
