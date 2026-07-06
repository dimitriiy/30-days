"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface ProgramCheckboxProps {
  checked: boolean;
  onChange: (value: boolean) => void;
}

export const ProgramCheckbox = ({ checked, onChange }: ProgramCheckboxProps) => {
  return (
    <div className="done">
      <Checkbox
        className="border border-black cursor-pointer size-6"
        checked={checked}
        onCheckedChange={onChange}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};
