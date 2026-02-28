import { type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button, type ButtonVariant } from "./Button";
import { Spinner } from "./Spinner";
import { Icon } from "./Icon";
import "./SytlesUI/Modal.css";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";
export type ModalVariant = "default" | "drawer";

export interface ModalProps {
  open:       boolean;
  onClose:    () => void;
  title?:     string;
  subtitle?:  string;
  /** Ícono SVG path en el header */
  icon?:      string;
  iconColor?: string;
  size?:      ModalSize;
  variant?:   ModalVariant;
  /** Si false, el backdrop click NO cierra el modal */
  closeOnBackdrop?: boolean;
  /** Si false, la tecla Escape NO cierra el modal */
  closeOnEsc?: boolean;
  children:   ReactNode;
  /** Footer custom — si no se pasa, no hay footer */
  footer?:    ReactNode;
  className?: string;
  /** Estado de carga que muestra overlay sobre el contenido */
  loading?:   boolean;
}

export interface ModalFooterProps {
  onCancel?:        () => void;
  onConfirm?:       () => void;
  cancelLabel?:     string;
  confirmLabel?:    string;
  confirmVariant?:  ButtonVariant;
  loading?:         boolean;
  disabled?:        boolean;
  /** Slot extra a la izquierda del footer */
  leftSlot?:        ReactNode;
}

// ─── MODAL FOOTER ESTÁNDAR ────────────────────────────────────────────────────

/**
 * Footer reutilizable con botones Cancelar / Confirmar y loading state.
 *
 * @example
 * <Modal footer={
 *   <ModalFooter
 *     onCancel={onClose}
 *     onConfirm={guardar}
 *     confirmLabel="Guardar"
 *     loading={saving}
 *   />
 * } />
 */
export function ModalFooter({
  onCancel, onConfirm, cancelLabel = "Cancelar",
  confirmLabel = "Confirmar", confirmVariant = "primary",
  loading, disabled, leftSlot,
}: ModalFooterProps) {
  return (
    <div className="modal-footer-standard">
      <div>{leftSlot}</div>
      <div className="modal-footer-actions">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
        )}
        {onConfirm && (
          <Button 
            variant={confirmVariant} 
            size="sm"
            onClick={onConfirm} 
            loading={loading} 
            disabled={disabled || loading}
          >
            {confirmLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

/**
 * Modal con portal, trap de foco, cierre con Escape y backdrop.
 *
 * @example
 * // Modal estándar
 * <Modal open={show} onClose={() => setShow(false)} title="Nueva OC" size="lg"
 *   footer={<ModalFooter onCancel={...} onConfirm={crear} loading={saving} />}>
 *   <div className="modal-body-content">...</div>
 * </Modal>
 *
 * // Modal de confirmación
 * <Modal open={show} onClose={onClose} title="Cancelar OC" size="sm"
 *   footer={<ModalFooter confirmVariant="danger" confirmLabel="Cancelar OC" ... />}>
 *   <div className="modal-body-content">Esta acción es irreversible.</div>
 * </Modal>
 *
 * // Drawer derecho
 * <Modal open={show} onClose={onClose} variant="drawer" size="md" title="Detalle">
 *   ...
 * </Modal>
 */
export function Modal({
  open, onClose, title, subtitle, icon, iconColor,
  size = "md", variant = "default",
  closeOnBackdrop = true, closeOnEsc = true,
  children, footer, className = "", loading,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isDrawer = variant === "drawer";
  const iconColorValue = iconColor || "var(--primary)";

  // Cerrar con Escape
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const handler = (e: KeyboardEvent) => { 
      if (e.key === "Escape") onClose(); 
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, closeOnEsc, onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const backdropClass = `modal-backdrop modal-backdrop-${variant}`;
  const panelClass = `modal-panel modal-panel-${variant} modal-size-${size} ${className}`;

  const panel = (
    <div
      className={backdropClass}
      onMouseDown={e => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={panelClass}
      >
        {/* Header */}
        {(title || icon) && (
          <div className="modal-header">
            <div className="modal-header-content">
              {icon && (
                <div 
                  className="modal-header-icon"
                  style={{ 
                    background: `color-mix(in srgb, ${iconColorValue} 15%, transparent)`,
                    borderColor: `color-mix(in srgb, ${iconColorValue} 25%, transparent)`
                  }}
                >
                  <Icon 
                    path={icon} 
                    size={14} 
                    color={iconColorValue}
                  />
                </div>
              )}
              <div className="modal-header-text">
                <h2 id="modal-title" className="modal-title">
                  {title}
                </h2>
                {subtitle && (
                  <p className="modal-subtitle">{subtitle}</p>
                )}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="modal-close-btn"
              aria-label="Cerrar modal"
            >
              <Icon path="M18 6L6 18M6 6l12 12" size={12} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="modal-body">
          {loading && (
            <div className="modal-loading-overlay">
              <Spinner size="md" centered />
            </div>
          )}
          {children}
        </div>

        {/* Footer */}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}

export default Modal;