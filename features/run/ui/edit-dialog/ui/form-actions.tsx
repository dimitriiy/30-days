"use client";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";

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
