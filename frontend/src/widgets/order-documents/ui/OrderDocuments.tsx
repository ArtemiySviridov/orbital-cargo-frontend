import { useRef, useState, useCallback } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Loader } from "@/shared/ui/loader";
import { useGetOrderDocumentsQuery, useUploadOrderDocumentsMutation } from "@/entities/application";
import type { IDocumentOut } from "@/entities/application";
import { useGetManagerOrderDocumentsQuery } from "@/entities/elevator";
import { tokenStorage } from "@/shared/api/tokenStorage";
import "./OrderDocuments.scss";

const ALLOWED_EXTENSIONS = [".zip", ".tar", ".tar.gz", ".tgz"];
const MAX_SIZE = 10 * 1024 * 1024; 
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://orbitalcargo.wonderrfau1t.site";

function validateArchive(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext)))
    return "Поддерживаются только .zip, .tar, .tar.gz, .tgz";
  if (file.size > MAX_SIZE) return "Архив превышает 10 МБ";
  return null;
}

function formatRelativeDate(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин. назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн. назад`;
}

interface OrderDocumentsProps {
  orderId: number;
  readonly?: boolean;
  isManager?: boolean;
}

const OrderDocuments = ({ orderId, readonly = false, isManager = false }: OrderDocumentsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { data: clientDocs, isLoading: cLoading, isError: cError } = useGetOrderDocumentsQuery(orderId, { skip: isManager });
  const { data: managerDocs, isLoading: mLoading, isError: mError } = useGetManagerOrderDocumentsQuery(orderId, { skip: !isManager });
  const documents = isManager ? managerDocs : clientDocs;
  const isLoading = isManager ? mLoading : cLoading;
  const isError = isManager ? mError : cError;
  const [uploadDocuments, { isLoading: isUploading }] = useUploadOrderDocumentsMutation();

  const handleFile = useCallback(
    async (file: File) => {
      setUploadError(null);
      setUploadSuccess(null);

      const validationError = validateArchive(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      try {
        const result = await uploadDocuments({ orderId, archive: file }).unwrap();
        setUploadSuccess(`Загружено файлов: ${result.length}`);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err: unknown) {
        const maybeDetail =
          err &&
          typeof err === "object" &&
          "data" in err &&
          err.data &&
          typeof err.data === "object" &&
          "detail" in err.data
            ? (err.data as { detail: string }).detail
            : "Ошибка при загрузке архива";
        setUploadError(maybeDetail);
      }
    },
    [orderId, uploadDocuments]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDownload = async (doc: IDocumentOut) => {
    setDownloadError(null);
    const token = tokenStorage.getAccessToken();
    const prefix = isManager ? "/manager/orders" : "/orders";
    const url = `${API_BASE_URL}${prefix}/${orderId}/documents/${encodeURI(doc.original_filename)}`;
    try {
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error(`${response.status}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = doc.original_filename.split("/").pop() ?? doc.original_filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      setDownloadError("Не удалось скачать файл. Попробуйте ещё раз.");
    }
  };

  return (
    <section className="order-documents">
      <div className="order-documents__list-area">
        {isLoading && <Loader size="sm" text="Загружаем документы..." />}

        {isError && (
          <p className="order-documents__message order-documents__message--error">
            Не удалось загрузить список документов.
          </p>
        )}

        {!isLoading && !isError && (
          <ul className="order-documents__list">
            {documents && documents.length > 0 ? (
              documents.map((doc) => (
                <li key={doc.id} className="order-documents__item">
                  <span className="order-documents__filename" title={doc.original_filename}>
                    {doc.original_filename}
                  </span>
                  <span className="order-documents__date">{formatRelativeDate(doc.uploaded_at)}</span>
                  <Button
                    variant="secondary"
                    icon={<Download size={16} />}
                    text="Скачать"
                    type="button"
                    onClick={() => handleDownload(doc)}
                  />
                </li>
              ))
            ) : (
              <li className="order-documents__list-empty">
                <p className="order-documents__message">Документы пока не загружены.</p>
              </li>
            )}
          </ul>
        )}

        {downloadError && (
          <p className="order-documents__message order-documents__message--error">{downloadError}</p>
        )}
      </div>

      {!readonly && (
        <>
          <div
            ref={dropZoneRef}
            className={`order-documents__dropzone${isDragging ? " order-documents__dropzone--active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload size={20} className="order-documents__upload-icon" />
            <span className="order-documents__dropzone-hint">Перетащите архив сюда или</span>
            <Button
              variant="secondary"
              text={isUploading ? "Загрузка…" : "Выбрать файл"}
              disabled={isUploading}
              type="button"
              onClick={() => fileInputRef.current?.click()}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.tar,.tar.gz,.tgz"
              className="visually-hidden"
              onChange={handleInputChange}
              disabled={isUploading}
            />
            <span className="order-documents__dropzone-formats">.zip · .tar · .tar.gz · .tgz · макс. 10 МБ</span>
          </div>

          {uploadError && (
            <p className="order-documents__message order-documents__message--error" role="alert">
              {uploadError}
            </p>
          )}
          {uploadSuccess && !uploadError && (
            <p className="order-documents__message order-documents__message--success" role="status">
              {uploadSuccess}
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default OrderDocuments;
