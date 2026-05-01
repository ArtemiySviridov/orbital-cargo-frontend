# Состояние подсистем — новая логика для админ-панели

Дополнение к [admin-control-panel-frontend.md](./admin-control-panel-frontend.md). Описывает только изменение в работе с подсистемами лифта.

## Что изменилось

Раньше: `GET /admin/elevator` возвращал поле `subsystems[]` — фронт показывал лампочки систем как часть основной страницы лифта и обновлял их вместе с поллингом.

Теперь: **`subsystems` в `/admin/elevator` нет**. Состояние подсистем — отдельный ресурс, отдаётся **только** через `POST /admin/system/preflight`.

Логика: «проверка систем» — это явное действие оператора, а не фоновое наблюдение. Лампочки не должны мигать сами по себе, пока админ не нажал «Проверить».

## Источник правды

```
POST /admin/system/preflight  →  PreflightResult
```

Тело запроса не нужно (нужен только Bearer-токен админа).

```ts
interface SubsystemOut {
  name:
    | "telemetry"
    | "hydraulics"
    | "power"
    | "life_support"
    | "navigation"
    | "comms";
  status: "ok" | "error";
}

interface PreflightResult {
  ok: boolean;              // true если errors[] пустой
  subsystems: SubsystemOut[]; // ВСЕ 6 — для отрисовки списка
  errors: SubsystemOut[];     // только error — удобный фильтр
  checked_at: string;         // ISO 8601
}
```

`POST` без сайд-эффектов на подсистемах — preflight только читает БД. Бэкенд пишет внутреннее аудит-событие, но фронту это не видно.

## Когда дёргать preflight

1. **По нажатию кнопки «Проверка систем»** — основной путь.
2. **Сразу после `POST /admin/system/reset`** — reset чинит все подсистемы (`error → ok`); фронт должен заново показать актуальные `subsystems`.
3. **После завершения миссии** — когда поллинг `/admin/elevator` или `/admin/mission/{id}/log` зафиксировал переход `mission.status` из `in_progress` в `delivered` или `aborted`. Сервер при arrival/abort ломает 1–2 случайные подсистемы — фронт об этом узнает только после нового preflight.

Ничего другого. **Не поллить preflight по таймеру** — он не для фоновых обновлений, а для команды оператора.

## UX-рекомендации

- **До первого preflight в текущей сессии** — показывать в блоке «Системы» placeholder: «Состояние неизвестно — нажмите *Проверить*». Не отрисовывать пустые лампочки или ложный «всё ок».
- **После preflight** — список из 6 строк (telemetry, hydraulics, power, life_support, navigation, comms) со светофором: зелёный круг для `ok`, красный для `error`. Имена можно лоэйблить по-русски в маппинге фронта; бэк отдаёт snake_case ключи.
- **Кнопка «Старт миссии» дизейблится**, если последний preflight показал хоть один `error`. Если preflight в этой сессии ещё не делали — старт лучше тоже дизейблить и подсказать «Сначала проверьте системы»: иначе бэк отклонит запрос с 409 `Preflight failed: <subsystems>`.
- **Кнопка «Сброс»** активна, когда `current_mission === null` (бэк вернёт 409 во время полёта). После успешного reset — автоматически дёрни preflight, чтобы обновить блок.
- **`checked_at`** — выводи рядом с блоком в формате «Проверено N сек назад». Если последняя проверка старше ~30 секунд и пользователь собирается жать «Старт» — намекни обновить.

## Кеш-стратегия (TanStack Query / SWR / etc.)

- **Не использовать** preflight как обычный `useQuery` с автоматическим refetch и stale-while-revalidate. Это команда, а не подписка на ресурс.
- Делать через `useMutation` (или эквивалент) — пользователь нажал кнопку, получили ответ, положили в локальный state блока «Системы» (компонентный `useState` или Zustand-store, как удобно).
- Инвалидация после `reset` / `launch` / `abort` / завершения миссии — это вызов того же `useMutation` (preflight) снова, не invalidate-by-key.

## Код-набросок (псевдо React + TanStack)

```tsx
const preflight = useMutation({
  mutationFn: () => api.post<PreflightResult>("/admin/system/preflight"),
});

// Кнопка «Проверка»
<Button onClick={() => preflight.mutate()} disabled={preflight.isPending}>
  Проверка систем
</Button>

// Блок отрисовки
{preflight.data ? (
  <SystemsList
    subsystems={preflight.data.subsystems}
    checkedAt={preflight.data.checked_at}
    ok={preflight.data.ok}
  />
) : (
  <Placeholder>Состояние неизвестно — нажмите Проверить</Placeholder>
)}

// После reset
const reset = useMutation({
  mutationFn: () => api.post("/admin/system/reset"),
  onSuccess: () => preflight.mutate(),  // подтянуть свежий статус
});

// После завершения миссии (наблюдаем за current_mission в /admin/elevator)
useEffect(() => {
  if (prev?.status === "in_progress" && current?.status !== "in_progress") {
    preflight.mutate();
  }
}, [current?.status]);
```

## Что НЕ делать

- Не показывать лампочки до первого preflight — пользователь подумает, что это live-состояние.
- Не дёргать preflight в `setInterval` или TanStack `refetchInterval`.
- Не запускать «Старт миссии», полагаясь на старый ответ preflight, если между ними была отмена/прибытие миссии — после любого arrival/abort сервер мог что-то сломать; перечитай.
- Не сравнивать `subsystems` с локальным «эталоном» — сервер всегда правее.
