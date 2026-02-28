// ─── COMPONENTES UI ───────────────────────────────────────────────────────────
// Importar siempre desde este barrel.
//
// @example
//   import { Button, Modal, DataTable, Badge, Card, StatusBadge,
//            FileUpload, EmptyState, Spinner, Skeleton }
//     from "../../components/ui";

export { Badge }           from "./Badge";
export type { BadgeProps, BadgeColor, BadgeSize, BadgeRadius } from "./Badge";

export { Button, ButtonGroup } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button";

export { Card, CardHeader, CardSection } from "./Card";
export type { CardProps, CardHeaderProps, CardVariant } from "./Card";

export { DataTable }       from "./DataTable";
export type { DataTableProps, Column, SortDir } from "./DataTable";

export { EmptyState }      from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";

export { FileUpload }      from "./FileUpload";
export type { FileUploadProps, UploadedFile } from "./FileUpload";

export { Modal, ModalFooter } from "./Modal";
export type { ModalProps, ModalFooterProps, ModalSize, ModalVariant } from "./Modal";

export { Spinner } from "./Spinner";
export { Skeleton } from "./Skeleton";
export type { SpinnerSize, SpinnerVariant } from "./Spinner";

export { StatusBadge }     from "./StatusBadge";
export type { StatusDomain } from "./StatusBadge";