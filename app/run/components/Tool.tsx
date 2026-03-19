"use client";

import React, { type CSSProperties } from "react";
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";
import * as motion from "motion/react-client";
import { StatTable } from "./StatTable";
import type { ProgramItem } from "../page";

const Tool = ({
  topSlot,
  bottomSlot,
  programs,
  doneList,
}: {
  topSlot?: React.ReactNode;
  bottomSlot?: React.ReactNode;
  programs: ProgramItem[];
  doneList: number[];
}) => {
  const [show, setShow] = React.useState(false);

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setShow(true)}
      >
        <div className="m-3 bg-[#252525] p-2 rounded-2xl">
          {topSlot}
          <FlipClockCountdown
            to={new Date(2026, 4, 3).getTime()}
            showLabels={false}
            style={
              {
                "--fcc-digit-block-width": "26px",
                "--fcc-digit-block-height": "60px",
                "--fcc-digit-font-size": "25px",
              } as CSSProperties
            }
          />
          {bottomSlot}
        </div>
      </motion.div>

      {show && (
        <StatTable
          doneList={doneList}
          data={programs}
          close={() => setShow(false)}
        />
      )}
    </>
  );
};

export default Tool;
