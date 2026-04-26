# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Команды

Проект находится в поддиректории `frontend/`. Все команды запускать из неё.

```bash
npm run dev       # Запуск dev-сервера с HMR
npm run build     # Сборка (tsc -b && vite build)
npm run lint      # Проверка ESLint
npm run preview   # Предпросмотр production-сборки
```

## Архитектура

Проект строго следует **Feature-Sliced Design (FSD)**. Слои (по порядку от нижнего к верхнему):

```
shared → entities → features → widgets → pages → app
```

Каждый слой может импортировать только из слоёв ниже себя. Нарушение этого правила недопустимо.

**Псевдонимы путей** (tsconfig + vite.config):
- `@shared/*` → `src/shared/*`
- `@entities/*` → `src/entities/*`
- `@features/*` → `src/features/*`
- `@widgets/*` → `src/widgets/*`
- `@pages/*` → `src/pages/*`
- `@app/*` → `src/app/*`

## Стейт-менеджмент

**Redux Toolkit** + **RTK Query**.

- Стор: `src/app/store/index.ts`
- Типизированные хуки (`useAppDispatch`, `useAppSelector`): `src/app/store/hooks.ts` — всегда использовать вместо `useDispatch`/`useSelector`
- Срезы (слайсы): `entities/auth/model/authSlice.ts`, `entities/cargo/model/cargoSlice.ts`
- RTK Query API: `entities/auth/api/authApi.ts`

## API-интеграция

- Base URL: `https://orbitalcargo.wonderrfau1t.site` (переопределяется через `VITE_API_URL`)
- Кастомный `axiosBaseQuery`: `src/shared/api/axiosBaseQuery.ts` — читает токен из Redux/localStorage и проставляет `Authorization: Bearer`
- Управление токеном: `src/shared/api/tokenStorage.ts` (ключ `"accessToken"` в localStorage)

**Схема аутентификации:** POST `/auth/login` → получение `access_token` → хранение в localStorage + Redux → GET `/auth/me` за данными пользователя.

## Маршрутизация

React Router v7. Конфиг: `src/App.tsx`.

- Публичные маршруты (`/`) — только неаутентифицированные пользователи
- Защищённые маршруты — оборачиваются в `DefaultLayout` (Header + Outlet + Footer)
- Проверка авторизации через селектор `selectIsAuthenticated`

## Стили

SCSS с переменными и утилитами в `src/shared/lib/styles/`. Главный файл — `main.scss`. Переменные: `_variables.scss`, миксины: `helpers/_mixins.scss`.
