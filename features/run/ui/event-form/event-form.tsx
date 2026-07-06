"use client";

import {
  GlassDialog as Dialog,
  GlassDialogContent as DialogContent,
  GlassDialogHeader as DialogHeader,
  GlassDialogTitle as DialogTitle,
} from "@/components/ui/glass-dialog";
import { EventFormFields } from "./ui/form-fields";
import { FormActions } from "./ui/form-actions";
import { useEventForm } from "./model/useEventForm";

export const EventFormPopup = () => {
  const { open, isEdit, form, isValid, handleChange, handleSubmit, handleDelete, close } =
    useEventForm();

  return (
    <Dialog open={open} onOpenChange={() => close()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Редактировать событие" : "Новое событие"}
          </DialogTitle>
        </DialogHeader>

        <EventFormFields form={form} onChange={handleChange} />

        <FormActions
          isEdit={isEdit}
          isValid={isValid}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};
