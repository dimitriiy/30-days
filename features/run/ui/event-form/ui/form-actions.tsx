"use client";

import { GlassButton as Button } from "@/components/ui/glass-button";
import { GlassDialogFooter as DialogFooter } from "@/components/ui/glass-dialog";

interface FormActionsProps {
  isEdit: boolean;
  isValid: boolean;
  onDelete: () => void;
  onSubmit: () => void;
}

export const FormActions = ({
  isEdit,
  isValid,
  onDelete,
  onSubmit,
}: FormActionsProps) => {
  return (
    <DialogFooter>
      {isEdit && (
        <Button variant="destructive" onClick={onDelete}>
          Удалить
        </Button>
      )}
      <Button disabled={!isValid} onClick={onSubmit}>
        {isEdit ? "Сохранить" : "Создать"}
      </Button>
    </DialogFooter>
  );
};
