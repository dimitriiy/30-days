"use client";

import { GlassButton as Button } from "@/components/ui/glass-button";
import { GlassDialogClose as DialogClose, GlassDialogFooter as DialogFooter } from "@/components/ui/glass-dialog";

interface EditFormActionsProps {
  isPending: boolean;
}

export const EditFormActions = ({ isPending }: EditFormActionsProps) => {
  return (
    <DialogFooter className="pt-4">
      <DialogClose asChild>
        <Button type="button" variant="outline" disabled={isPending}>
          Отмена, пошел ебашить!
        </Button>
      </DialogClose>
      <Button type="submit">
        {isPending ? "Сохраняю..." : "Сохранить!"}
      </Button>
    </DialogFooter>
  );
};
