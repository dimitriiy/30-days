import React, { type CSSProperties } from "react";
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";
import * as motion from "motion/react-client";

const Coutdown = ({
  topSlot,
  bottomSlot,
}: {
  topSlot?: React.ReactNode;
  bottomSlot?: React.ReactNode;
}) => {
  return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
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
  );
};

export default Coutdown;
