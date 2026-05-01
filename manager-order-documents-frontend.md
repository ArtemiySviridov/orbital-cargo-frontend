# Manager order documents — новый read-only эндпоинт для фронта

Документ для фронтэнд-агента, который уже знает базу проекта: `baseUrl`, JWT в
`Authorization: Bearer <token>`, обработку 401/403 и менеджерские экраны заказов.
Здесь только про просмотр документов заказа менеджером.

## Что изменилось

Менеджер теперь может смотреть список файлов, прикреплённых клиентом к заказу, и
скачивать эти файлы. Загружать документы менеджер не может.

Новые эндпоинты находятся под `/manager`, требуют роль `manager` и работают для
любого существующего заказа.

## Модель ответа

```ts
interface DocumentOut {
  id: number;
  original_filename: string; // имя файла как в архиве, может содержать "/"
  uploaded_at: string;       // ISO 8601
}
```

`stored_path` сервер не отдаёт и на фронте его быть не должно.

## Получить список документов

### `GET /manager/orders/{order_id}/documents`

Headers:

```http
Authorization: Bearer <manager_jwt>
```

Ответ `200 OK`:

```json
[
  {
    "id": 17,
    "original_filename": "invoice.pdf",
    "uploaded_at": "2026-05-01T09:15:30.123456Z"
  },
  {
    "id": 18,
    "original_filename": "photos/cargo.jpg",
    "uploaded_at": "2026-05-01T09:16:02.987654Z"
  }
]
```

Порядок: по `id ASC`, то есть примерно в порядке загрузки.

Коды ошибок:

- `401` — нет токена или токен невалидный.
- `403` — пользователь не менеджер.
- `404` — заказа с таким `order_id` нет.

Пример:

```ts
async function fetchManagerOrderDocuments(
  baseUrl: string,
  orderId: number,
  token: string,
): Promise<DocumentOut[]> {
  const resp = await fetch(`${baseUrl}/manager/orders/${orderId}/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!resp.ok) {
    throw new Error(await resp.text());
  }

  return resp.json();
}
```

## Скачать документ

### `GET /manager/orders/{order_id}/documents/{filename:path}`

`filename` нужно брать из `doc.original_filename` ровно как пришло из API.

Важно: `original_filename` может содержать `/`, например `photos/cargo.jpg`.
Используй `encodeURI`, а не `encodeURIComponent`, чтобы не сломать path-параметр.

Headers:

```http
Authorization: Bearer <manager_jwt>
```

Ответ `200 OK`: бинарный поток файла. Бэкенд отдаёт `Content-Disposition` с
`basename` файла.

Коды ошибок:

- `401` — нет токена или токен невалидный.
- `403` — пользователь не менеджер.
- `404` — заказа нет или документа с таким именем нет в этом заказе.

Пример:

```ts
async function downloadManagerOrderDocument(
  baseUrl: string,
  orderId: number,
  doc: DocumentOut,
  token: string,
) {
  const url = `${baseUrl}/manager/orders/${orderId}/documents/${encodeURI(
    doc.original_filename,
  )}`;

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!resp.ok) {
    throw new Error(await resp.text());
  }

  const blob = await resp.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = doc.original_filename.split("/").pop() || doc.original_filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
```

## UI-ожидания

На странице менеджерского заказа есть блок `Документы`:

- При открытии заказа вызвать `GET /manager/orders/{order_id}/documents`.
- Если массив пустой, показать текст вроде `Документы не загружены`.
- Для каждого документа показать `original_filename`, дату загрузки и кнопку `Скачать`.
- Не показывать менеджеру upload-кнопку: загрузка остаётся только в клиентском API.

Рекомендуемый query key, если используется TanStack Query:

```ts
["manager", "orders", orderId, "documents"]
```
