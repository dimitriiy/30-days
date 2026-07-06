"use client";

import { GlassInput as Input } from "@/components/ui/glass-input";
import { GlassTextarea as Textarea } from "@/components/glass-textarea";

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
    <div className="flex w-full flex-col gap-6">
      <div className="flex w-full flex-col gap-1.5">
        <label htmlFor="program" className="text-sm font-bold text-white">
          План
        </label>
        <Textarea
          id="program"
          name="program"
          defaultValue={program}
          disabled={isPending}
        />
      </div>

      <div className="flex w-full flex-col gap-1.5">
        <label htmlFor="distance" className="text-sm font-bold text-white">
          Дистанция
        </label>
        <Input
          id="distance"
          name="distance"
          defaultValue={distance}
          disabled={isPending}
        />
      </div>
    </div>
  );
};
