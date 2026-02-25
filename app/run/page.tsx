"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PROGRAM } from "./data";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

const Coutdown = React.lazy(() => import("./Coutdown"));

type ProgramItem = {
  date: string; // "dd.mm.yyyy"
  day: number;
  program: string;
  distance: number;
};

type DoneItem = {
  date: string;
  done: boolean;
};

type RunResponse = {
  done: DoneItem[];
};

async function runProgram(body?: DoneItem): Promise<RunResponse> {
  const res = await fetch("/api/run", {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch /api/run");
  }

  return res.json();
}

// ====== утилита для получения сегодняшней даты в формате dd.mm.yyyy ======
function getTodayString(): string {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export default function Dashboard() {
  const [doneList, setDoneList] = useState<DoneItem[]>([]);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => getTodayString(), []);
  const todayRef = useRef<HTMLDivElement | null>(null);

  // первый запрос — получить текущее состояние done[]
  useEffect(() => {
    let cancelled = false;

    runProgram()
      .then((data) => {
        if (!cancelled && data?.done) {
          setDoneList(data.done);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // автоскролл к карточке сегодняшнего дня
  useEffect(() => {
    if (!loading && todayRef.current) {
      todayRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }, [loading]);

  const handleChange = useCallback(async (date: string, done: boolean) => {
    try {
      setDoneList((prev) => {
        const exists = prev.find((item) => item.date === date);
        if (exists) {
          return prev.filter((item) => item.date !== date);
        }
        return [...prev, { date, done }];
      });

      const data = await runProgram({ date, done });

      if (data?.done) {
        setDoneList(data.done);
      }

      toast.success("Успех!", { position: "top-right" });
    } catch (e) {
      console.error(e);
      toast.error("Не фортануло!", {
        description: (e as Error).message,
        position: "top-right",
      });
    }
  }, []);

  const isDateDone = useCallback(
    (date: string) =>
      !!doneList.find((item) => item.date === date && item.done),
    [doneList],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070101]">
        <Spinner color="#fff" className="size-8" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center font-sans bg-[#070101]">
      <main className="flex min-h-screen w-full flex-col items-center justify-between py-2 px-5 sm:items-start">
        <div className="flex flex-wrap">
          {PROGRAM.map((program: ProgramItem) => {
            const isToday = program.date === today;

            return (
              <ProgramColumn
                key={program.date}
                data={program}
                onChange={handleChange}
                checked={isDateDone(program.date)}
                // пробрасываем флаг и ref
                isToday={isToday}
                todayRef={isToday ? todayRef : undefined}
              />
            );
          })}
        </div>

        <React.Suspense>
          <div className="fixed bottom-0">
            <Coutdown />
          </div>
        </React.Suspense>
      </main>
    </div>
  );
}

type ProgramColumnProps = {
  data: ProgramItem;
  onChange: (date: string, done: boolean) => void;
  checked: boolean;
  isToday?: boolean;
  todayRef?: React.RefObject<HTMLDivElement>;
};

const ProgramColumn: React.FC<ProgramColumnProps> = ({
  data,
  onChange,
  checked,
  isToday,
  todayRef,
}) => {
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
      onChange(data.date, value);
    },
    [data.date, onChange],
  );

  return (
    <div
      ref={isToday ? todayRef : undefined}
      className={`shadow-2xl min-h-[200px] min-w-[200px] rounded-xl flex-1 text-white  m-1 relative ${
        !isRestDay ? "bg-[#252525]" : "bg-[#363636]"
      } ${
        isToday
          ? "ring-1 ring-yellow-400 ring-offset-2 ring-offset-[#070101]" // ПОДСВЕТКА ТЕКУЩЕГО ДНЯ
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
              className="border border-black cursor-pointer"
              checked={checked}
              onCheckedChange={handleCheckboxChange}
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
    </div>
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
