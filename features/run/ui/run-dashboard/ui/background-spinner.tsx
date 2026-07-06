"use client";

import { Spinner } from "@/components/ui/spinner";

export const BackgroundSpinner = () => {
  return (
    <div className="fixed right-5 bottom-5 bg-black p-3 rounded-lg opacity-80">
      <Spinner color="#fff" className="size-8" />
    </div>
  );
};
