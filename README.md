# Orbital Cargo — Frontend

Веб-приложение для управления системой грузовых лифтов. Позволяет менеджерам создавать заявки на перевозку грузов, а операторам — обрабатывать их и управлять загрузкой лифтов.

## Стек

- **React 19** + **TypeScript**
- **Vite 7** — сборщик
- **Redux Toolkit** + **RTK Query** — стейт-менеджмент и API-запросы
- **React Router v7** — маршрутизация
- **SCSS** — стили
- **Feature-Sliced Design (FSD)** — архитектура

## Роли пользователей

| Роль | Доступные страницы |
|------|--------------------|
| Клиент | Список заявок, детали заявки, создание заявки |
| Менеджер | Список заявок, детали заявки, загрузка лифта |
| Оператор | Панель оператора, просмотр лифта, отправка лифта |

---

## Запуск через Docker

Основной способ запуска в production.

**Требования:** Docker и Docker Compose.

```bash
# 1. Склонировать репозиторий
git clone <repo-url>
cd orbital-cargo-frontend

# 2. Создать файл переменных окружения
cp .env.example .env

# 3. (Опционально) Указать свой API в .env
#    VITE_API_URL=https://your-api.example.com

# 4. Собрать и запустить
docker compose up --build -d

# Приложение доступно на http://localhost
```

### Остановка

```bash
docker compose down
```

### Пересборка после изменений в коде

```bash
docker compose up --build -d
```

---

## Локальная разработка

**Требования:** Node.js 20+, npm.

```bash
cd frontend
npm install
npm run dev
```

Dev-сервер запустится на `http://localhost:5173` с HMR.

### Другие команды

```bash
npm run build    # Сборка production-бандла в dist/
npm run preview  # Предпросмотр production-сборки
npm run lint     # Проверка ESLint
```

---

## Переменные окружения

Переменные задаются в `.env` в корне репозитория (для Docker) или в `frontend/.env` (для локальной разработки).

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `VITE_API_URL` | `https://orbitalcargo.wonderrfau1t.site` | Базовый URL бэкенд API |

> `VITE_API_URL` — это **build-time** переменная Vite. Она встраивается в бандл на этапе сборки, а не при запуске контейнера. Чтобы сменить API, нужно пересобрать образ.

---

## Сборка вручную

```bash
cd frontend
npm install
npm run build
# Статические файлы будут в frontend/dist/
```

Содержимое `dist/` можно раздавать любым HTTP-сервером. Для корректной работы SPA-роутинга все пути должны отдавать `index.html`.

---

## Архитектура

Проект следует **Feature-Sliced Design**. Импорты разрешены только снизу вверх по слоям:

```
shared → entities → features → widgets → pages → app
```

| Слой | Путь | Содержимое |
|------|------|------------|
| `shared` | `src/shared/` | UI-кит, API-клиент, стили, утилиты |
| `entities` | `src/entities/` | Доменные модели: auth, cargo, elevator, application |
| `features` | `src/features/` | Пользовательские сценарии: логин, фильтры |
| `widgets` | `src/widgets/` | Составные блоки: header, footer, формы |
| `pages` | `src/pages/` | Страницы приложения |
| `app` | `src/app/` | Роутер, Redux store, глобальные стили |
