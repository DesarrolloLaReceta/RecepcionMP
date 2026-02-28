import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import "./StylesUI/FileUpload.css";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface UploadedFile {
  id:          string;
  file:        File;
  name:        string;
  size:        number;
  status:      "pending" | "uploading" | "done" | "error";
  progress:    number;
  errorMsg?:   string;
  /** URL de previsualización (imágenes) */
  previewUrl?: string;
}

export interface FileUploadProps {
  /** Tipos aceptados — igual que el atributo accept de <input type="file"> */
  accept?:       string;
  /** Cantidad máxima de archivos (default: 1) */
  maxFiles?:     number;
  /** Tamaño máximo por archivo en bytes (default: 10 MB) */
  maxSizeBytes?: number;
  /** Texto del label de la zona drop */
  label?:        string;
  hint?:         string;
  onChange?:     (files: File[]) => void;
  /** Si true muestra la lista de archivos bajo la zona */
  showList?:     boolean;
  /** Archivos ya cargados (modo controlado) */
  value?:        UploadedFile[];
  onRemove?:     (id: string) => void;
  disabled?:     boolean;
  className?:    string;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function fmtSize(bytes: number): string {
  if (bytes < 1024)          return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf")
    return "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext ?? ""))
    return "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z";
  return "M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9zM13 2v7h7";
}

// ─── FILE ITEM ────────────────────────────────────────────────────────────────

function FileItem({
  f,
  onRemove,
}: {
  f:        UploadedFile;
  onRemove?: (id: string) => void;
}) {
  const iconPath = getFileIcon(f.name);

  return (
    <div className="fu-item">

      {/* Thumbnail o ícono de tipo */}
      {f.previewUrl ? (
        <img
          src={f.previewUrl}
          alt={f.name}
          className="fu-item-thumb"
        />
      ) : (
        <div className="fu-item-icon-wrap">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            className="fu-item-icon-svg"
            aria-hidden="true"
          >
            {iconPath.split(" M").map((seg, i) => (
              <path key={i} d={i === 0 ? seg : "M" + seg} />
            ))}
          </svg>
        </div>
      )}

      {/* Info central */}
      <div className="fu-item-info">
        <p className="fu-item-name">{f.name}</p>

        <div className="fu-item-meta">
          <span className="fu-item-size">{fmtSize(f.size)}</span>
          {f.status === "error" && f.errorMsg && (
            <span className="fu-item-error-text">⚠ {f.errorMsg}</span>
          )}
        </div>

        {/* Barra de progreso — solo en uploading */}
        {f.status === "uploading" && (
          <div className="fu-item-progress-track">
            <div
              className="fu-item-progress-fill"
              style={{ width: `${f.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Estado + eliminar */}
      <div className="fu-item-actions">
        <span
          className="fu-item-dot"
          data-status={f.status}
          aria-hidden="true"
        />
        {onRemove && (
          <button
            className="fu-item-remove"
            onClick={() => onRemove(f.id)}
            aria-label="Eliminar archivo"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              className="fu-item-remove-icon"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

    </div>
  );
}

// ─── FILE UPLOAD ──────────────────────────────────────────────────────────────

/**
 * Zona drag-and-drop para adjuntar archivos.
 *
 * @example
 * // Modo simple — solo PDF
 * <FileUpload
 *   accept=".pdf"
 *   label="Adjuntar factura"
 *   hint="PDF hasta 10 MB"
 *   onChange={files => handleFile(files[0])}
 * />
 *
 * // Multi-archivo con lista y control externo
 * <FileUpload
 *   accept=".pdf,.jpg,.png"
 *   maxFiles={5}
 *   showList
 *   value={uploadedFiles}
 *   onRemove={removeFile}
 *   onChange={onNewFiles}
 * />
 */
export function FileUpload({
  accept,
  maxFiles     = 1,
  maxSizeBytes = 10 * 1024 * 1024,
  label,
  hint,
  onChange,
  showList  = false,
  value,
  onRemove,
  disabled,
  className = "",
}: FileUploadProps) {
  const inputRef                    = useRef<HTMLInputElement>(null);
  const [dragging,  setDragging]    = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // ── Validación ───────────────────────────────────────────────────────────────
  const validate = (files: File[]): { valid: File[]; error: string | null } => {
    const over = files.find(f => f.size > maxSizeBytes);
    if (over)
      return { valid: [], error: `"${over.name}" supera el límite de ${fmtSize(maxSizeBytes)}.` };
    if (files.length + (value?.length ?? 0) > maxFiles)
      return { valid: [], error: `Máximo ${maxFiles} archivo${maxFiles !== 1 ? "s" : ""}.` };
    return { valid: files, error: null };
  };

  const handle = (files: File[]) => {
    setLocalError(null);
    const { valid, error } = validate(files);
    if (error) { setLocalError(error); return; }
    onChange?.(valid);
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const onDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    handle(Array.from(e.dataTransfer.files));
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handle(Array.from(e.target.files));
    e.target.value = "";
  };

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className={`fu-root ${className}`}>

      {/* ── Zona drop ── */}
      <label
        className="fu-dropzone"
        data-dragging={dragging   || undefined}
        data-error={!!localError  || undefined}
        data-disabled={disabled   || undefined}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="fu-input"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={onInputChange}
          disabled={disabled}
        />

        {/* Ícono de upload */}
        <div className="fu-icon-wrap">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            className="fu-icon-svg"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
        </div>

        {/* Textos */}
        <div>
          <p className="fu-label-text">
            {label ?? (dragging ? "Suelta aquí" : "Arrastra o haz clic para adjuntar")}
          </p>

          {hint && !localError && (
            <p className="fu-hint">{hint}</p>
          )}

          {localError && (
            <p className="fu-error-msg">⚠ {localError}</p>
          )}
        </div>

        {/* Info de tipos y límite */}
        {accept && !localError && (
          <p className="fu-accept-info">
            {accept} · máx {fmtSize(maxSizeBytes)}
            {maxFiles > 1 ? ` · hasta ${maxFiles} archivos` : ""}
          </p>
        )}
      </label>

      {/* ── Lista de archivos ── */}
      {showList && value && value.length > 0 && (
        <div className="fu-file-list">
          {value.map(f => (
            <FileItem key={f.id} f={f} onRemove={onRemove} />
          ))}
        </div>
      )}

    </div>
  );
}

export default FileUpload;