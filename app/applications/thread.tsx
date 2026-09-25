import { formatDateTime, type Message } from "./applications-store";
import styles from "./applications.module.css";

// A message thread, read as text. `viewer` decides which side is "You".
export function Thread({
  messages,
  viewer,
  otherName,
}: {
  messages: Message[];
  viewer: Message["from"];
  otherName: string;
}) {
  if (messages.length === 0) return null;
  return (
    <ol className={styles.thread} aria-label="Messages">
      {messages.map((m) => {
        const mine = m.from === viewer;
        return (
          <li key={m.id} className={`${styles.message} ${mine ? styles.mine : styles.theirs}`}>
            <p className={styles.messageMeta}>
              <span className={styles.messageFrom}>{mine ? "You" : otherName}</span>
              <span>{formatDateTime(m.at)}</span>
            </p>
            <p className={styles.messageText}>{m.text}</p>
          </li>
        );
      })}
    </ol>
  );
}
