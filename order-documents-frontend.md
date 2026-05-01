# Order documents — функционал и логика для фронта

Документ для фронтэнд-агента, уже знакомого с базой проекта (auth, baseUrl, JWT в Bearer, обработка 401/403). Здесь — только про загрузку и просмотр «документов» к заказу: эндпоинты, форматы, ограничения, UI-сценарии.

## Доменная картина

К каждому **заказу клиента** (`Order`) можно приложить «документы» — упакованные в архив файлы (накладные, инструкции по обращению, фото груза и т.п.). Архив распаковывается на сервере; каждый извлечённый файл становится отдельной записью `OrderDocument` и доступен для скачивания.

**Кто может работать с документами**: только `client` — владелец заказа. Менеджер и админ не имеют доступа.

**Когда можно загружать**: загрузка не привязана к статусу заказа в текущей итерации. PUT можно делать многократно (каждый archive — это набор новых записей, старые не удаляются).

## Эндпоинты

Все три требуют JWT Bearer и роль `client`. 401 — нет токена, 403 — другая роль, 404 — заказ не существует или принадлежит другому клиенту (BOLA-защита).

### `POST /orders/{order_id}/documents` → `DocumentOut[]` (201)

`Content-Type: multipart/form-data`. Одно поле:

| Поле      | Тип  | Описание                              |
|-----------|------|---------------------------------------|
| `archive` | File | tar / tar.gz / tgz / zip с файлами    |

Сервер открывает архив, валидирует, распаковывает в свой storage и возвращает список созданных документов (один элемент на каждый файл архива):

```ts
interface DocumentOut {
  id: number;
  original_filename: string;  // имя как в архиве (может содержать '/')
  uploaded_at: string;        // ISO 8601
}
```

### `GET /orders/{order_id}/documents` → `DocumentOut[]` (200)

Список всех документов заказа, отсортированы по `id ASC` (порядок загрузки).

### `GET /orders/{order_id}/documents/{filename:path}` → бинарный поток (200)

Скачивание одного документа. `filename` — это `original_filename` из `DocumentOut` (совпадает 1-в-1, может содержать `/`). Ответ — `application/octet-stream` (сервер не угадывает MIME), заголовок `Content-Disposition: attachment; filename="<basename>"`.

Если документа с таким `filename` в этом заказе нет → 404.

## Ограничения архива

Жёстко на стороне сервера, не подкручиваются клиентом:

- **Форматы**: только `*.zip`, `*.tar`, `*.tar.gz`, `*.tgz`. Любое другое расширение → 400 «Unsupported archive format».
- **Размер архива**: не больше **10 MB** (`max_archive_size_bytes`). Превышение → **413** «Archive size … ds limit …».
- **Число файлов в архиве**: не больше **100**. Превышение → 400 «Archive has too many members».
- **Симлинки** в архиве → 400 «Symlinks not allowed».
- **Пути с `..`** или абсолютные пути → 400 «Path traversal …».

Битый/нечитаемый архив → 400 «Bad tar archive» / «Bad zip archive».

## Формат ошибок

Стандартный FastAPI:

```json
{ "detail": "Archive has too many members: 150" }
```

Коды:
- **400** — невалидный архив (формат, симлинки, traversal, лимит файлов, битый).
- **413** — архив слишком большой.
- **401 / 403 / 404** — стандартно.

В UI показывай `detail` пользователю — там осмысленный текст. Если хочешь локализовать — мапь по подстрокам ключевых слов (`"Symlinks"`, `"Path traversal"`, `"too many members"`, `"ds limit"`, `"Unsupported"`).

## UI-сценарии

### Карточка / страница заявки, страница создания заявки

На детальной странице заявки и на странице создания заявки добавь блок **«Документы»**:

- Заголовок + счётчик: `Документы (N)` — N берётся из длины `GET /orders/{id}/documents`.
- Список загруженных документов: каждая строка — `original_filename`, `uploaded_at` (relative, типа «3 минуты назад»), кнопка/ссылка «Скачать».
- Кнопка / drop-zone **«Загрузить архив»** — открывает picker с фильтром по `accept=".zip,.tar,.tar.gz,.tgz"`.

### Загрузка

1. Пользователь выбирает файл → клиентская валидация:
   - Расширение (по lowercase basename) ∈ {`.zip`, `.tar`, `.tar.gz`, `.tgz`}.
   - `file.size <= 10 * 1024 * 1024`.
   - Иначе — показать ошибку, не отправлять.
2. Спиннер на кнопке + дизейбл повторного выбора.
3. POST `multipart/form-data` с полем `archive`. Прогресс upload — через `xhr.upload.onprogress` или `fetch + ReadableStream` (для больших файлов).
4. На успех (201): инвалидировать кеш `["orders", orderId, "documents"]`, очистить input, тост «Загружено N файлов».
5. На ошибку: тост с `detail`, input не очищать (пользователь, может, захочет починить и переотправить).

### Скачивание

```ts
async function download(orderId: number, doc: DocumentOut, token: string) {
  const url = `${baseUrl}/orders/${orderId}/documents/${encodeURI(doc.original_filename)}`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!resp.ok) throw new Error(await resp.text());
  const blob = await resp.blob();
  // Триггерим скачивание через временный <a>
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = doc.original_filename.split("/").pop()!;
  a.click();
  URL.revokeObjectURL(a.href);
}
```

Важно про URL:
- `original_filename` может содержать `/` (например `subdir/note.txt`). FastAPI-роут — `{filename:path}`, путь принимается как есть.
- `encodeURI`, **не** `encodeURIComponent` — иначе слеши заэкранируются и сервер вернёт 404.

### Drag-and-drop

Стандартно: листенер `dragover` + `drop` на контейнере, `e.dataTransfer.files[0]` → та же валидация что у picker → POST. Подсветка зоны при `dragenter` / `dragleave`.

### Список длиной 0

Plain message: «Документы пока не загружены». Кнопка «Загрузить архив» по-прежнему доступна.

### Дубликаты `original_filename`

Если пользователь повторно загружает архив с тем же файлом — в БД создаётся **новая запись** (старая не перезаписывается, GET вернёт обе). При скачивании по `filename` сервер вернёт первую попавшуюся (`SELECT … WHERE original_filename = … LIMIT 1`).

UI-вывод: либо группировать по `original_filename` и в развороте показывать версии (по `uploaded_at`), либо предупреждать пользователя при загрузке: «Файлы с такими именами уже есть, будут добавлены копии: …». В MVP — просто показывать дубликаты как отдельные строки.

## Клиентская валидация перед POST

```ts
const ALLOWED_EXTS = [".zip", ".tar", ".tar.gz", ".tgz"];
const MAX_SIZE = 10 * 1024 * 1024;

function validateArchive(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!ALLOWED_EXTS.some(ext => name.endsWith(ext)))
    return "Поддерживаются только .zip, .tar, .tar.gz, .tgz";
  if (file.size > MAX_SIZE)
    return `Архив больше ${MAX_SIZE / 1024 / 1024} MB`;
  return null;
}
```

## Кеш-инвалидация

После успешного POST:
- `["orders", orderId, "documents"]` — список документов заказа.

`["orders"]` и `["orders", orderId]` инвалидировать **не нужно** — состав документов на самом `OrderOut` не отображается, статус заказа от загрузки не меняется.

## Минимальный MVP

1. Блок «Документы» на странице заказа: список + кнопка загрузки.
2. POST с клиентской валидацией расширения/размера, спиннер, тост на успех/ошибку.
3. GET списка после mount + invalidate после POST.
4. Скачивание по клику (Blob → `<a download>`).
5. Обработка `detail` в тостах для 400 / 413.

После MVP: drag-and-drop, прогресс upload, групповая загрузка нескольких архивов, превью текстовых файлов внутри UI.

## Что НЕ делать

- Не разжимать архив на клиенте — отправляй как есть, сервер сам проверяет содержимое.
- Не угадывать MIME для скачивания — пусть `<a download>` обработает по basename.
- Не делать `encodeURIComponent` на `original_filename` — слеши важны.
- Не считать `Content-Length` ответа на POST «надёжным». Парсь `await resp.json()` для `DocumentOut[]`.
- Не показывать `stored_path` пользователю — это серверный путь, его в API ответе нет (и не должно быть).
