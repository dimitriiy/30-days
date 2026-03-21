"use client";

import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Mode = "edit" | "read";

const DATA = `# Заглушка документа

Это текст, который как будто пришёл с сервера.

## Список
- пункт 1
- пункт 2
- ~~зачёркивание~~
- [x] задача выполнена

## Таблица

| Имя | Статус |
| --- | --- |
| Документ | Загружен |
`;

export default function Page() {
  const [mode, setMode] = useState<Mode>("edit");
  const [markdown, setMarkdown] = useState<string>(
    "# Привет\n\nНачни писать Markdown...",
  );
  const [status, setStatus] = useState<string>("");

  async function loadDocument() {
    setStatus("Загрузка...");

    await new Promise((resolve) => setTimeout(resolve, 300));

    setMarkdown(DATA);

    setStatus("Документ загружен (заглушка)");
  }

  async function saveDocument() {
    setStatus("Сохранение...");

    await new Promise((resolve) => setTimeout(resolve, 300));

    console.log("Сохраняем документ:", markdown);
    setStatus("Документ сохранён (заглушка)");
  }

  function toggleMode() {
    setMode((prev) => (prev === "edit" ? "read" : "edit"));
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Markdown editor
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {status || "Готов к работе"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleMode}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium transition hover:bg-slate-800"
            >
              {mode === "edit" ? "Режим чтения" : "Режим редактирования"}
            </button>

            <button
              onClick={saveDocument}
              className="rounded-xl border border-emerald-700 bg-emerald-600/20 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-600/30"
            >
              Сохранить
            </button>

            <button
              onClick={loadDocument}
              className="rounded-xl border border-sky-700 bg-sky-600/20 px-4 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-600/30"
            >
              Загрузить
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          {mode === "edit" ? (
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Пиши Markdown здесь..."
              className="min-h-[75vh] w-full resize-y bg-slate-900 px-5 py-4 font-mono text-[15px] leading-7 text-slate-100 outline-none placeholder:text-slate-500"
            />
          ) : (
            <div className="min-h-[75vh] px-5 py-4">
              <article className="prose prose-invert max-w-none prose-headings:scroll-mt-20 prose-pre:overflow-x-auto prose-table:w-full">
                <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
              </article>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
