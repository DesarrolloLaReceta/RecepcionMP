import { useRef, useState, type DragEvent, type ChangeEvent } from "react";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface UploadedFile {
  id:       string;
  file:     File;
  name:     string;
  size:     number;
  /** "pending" | "uploading" | "done" | "error" */
  status:   "pending" | "uploading" | "done" | "error";
  progress: number;
  errorMsg?: string;
  /** URL de previsualización (para imágenes) */
  previewUrl?: string;
}

export interface FileUploadProps {
  /** Tipos MIME aceptados — igual que el atributo accept de <input type="file"> */
  accept?:        string;
  /** Cantidad máxima de archivos (default: 1) */
  maxFiles?:      number;
  /** Tamaño máximo por archivo en bytes (default: 10 MB) */
  maxSizeBytes?:  number;
  /** Texto del label de la zona de drop */
  label?:         string;
  hint?:          string;
  /** Se llama con el array de archivos seleccionados/arrastrados */
  onChange?:      (files: File[]) => void;
  /** Si true, los archivos se muestran como lista debajo de la zona */
  showList?:      boolean;
  /** Archivos ya cargados (para modo controlado) */
  value?:         UploadedFile[];
  onRemove?:      (id: string) => void;
  disabled?:      boolean;
  className?:     string;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function fmtSize(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf")  return "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8";
  if (["jpg","jpeg","png","gif","webp"].includes(ext ?? ""))
    return "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z";
  return "M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9zM13 2v7h7";
}

function isImage(name: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
}

// ─── FILE ITEM ────────────────────────────────────────────────────────────────

function FileItem({ f, onRemove }: { f: UploadedFile; onRemove?: (id: string) => void }) {
  const iconPath = getFileIcon(f.name);
  const statusColor =
    f.status === "done"      ? "#86EFAC" :
    f.status === "error"     ? "#FCA5A5" :
    f.status === "uploading" ? "#F59E0B" : "#64748B";

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>

      {/* Thumb o ícono */}
      {f.previewUrl
        ? <img src={f.previewUrl} alt={f.name}
            className="w-8 h-8 rounded-lg object-cover shrink-0"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }} />
        : <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#64748B" strokeWidth="1.8" strokeLinecap="round">
              {iconPath.split(" M").map((seg, i) => (
                <path key={i} d={i === 0 ? seg : "M" + seg} />
              ))}
            </svg>
          </div>
      }

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-[#CBD5E1] truncate font-medium">{f.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-[#475569] font-mono">{fmtSize(f.size)}</span>
          {f.status === "error" && f.errorMsg && (
            <span className="text-[10px] font-mono" style={{ color: "#FCA5A5" }}>
              ⚠ {f.errorMsg}
            </span>
          )}
        </div>
        {/* Barra de progreso upload */}
        {f.status === "uploading" && (
          <div className="h-0.5 rounded-full mt-1.5 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${f.progress}%`, background: "#F59E0B" }} />
          </div>
        )}
      </div>

      {/* Estado + eliminar */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
        {onRemove && (
          <button onClick={() => onRemove(f.id)}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-[#334155]
              hover:text-[#FCA5A5] transition-colors"
            style={{ background: "transparent" }}
            aria-label="Eliminar archivo">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
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
  accept, maxFiles = 1, maxSizeBytes = 10 * 1024 * 1024,
  label, hint, onChange, showList = false,
  value, onRemove, disabled, className = "",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validate = (files: File[]): { valid: File[]; error: string | null } => {
    const over = files.find(f => f.size > maxSizeBytes);
    if (over) return { valid: [], error: `"${over.name}" supera el límite de ${fmtSize(maxSizeBytes)}.` };
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

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault(); setDragging(false);
    if (disabled) return;
    handle(Array.from(e.dataTransfer.files));
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handle(Array.from(e.target.files));
    e.target.value = "";
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Zona drop */}
      <label
        onDragOver={e => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className="flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-xl
          text-center cursor-pointer transition-all duration-200"
        style={{
          background: dragging
            ? "rgba(245,158,11,0.08)"
            : "rgba(255,255,255,0.02)",
          border: `1px dashed ${dragging
            ? "rgba(245,158,11,0.5)"
            : localError
              ? "rgba(239,68,68,0.35)"
              : "rgba(255,255,255,0.1)"}`,
          opacity: disabled ? 0.4 : 1,
          pointerEvents: disabled ? "none" : "auto",
        }}
        onMouseEnter={e => !dragging && ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")}
        onMouseLeave={e => !dragging && ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          className="hidden"
          onChange={onInputChange}
          disabled={disabled}
        />

        {/* Ícono upload */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: dragging ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${dragging ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.08)"}`,
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={dragging ? "#F59E0B" : "#475569"} strokeWidth="1.8" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
        </div>

        <div>
          <p className="text-[13px] font-medium" style={{ color: dragging ? "#F59E0B" : "#94A3B8" }}>
            {label ?? (dragging ? "Suelta aquí" : "Arrastra o haz clic para adjuntar")}
          </p>
          {hint && !localError && (
            <p className="text-[10px] text-[#334155] font-mono mt-0.5">{hint}</p>
          )}
          {localError && (
            <p className="text-[11px] font-mono mt-0.5" style={{ color: "#FCA5A5" }}>⚠ {localError}</p>
          )}
        </div>

        {accept && !localError && (
          <p className="text-[9px] text-[#2D3748] font-mono">
            {accept} · máx {fmtSize(maxSizeBytes)}
            {maxFiles > 1 ? ` · hasta ${maxFiles} archivos` : ""}
          </p>
        )}
      </label>

      {/* Lista de archivos */}
      {showList && value && value.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {value.map(f => (
            <FileItem key={f.id} f={f} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;