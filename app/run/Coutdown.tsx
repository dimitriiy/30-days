import React from "react";
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";

const Coutdown = () => {
  return (
    <div className="m-3 bg-[#252525] p-2">
      <FlipClockCountdown
        to={new Date(2026, 4, 3).getTime()}
        showLabels={false}
        style={{
          "--fcc-digit-block-width": "26px",
          "--fcc-digit-block-height": "60px",
          "--fcc-digit-font-size": "25px",
        }}
      />
    </div>
  );
};

export default Coutdown;
