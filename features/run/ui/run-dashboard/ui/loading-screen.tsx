"use client";

import { Spinner } from "@/components/ui/spinner";

export const LoadingScreen = () => {
  return (
    <div className="flex min-h-screen items-center justify-center glass-bg">
      <Spinner color="#fff" className="size-8" />
    </div>
  );
};
