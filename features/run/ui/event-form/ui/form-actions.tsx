"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

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
