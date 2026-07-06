"use client";

export const ChartGradients = () => {
  return (
    <defs>
      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#8884d8" stopOpacity={1} />
        <stop offset="100%" stopColor="#000" stopOpacity={0} />
      </linearGradient>
      <linearGradient
        id="colorPv"
        x1="-2.5328"
        y1="6.14922"
        x2="244.967"
        y2="183.149"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#ADE8F4" stopOpacity="0.08" />
        <stop offset="0.0001" stopColor="#00A3FF" />
        <stop offset="0.635417" stopColor="#FA00FF" stopOpacity="0.85" />
        <stop offset="1" stopColor="#FF00B8" />
      </linearGradient>
    </defs>
  );
};
