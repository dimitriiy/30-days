"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

const FormField = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: FormFieldProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

interface EventFormFieldsProps {
  form: {
    date: string;
    name: string;
    location: string;
    pic: string;
  };
  onChange: (field: keyof EventFormFieldsProps["form"], value: string) => void;
}

export const EventFormFields = ({ form, onChange }: EventFormFieldsProps) => {
  return (
    <div className="flex flex-col gap-3 py-2">
      <FormField
        id="event-date"
        label="Дата"
        type="date"
        value={form.date}
        onChange={(value) => onChange("date", value)}
      />

      <FormField
        id="event-name"
        label="Название"
        placeholder="Morning Run"
        value={form.name}
        onChange={(value) => onChange("name", value)}
      />

      <FormField
        id="event-location"
        label="Локация"
        placeholder="Central Park"
        value={form.location}
        onChange={(value) => onChange("location", value)}
      />

      <FormField
        id="event-pic"
        label="Картинка (URL)"
        placeholder="https://..."
        value={form.pic}
        onChange={(value) => onChange("pic", value)}
      />
    </div>
  );
};
