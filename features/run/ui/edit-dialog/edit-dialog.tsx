"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TrainingItem } from "@/entities/workout/model/types";
import { useEditForm } from "./model/useEditForm";
import { EditFormFields } from "./ui/form-fields";
import { EditFormActions } from "./ui/form-actions";

interface EditDialogProps {
  data: TrainingItem;
  close: () => void;
  onSaved?: (updated: TrainingItem) => void;
}

export function EditDialog({ data, close, onSaved }: EditDialogProps) {
  const { error, isPending, handleSubmit } = useEditForm({
    data,
    onSaved,
    close,
  });

  return (
    <Dialog open={true} onOpenChange={close}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Редактирование тренировки</DialogTitle>
            <DialogDescription>
              Надо ебашить, а не редактировать!
            </DialogDescription>
          </DialogHeader>

          <EditFormFields
            program={data.program}
            distance={data.distance}
            isPending={isPending}
          />

          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

          <EditFormActions isPending={isPending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
