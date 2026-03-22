export interface Page {
  id: number;
  createdAt: number;
  content: string;
}

const MOCK_PAGES: Page[] = [
  {
    id: 1,
    createdAt: Date.now() - 86_400_000,
    content: `# Заметки по проекту

Это текст первой страницы.

## Задачи
- [x] Настроить окружение
- [ ] Написать тесты
- ~~удалённый пункт~~

## Таблица

| Имя | Статус |
| --- | --- |
| Документ | Загружен |
| Отчёт | В работе |
`,
  },
  {
    id: 2,
    createdAt: Date.now() - 43_200_000,
    content: `# Идеи

Страница для свободных заметок.

- Идея A
- Идея B
- Идея C
`,
  },
  {
    id: 3,
    createdAt: Date.now(),
    content: `# Черновик

Начни писать здесь...
`,
  },
];

export async function fetchPages(): Promise<Page[]> {
  await new Promise((r) => setTimeout(r, 200));
  return structuredClone(MOCK_PAGES);
}

export async function savePage(page: Page): Promise<Page> {
  await new Promise((r) => setTimeout(r, 200));
  const idx = MOCK_PAGES.findIndex((p) => p.id === page.id);
  if (idx !== -1) MOCK_PAGES[idx] = page;
  return page;
}

export async function createPage(): Promise<Page> {
  await new Promise((r) => setTimeout(r, 200));
  const newPage: Page = {
    id: Math.max(0, ...MOCK_PAGES.map((p) => p.id)) + 1,
    createdAt: Date.now(),
    content: "# Новая страница\n\nНачни писать...\n",
  };
  MOCK_PAGES.push(newPage);
  return newPage;
}

export async function deletePage(id: number): Promise<void> {
  await new Promise((r) => setTimeout(r, 200));
  const idx = MOCK_PAGES.findIndex((p) => p.id === id);
  if (idx !== -1) MOCK_PAGES.splice(idx, 1);
}
