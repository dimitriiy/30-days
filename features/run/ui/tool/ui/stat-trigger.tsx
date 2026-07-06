"use client";

import React from "react";

interface StatTriggerProps {
  children: React.ReactNode;
  onClick: () => void;
}

export const StatTrigger = ({ children, onClick }: StatTriggerProps) => {
  return <div onClick={onClick}>{children}</div>;
};
