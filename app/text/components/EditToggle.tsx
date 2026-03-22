"use client";

import { Pencil, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditToggleProps {
  isEditing: boolean;
  onToggle: () => void;
}

export function EditToggle({ isEditing, onToggle }: EditToggleProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
      className="fixed bottom-5 right-5 z-50 size-12 rounded-full shadow-lg"
      aria-label={isEditing ? "Режим чтения" : "Режим редактирования"}
    >
      {isEditing ? (
        <Eye className="size-5" />
      ) : (
        <Pencil className="size-5" />
      )}
    </Button>
  );
}
