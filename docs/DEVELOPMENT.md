# 12Frames — Гайд по разработке

Этот документ описывает, как запускать проект локально и как устроен базовый dev-процесс.

---

## 1. Подготовка окружения

### 1.1. Зависимости

На вашей машине должны быть установлены:

- Node.js LTS (>=18),
- npm / pnpm / yarn (на выбор),
- Git,
- Docker и docker-compose.

### 1.2. Клонирование и установка

```bash
git clone <url-вашего-репозитория> 12frames
cd 12frames
cp .env.example .env
```

> В `.env` можно оставить значения по умолчанию для локальной разработки.

---

## 2. Запуск инфраструктуры (Postgres + Redis + Nginx)

```bash
docker compose up -d postgres redis nginx
```

Проверка:

- PostgreSQL доступен на `localhost:5432`,
- Redis доступен на `localhost:6379`,
- Nginx слушает `localhost:80` (пока без фронта/бэка он может отдавать 502 — это нормально).

---

## 3. Backend (NestJS)

### 3.1. Установка и запуск

```bash
cd apps/backend
npm install
npm run start:dev
```

Backend по умолчанию слушает `http://localhost:3000`.

### 3.2. Миграции БД

Если используется TypeORM/Prisma — выполняйте миграции после изменения схемы.

Пример (TypeORM):

```bash
npm run typeorm migration:run
```

---

## 4. Frontend (Vue 3 + Vite)

### 4.1. Установка и запуск

```bash
cd apps/frontend
npm install
npm run dev
```

Фронтенд по умолчанию доступен на `http://localhost:5173`.

Убедитесь, что в `.env` или `vite.config`/`import.meta.env` задан верный `VITE_API_BASE_URL` (по умолчанию `http://localhost:3000/api`).

---

## 5. Render Worker

### 5.1. Установка и запуск

```bash
cd worker/render-worker
npm install
npm run dev
```

Рабочий процесс:

- worker подключается к Redis,
- слушает очередь `render`,
- обрабатывает задания, рендеря PDF/PNG через Puppeteer/Chromium.

---

## 6. Полный локальный стек через Docker

Если хотите запускать всё в контейнерах:

```bash
cd 12frames
docker compose up -d --build
```

Сервисы:

- Frontend: `http://localhost` (через nginx),
- Backend: `http://localhost/api`,
- Postgres/Redis — как в `docker-compose.yml`.

---

## 7. Стиль кода и линтинг

> (TODO: заполнить после выбора инструментов)

Рекомендуется:

- ESLint + Prettier для JS/TS,
- commit hooks через Husky/lefthook,
- форматирование кода перед коммитом.

---

## 8. Git-flow

Минимальный процесс:

- `main` — стабильная ветка (production),
- `develop` — интеграционная ветка (опционально),
- feature-ветки: `feature/...`,
- bugfix-ветки: `fix/...`.

Перед merge в `main`:

1. Все тесты должны проходить.
2. Код должен быть отформатирован.
3. PR должен пройти код-ревью (минимум 1 approve).

Подробнее см. [`docs/CONTRIBUTING.md`](./CONTRIBUTING.md) (по мере заполнения).
