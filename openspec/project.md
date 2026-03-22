# Project

## Overview

- Framework: Next.js (App Router)
- Language: TypeScript only
- Rendering: преимущественно Client Components только для интерактивных UI‑частей.
- Target: веб‑приложение для выполняет несколько пунток - это трекер тренировок, в дальнейшем доабвлю старницы для личного дневника, введения целей.

## Architecture

- `/app` — маршруты и page/layout.
- `/app/(marketing)` — публичные страницы.
- `/app/(app)` — защищённая часть приложения.
- `/entities` — доменные модели и бизнес‑логика.
- `/features` — реализации фич, объединяющие UI + бизнес‑логику.
- `/shared` — переиспользуемые UI‑компоненты, utils, hooks.

## Tech constraints

- Использовать только Client Components.
- Все новые компоненты и функции — с явными типами и строгим TS (`strict: true`).
- ESLint/Prettier конфигурация является источником правды по стилю.