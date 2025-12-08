# 12Frames — Архитектура и развертывание

Этот документ описывает целевую архитектуру сервиса 12Frames, а также шаги по локальному запуску и продакшен-деплою с использованием Docker, PostgreSQL, Redis, Puppeteer/Chromium и Nginx.

---

## 1. Высокоуровневая архитектура

### 1.1. Сервисы

- **Frontend (apps/frontend)**  
  Vue 3 + Vite + TypeScript. SPA, общается с backend по `/api`.

- **Backend API (apps/backend)**  
  NestJS (или Express с модулярной структурой). REST API + (в будущем) WebSocket.  
  Модули: auth, users, projects, templates, workshop, render, files.

- **Render Worker (worker/render-worker)**  
  Отдельный Node.js-процесс, который:
  - слушает очередь задач в Redis (Bull/BullMQ),
  - открывает специальный frontend-роут `/render/:projectId` в headless-браузере,
  - генерирует PDF/PNG через Puppeteer/Chromium,
  - сохраняет результат в локальное хранилище или S3/Minio.

- **PostgreSQL**  
  Основная база данных: пользователи, проекты, шаблоны, лайки, задания на рендер.

- **Redis**  
  Кэш и брокер задач для рендеринга (очереди).

- **Nginx**  
  Front-прокси:
  - раздаёт статику фронта,
  - проксирует `/api` на backend,
  - проксирует `/renders` на директорию с PDF.

---

## 2. Структура репозитория

Рекомендуемая структура:

```bash
12frames/
├─ apps/
│  ├─ frontend/          # Vue 3 + Vite
│  └─ backend/           # NestJS API
│
├─ worker/
│  └─ render-worker/     # сервис рендеринга PDF/PNG
│
├─ packages/
│  └─ shared/            # общие типы, интерфейсы, утилиты
│
├─ docker/
│  └─ nginx/
│     └─ nginx.conf      # конфиг nginx-прокси
│
├─ docs/
│  ├─ ARCHITECTURE_AND_DEPLOYMENT.md
│  ├─ ROADMAP.md
│  ├─ DEVELOPMENT.md
│  └─ CONTRIBUTING.md
│
├─ README.md
├─ .env.example
├─ docker-compose.yml
└─ package.json
```

---

## 3. Локальная разработка

### 3.1. Предварительные требования

На локальной машине должны быть установлены:

- Node.js LTS (>=18),
- npm / pnpm / yarn,
- Git,
- Docker + docker-compose,
- (опционально) make.

### 3.2. Настройка переменных окружения

1. Скопировать `.env.example`:

```bash
cp .env.example .env
```

2. При необходимости изменить:
   - пароли к БД,
   - `VITE_API_BASE_URL`,
   - `CORS_ORIGIN`,
   - пути к Chromium и каталогу рендеров.

---

## 4. Сервисы в Docker (локально и прод)

Основной сценарий: запуск всех инфраструктурных сервисов (Postgres, Redis, Nginx, render-worker) через `docker-compose`, а фронт/бэкенд можно запускать либо в контейнерах, либо напрямую (для dev).

### 4.1. Локальный запуск всего стека

```bash
docker compose build
docker compose up -d
```

Сервисы:

- Frontend: `http://localhost` (через nginx, порт 80),
- Backend API: `http://localhost/api`,
- Postgres: порт 5432,
- Redis: порт 6379.

### 4.2. Запуск фронтенда отдельно (dev-режим)

```bash
cd apps/frontend
npm install
npm run dev
# по умолчанию Vite слушает http://localhost:5173
```

Убедитесь, что `VITE_API_BASE_URL` указывает на `http://localhost:3000/api`.

---

## 5. Backend (общие принципы)

Backend строится вокруг NestJS со слоями:

- **Контроллеры** (`controllers`): принимают HTTP-запросы и валидируют DTO.
- **Сервисы** (`services`): бизнес-логика, работа с репозиториями.
- **Модули** (`modules`): группируют функциональность (users, projects, render).
- **Сущности БД** (`entities`): описывают таблицы в PostgreSQL.
- **Миграции**: управляют схемой БД.

Основные модули на старте:

- `AuthModule` — регистрация/логин, выдача JWT.
- `UsersModule` — профиль пользователя.
- `ProjectsModule` — CRUD проектов календарей.
- `RenderModule` — постановка задач на рендер.
- (опционально) `TemplatesModule` и `WorkshopModule` — публичные шаблоны/галерея.

---

## 6. Render Worker и PDF-экспорт

### 6.1. Концепция

1. Пользователь нажимает **Export** в UI.
2. Frontend отправляет запрос `POST /api/projects/:id/render`.
3. Backend ставит задачу в очередь Redis (`render`).
4. Render worker:
   - забирает задачу,
   - открывает специальный роут фронта `/render/:projectId`,
   - ждёт загрузки (режим "чистой" версии календаря без UI),
   - генерирует PDF/PNG,
   - сохраняет файл и возвращает путь/URL.
5. Backend сообщает фронту, где лежит готовый файл.

### 6.2. Том с рендерами

В `docker-compose.yml` предусмотрен том `renders_data`:

- монтируется в `render-worker` как `/data/renders`,
- монтируется в `nginx` как `/var/www/renders`,
- nginx отдаёт `/renders/...` как статические файлы.

---

## 7. Nginx-прокси

Файл `docker/nginx/nginx.conf`:

- раздаёт фронт по `/`,
- проксирует `/api` на backend,
- отдаёт `/renders` из локальной директории.

В продакшене поверх этого можно поставить внешний nginx/Caddy с HTTPS (Let’s Encrypt).

---

## 8. Продакшен-деплой (VPS)

### 8.1. Шаги

1. Установить Docker и docker-compose на сервер.
2. Склонировать репозиторий `12frames`.
3. Скопировать `.env.example` → `.env`, задать прод-значения.
4. Собрать и поднять сервисы:

   ```bash
   docker compose build
   docker compose up -d
   ```

5. Настроить внешний nginx + certbot (HTTPS), либо использовать отдельный контейнер с автоматическим выпуском сертификатов (traefik/Caddy).

---

## 9. Как использовать этот скелет

1. Сначала реализовать минимальный backend (auth + projects).
2. Затем собрать фронтенд: формы логина/регистрации, список проектов, простейший редактор.
3. Подключить очередь и render-worker.
4. Проверить end-to-end:
   - создать проект,
   - отрендерить PDF,
   - скачать по ссылке `/renders/...`.
5. Дальше постепенно усложнять редактор, Workshop и SmartPrint™.

Подробный поэтапный план см. в [`docs/ROADMAP.md`](./ROADMAP.md).
