"use client";

import {
  GlassDialogContent as DialogContent,
  GlassDialog as Dialog,
  GlassDialogHeader as DialogHeader,
} from "@/components/ui/glass-dialog";
import React from "react";

interface StatDialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const StatDialog = ({ open, onClose, children }: StatDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogHeader />
      <DialogContent className={"lg:max-w-screen-lg max-h-screen"}>
        <div className="scrollbar-shadcn px-1 w-full h-full max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
