"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

import { useCallback, useMemo } from "react";
import type { ProgramItem } from "../page";

import { motion, useAnimationControls } from "motion/react";

type ProgramColumnProps = {
  data: ProgramItem;
  onChange: (item: ProgramItem, done: boolean) => void;
  onClick: () => void;
  checked: boolean;
  isToday?: boolean;
  todayRef?: React.RefObject<HTMLDivElement | null>;
};

export const ProgramColumn: React.FC<ProgramColumnProps> = ({
  data,
  onChange,
  checked,
  isToday,
  todayRef,
  onClick,
}) => {
  const controls = useAnimationControls();

  const formatted = useMemo(() => formatRuDate(data.date), [data.date]);
  const [fullDateLabel, shortDateLabel] = useMemo(
    () => splitDateLabels(formatted, data.date),
    [formatted, data.date],
  );

  const isRestDay = useMemo(
    () => data.program.includes("Отдых"),
    [data.program],
  );

  const handleCheckboxChange = useCallback(
    (value: boolean) => {
      if (value) {
        controls.start({
          scale: 1.2,
          rotate: 360,
          transition: { duration: 0.5 },
        });
        setTimeout(() => {
          controls.start({ scale: 1, transition: { duration: 0.5 } });
        }, 600);
      }

      onChange(data, value);
    },
    [data, onChange, controls],
  );

  return (
    <motion.div
      initial={{ scale: 0.7 }}
      whileInView={{ scale: 1 }}
      animate={controls}
      onClick={onClick}
      ref={isToday ? todayRef : undefined}
      className={`shadow-2xl min-h-[200px] min-w-[200px] rounded-xl flex-1 text-white  m-1 relative ${
        !isRestDay ? "bg-[#252525]" : "bg-[#363636]"
      } ${
        isToday
          ? "ring-1 ring-yellow-400 ring-offset-2 ring-offset-[#070101]" // ПОДСВЕТКА ТЕКУЩЕГО ДНЯ
          : checked
            ? "ring-[#00fb0042] ring-1 ring-offset-[#070101]"
            : ""
      }`}
    >
      <div className="thead p-2 font-bold capitalize flex justify-between rounded-t-xl">
        <Badge className="text-md">{fullDateLabel}</Badge>
        <Badge className="text-md">{shortDateLabel}</Badge>
      </div>

      <div className="tbody p-2">
        <div className="top flex justify-between mb-2">
          <div className="tday font-bold">День {data.day}</div>
          <div className="done">
            <Checkbox
              className="border border-black cursor-pointer size-6"
              checked={checked}
              onCheckedChange={handleCheckboxChange}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className="content">
          {data.program
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
            .map((text, index) => (
              <div key={index} className="mb-2">
                {text}
              </div>
            ))}
        </div>
        {!isRestDay && (
          <div className="text-sm absolute bg-yellow-300 text-black rounded-full p-2 text-center flex items-center justify-center bottom-2 right-2">
            {data.distance}km
          </div>
        )}
      </div>
    </motion.div>
  );
};

function formatRuDate(dateString: string): string {
  const [d, m, y] = dateString.split(".");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "full",
    timeStyle: "long",
  }).format(date);
}

function splitDateLabels(
  formattedDate: string,
  rawDate: string,
): [string, string] {
  const primary = formattedDate.split(",")?.[0] ?? formattedDate;
  const secondary = rawDate.replace(/\.\d{4}$/, "");
  return [primary, secondary];
}
