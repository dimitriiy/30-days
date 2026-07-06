"use client";

import { Spinner } from "@/components/ui/spinner";

export const LoadingState = () => {
  return (
    <div className="flex justify-center py-6">
      <Spinner className="size-6" />
    </div>
  );
};
