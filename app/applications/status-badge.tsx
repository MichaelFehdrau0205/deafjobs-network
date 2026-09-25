import { STATUS_LABEL, type Status } from "./applications-store";
import styles from "./applications.module.css";

// The status is always spelled out. Colour only reinforces it.
export function StatusBadge({ status }: { status: Status }) {
  return <span className={`${styles.badge} ${styles[status]}`}>{STATUS_LABEL[status]}</span>;
}
