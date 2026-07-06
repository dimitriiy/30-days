"use client";

import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditFormFieldsProps {
  program: string;
  distance: number;
  isPending: boolean;
}

export const EditFormFields = ({
  program,
  distance,
  isPending,
}: EditFormFieldsProps) => {
  return (
    <FieldGroup>
      <Field>
        <Label htmlFor="program">План</Label>
        <Textarea
          id="program"
          name="program"
          defaultValue={program}
          disabled={isPending}
        />
      </Field>

      <Field>
        <Label htmlFor="distance">Дистанция</Label>
        <Input
          id="distance"
          name="distance"
          defaultValue={distance}
          disabled={isPending}
        />
      </Field>
    </FieldGroup>
  );
};
