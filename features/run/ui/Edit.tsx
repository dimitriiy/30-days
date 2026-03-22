"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TrainingItem } from "@/entities/workout/model/types";
import { httpPut } from "@/lib/api";

interface Props {
  data: TrainingItem;
  close: () => void;

  onSaved?: (updated: TrainingItem) => void;
}

export function EditDialog({ data, close, onSaved }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const program = String(formData.get("program") ?? "").trim();
    const distance = +String(formData.get("distance") ?? "").trim();

    startTransition(async () => {
      try {
        await httpPut("/api/run/programs", {
          ...data,
          program,
          distance,
        });

        const updated: TrainingItem = {
          ...data,
          program,
          distance,
        };

        onSaved?.(updated);
        close();
      } catch (err) {
        console.error(err);
        setError("Что‑то пошло не так. Сервер где‑то в инете плачет.");
      }
    });
  };

  return (
    <Dialog open={true} onOpenChange={close}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Редактиврование тренировки</DialogTitle>
            <DialogDescription>
              Надо ебашить, а не редактировать!
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <Label htmlFor="program">План</Label>
              <Textarea
                id="program"
                name="program"
                defaultValue={data.program}
                disabled={isPending}
              />
            </Field>

            <Field>
              <Label htmlFor="distance">Дистанция</Label>
              <Input
                id="distance"
                name="distance"
                defaultValue={data.distance}
                disabled={isPending}
              />
            </Field>
          </FieldGroup>

          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

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
        </form>
      </DialogContent>
    </Dialog>
  );
}
