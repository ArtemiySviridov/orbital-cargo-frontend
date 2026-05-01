# Admin control panel — функционал и логика для фронта

Документ для фронтэнд-агента, который уже знает базу проекта (auth, baseUrl, JWT в Bearer, обработку 401/403, кеш-стратегию). Здесь — только про админ-панель: миссии, проверка систем, нарратив полёта.

Менеджерский лифт (manifest / loadout) — отдельный гайд: [manager-loadout-frontend.md](./manager-loadout-frontend.md). Админ его **не редактирует**, только смотрит.

## Доменная картина

Админ — оператор лифта. Его задача:

1. Посмотреть, что менеджер собрал в манифесте (read-only).
2. Прогнать проверку систем (preflight). Если что-то сломано — нажать reset.
3. Запустить миссию. Лифт уезжает, идёт **эмуляция полёта** (фоновая задача на сервере, фиксированная длительность из конфига — `mission_duration_seconds`, по умолчанию 30 секунд).
4. Во время полёта поллингом получать **нарратив миссии** — последовательность сообщений «Двери закрылись» / «Старт через 3» / «Финиш!». Это для отображения в UI, не аудит-журнал.
5. По прибытии: грузы в `delivered`, заказы в `delivered`, лифт на целевой локации, 1–2 подсистемы случайным образом ломаются → preflight в следующий раз пожалуется.
6. **Красная кнопка** (`/admin/mission/abort`) — открыть двери в полёте. Все грузы текущей миссии → `lost`, заказы → `lost` или `partially_lost`. Лифт всё равно оказывается в целевой локации (двери открыли — груз вылетел, лифт долетел пустым). Это **легитимная** функция админа, не уязвимость.

Все админские эндпоинты под `AdminOnly` (роль `admin`). 401 — нет токена, 403 — другая роль. Менеджер и клиент сюда не попадают.

## Enum'ы (1-в-1 с бэком)

Из manager-гайда уже есть `CargoSize`, `OrderDirection`, `CargoStatus`, `ElevatorLocation`. Здесь — новые/расширенные:

```ts
type CargoStatus = "pending" | "in_transit" | "delivered" | "cancelled" | "lost";
type OrderStatus = "created" | "in_progress" | "delivered" | "cancelled" | "lost" | "partially_lost";

type MissionStatus = "in_progress" | "delivered" | "aborted";

type SubsystemName =
  | "telemetry"
  | "hydraulics"
  | "power"
  | "life_support"
  | "navigation"
  | "comms";
type SubsystemStatus = "ok" | "error";
```

`lost` / `partially_lost` появляются только после abort (или потенциально после потерь в будущем). Если ты рисуешь клиентский UI заказов — значки на эти статусы понадобятся.

## Модели ответов

```ts
interface SubsystemOut {
  name: SubsystemName;
  status: SubsystemStatus;
}

interface PreflightResult {
  ok: boolean;             // true если errors пустой
  subsystems: SubsystemOut[];  // ВСЕ 6, всегда — для отрисовки списка
  errors: SubsystemOut[];      // только те, что в error — удобный фильтр
  checked_at: string;          // ISO 8601
}

interface MissionOut {
  id: number;
  direction: OrderDirection;
  status: MissionStatus;
  started_at: string;        // ISO 8601
  eta_at: string;            // расчётное прибытие = started_at + mission_duration_seconds
  completed_at: string | null;  // null пока in_progress
  started_by_user_id: number;
  cargo_count: number;       // сколько грузов привязано к миссии
}

interface AdminElevatorOut {
  // те же поля, что и ElevatorOut у менеджера:
  location: ElevatorLocation;
  max_weight_kg: number;
  current_weight_kg: number;
  slots: SlotOut[];           // 14 ячеек, формат как у менеджера
  // + админский блок:
  current_mission: MissionOut | null;  // активная миссия (in_progress) или null
  subsystems: SubsystemOut[];          // все 6
}

interface MissionLogEntry {
  ts: string;       // расчётное время сообщения (ISO 8601)
  message: string;
}

interface MissionLogOut {
  mission_id: number;
  status: MissionStatus;
  entries: MissionLogEntry[];  // накапливаются по мере «реального времени» миссии
}
```

## Эндпоинты

Все требуют JWT Bearer и роль `admin`.

### `GET /admin/elevator` → `AdminElevatorOut`

Читает текущее состояние лифта **+ блок миссии и подсистем**. Это основной poll-ресурс на странице загрузки. Один источник правды для бейджа локации, текущей миссии и состояния подсистем.

### `POST /admin/system/preflight` → `PreflightResult`

Проверка фиктивных подсистем. **State не меняет** — просто читает таблицу `elevator_subsystems` и возвращает их статусы. Можно вызывать сколько угодно раз.

Внутри пишет аудит-событие на сервере (`event_logs`), но фронту это неважно — наружу аудит не выставляется.

200 всегда (если ты — админ). `ok: false` означает, что есть подсистемы в `error` — миссию **не запустить** до reset.

### `POST /admin/system/reset` → 204

Чинит все подсистемы (`error → ok`). После reset preflight отдаст `ok: true`.

**409**: запрещён, если есть активная миссия (`current_mission !== null`). Detail: `"Cannot reset while a mission is in progress"`. UI должен дизейблить кнопку, когда лифт `in_transit`.

### `POST /admin/mission/launch` → `MissionOut` (201)

Старт миссии. Сервер запускает фоновую задачу, которая через `mission_duration_seconds` (≈30 сек) автоматически завершает её (`_complete_arrival`).

Pre-conditions (любая нарушена → **409**, текстовое описание в `detail`):

1. `elevator.location ∈ {"earth", "orbit"}` (не `"in_transit"`).
2. Нет активной миссии.
3. Все подсистемы в `ok` (preflight clean) — иначе `"Preflight failed: <subsystems>"`.
4. В лифте есть хотя бы один груз (`current_weight_kg > 0`).
5. Направление всех грузов соответствует локации (этим занимается менеджер, но защита есть).

После launch:
- `current_mission` появляется в `/admin/elevator` со статусом `in_progress`.
- `elevator.location → "in_transit"`.
- Все грузы в манифесте → `cargo.status = "in_transit"`, привязываются к `mission_id`.
- Через ~30 секунд лифт сам прилетает: cargo → `delivered`, slots очищаются, заказы → `delivered`, локация меняется, 1–2 подсистемы ломаются.

### `POST /admin/mission/abort` → `MissionOut`

Красная кнопка. Открывает двери в полёте.

**409** если активной миссии нет.

После abort:
- `mission.status = "aborted"`, `completed_at` ставится.
- Все грузы миссии → `cargo.status = "lost"`.
- Слоты очищаются.
- `elevator.location` = целевая локация (как при штатном arrival).
- Заказы пересчитываются: все `lost` → `lost`, смесь `lost + delivered` → `partially_lost`, если ещё есть `pending` — остаются `in_progress`.
- 1–2 подсистемы ломаются.
- Фоновая задача отменяется (нет race с автоматическим arrival).

UX-вопрос: эта операция деструктивная. Подтверждение через модалку обязательно.

### `GET /admin/missions?status=&limit=&offset=` → `MissionOut[]`

История миссий. Сортировка `started_at DESC`. Опциональный фильтр `status`. `limit` по умолчанию 50, максимум 200. `offset` для пагинации.

Можно показывать в виде журнала на отдельной вкладке («История полётов»).

### `GET /admin/mission/{id}/log` → `MissionLogOut`

**Главный polling-эндпоинт во время миссии.** Возвращает массив сообщений, которые «уже произошли» на этот момент времени, в порядке `ts ASC`.

Сервер не хранит сообщения — он вычисляет их по таймлайну в процентах от длительности:

| % от длительности | Сообщение                                  |
|-------------------|--------------------------------------------|
| 0%                | Двери закрылись                            |
| 3%                | Герметизация шахты                         |
| 7%                | Подготовка к запуску                       |
| 12%               | Старт через 3                              |
| 15%               | Старт через 2                              |
| 18%               | Старт через 1                              |
| 21%               | Пуск!                                      |
| 40%               | Набор высоты                               |
| 60%               | Маршевый режим                             |
| 78%               | Замедление                                 |
| 90%               | Подготовка к стыковке                      |
| 97%               | Посадка                                    |

Финал зависит от `status`:
- `delivered` → таймлайн целиком + `"Прибытие на орбите. Финиш!"` (или `"...на Земле. Финиш!"` для обратного рейса).
- `aborted` → шаги, успевшие до момента abort + `"АВАРИЯ: двери лифта открыты в полёте, груз потерян"`.
- `in_progress` → только то, что успело произойти к `now`.

**404** если `mission_id` не найден.

Поля `ts` — это расчётные времена для каждого шага (started_at + (offset_pct / 100) × duration). Можешь использовать их для отрисовки временных меток в логе.

## Жизненный цикл миссии (UI flow)

```
[idle]                                            ← elevator на земле/орбите, нет активной миссии
   │
   │  GET /admin/elevator каждые 5–10 сек (или по событиям)
   │  preflight по нажатию кнопки
   │  reset по нажатию кнопки (если errors)
   │
   ▼
[ready] preflight ok, в лифте есть груз
   │
   │  POST /admin/mission/launch
   │
   ▼
[in_progress]                                     ← elevator.location = "in_transit"
   │                                              ← current_mission.status = "in_progress"
   │
   │  POST /admin/mission/abort  ──────────────┐
   │  GET /admin/mission/{id}/log каждую 1 сек │
   │                                            ▼
   │                                       [aborted]
   │
   │  ~30 сек спустя автоматически
   │
   ▼
[delivered]                                       ← elevator.location = "orbit" или "earth"
                                                  ← current_mission = null (миссия больше не активна)
                                                  ← preflight в следующий раз покажет 1–2 ошибки
```

После delivered/aborted — снова `[idle]`. Цикл повторяется.

## Polling-стратегия

### Когда миссии нет (`current_mission === null`)

- `GET /admin/elevator` — раз в 5–10 секунд достаточно. Это ловит обновления манифеста менеджером и состояния подсистем.
- preflight / reset / launch — только по действию пользователя.

### Когда миссия активна (`current_mission.status === "in_progress"`)

- `GET /admin/mission/{id}/log` — **раз в 1 секунду**. Список монотонно растёт; рисуй diff (новые entries — анимировать появление, например, печатной машинкой или fade-in).
- `GET /admin/elevator` — раз в 2–3 секунды, чтобы вовремя увидеть переход в `delivered`/`aborted` и завершить polling.

Polling в обоих случаях останавливается, когда `mission.status !== "in_progress"`. После этого можно сделать ещё один финальный запрос `/log` (там появится `Финиш!` или `АВАРИЯ`).

## Логика UI

Бэкенд оставляет фронту полную свободу раскладки. Рекомендованная структура:

### Страница 1 — «Лифт» (read-only)

Та же визуальная схема, что у менеджера: 14 ячеек, сгруппированных по размеру, с грузами. Только **без drag-and-drop, без кнопок Save/Cancel**.

Шапка:
- Локация лифта (`earth` / `orbit` / `in_transit`).
- `current_weight_kg / max_weight_kg`.
- Бейдж текущей миссии: «Полёт #123, направление to_orbit, ETA 14:32:05» (если `current_mission !== null`).

Источник: `GET /admin/elevator`.

### Страница 2 — «Пульт управления»

Три блока:

**Блок «Системы» (все 6 подсистем)**
- Список из 6 строк (telemetry, hydraulics, power, life_support, navigation, comms).
- Каждая со статусом-индикатором (зелёный круг для `ok`, красный для `error`).
- Источник: `subsystems` из `GET /admin/elevator` (всегда актуально) или `POST /admin/system/preflight` (явная проверка по нажатию).
- Кнопка **«Проверка»** → POST preflight, обновить блок.
- Кнопка **«Сброс»** → POST reset, после успеха обновить блок (`subsystems` все станут `ok`). Дизейблить, если активна миссия.

**Блок «Запуск»**
- Кнопка **«Старт»** — POST launch.
  - Дизейблить, если: лифт `in_transit` / есть активная миссия / есть подсистемы в `error` / лифт пустой / direction несоответствует.
  - Можно превентивно проверять условия на клиенте по данным из `/admin/elevator`.
  - При 409 — показать `detail` пользователю.
- Кнопка **«Красная кнопка / Прервать»** (abort) — видна и активна **только** когда `current_mission.status === "in_progress"`.
  - Подтверждение через модалку (это деструктивная операция).
  - При 409 — обновить state, миссия уже могла завершиться сама.

**Блок «Лог миссии»**
- Появляется, когда есть `current_mission` (или последняя завершённая, если хочешь сохранять её ещё минуту после завершения).
- Источник: `GET /admin/mission/{current_mission.id}/log` поллингом раз в секунду.
- Отрисовка: вертикальный список сообщений в порядке появления, новое сверху или снизу (на твой вкус).
- Финальное сообщение `Финиш!` — зелёным цветом, `АВАРИЯ` — красным с warning-иконкой.
- При остановленной миссии (delivered/aborted) — кнопка «Скрыть лог» / автоскрытие через N секунд.

### История полётов (опционально)

Отдельная вкладка или модалка: `GET /admin/missions`. Таблица с фильтром по статусу. Клик по строке — модалка с полным `MissionLogOut` для этой миссии (для уже завершённых таймлайн возвращается целиком).

## Обработка ошибок

- **409 в preflight/reset/launch/abort** — показать `detail` пользователю текстом, обновить `/admin/elevator`. Пользователь обычно понимает, что делать (нажать reset, дождаться arrival).
- **404 в `/admin/mission/{id}/log`** — миссия удалена или ID кривой. Очистить локальный state миссии, refetch `/admin/elevator`.
- **401/403** — стандартная обработка проекта.

Никаких структурированных error_code пока нет, держи маппинг по подстрокам в `detail` гибким.

## Кеш-инвалидация

После любой mutation (launch / abort / reset):
- `["admin", "elevator"]`
- `["admin", "missions"]`
- `["admin", "mission", missionId, "log"]` — если был активный
- Если в этом же приложении показываются клиентские заказы или менеджерский cargos — после launch и arrival/abort инвалидируй `["orders"]`, `["manager", "cargos"]`, `["manager", "elevator"]`. Грузы и заказы поменяли статусы.

## Что НЕ делать

- Не пытаться рассчитывать таймлайн сообщений на клиенте — серверный считает по `started_at` / `eta_at` / `now()`, и при рестарте сервера `recover_pending_missions` корректно подхватит миссию. Клиентский расчёт может разойтись.
- Не считать `current_weight_kg` или статусы локально — всё из ответа сервера.
- Не запускать polling логов чаще 1/сек — сообщения появляются медленно (при 30-сек миссии каждое — раз в 2–3 сек).
- Не оставлять polling после завершения миссии — это лишние запросы.
- Не редактировать loadout с админской страницы — это manager-only функция, у админа нет такого эндпоинта.
- Не показывать abort-кнопку без подтверждения — это action с большим blast radius.

## Минимальный MVP

1. Страница «Лифт»: read-only вид `GET /admin/elevator`, рефреш раз в 5 сек.
2. Страница «Пульт»: блок «Системы» (preflight + reset), блок «Запуск» (только launch).
3. После launch — polling `/admin/mission/{id}/log` раз в сек, отрисовка списка сообщений как чат.
4. Когда статус миссии меняется на `delivered` — стопаем polling, показываем финальное сообщение.
5. abort и история — после MVP.
