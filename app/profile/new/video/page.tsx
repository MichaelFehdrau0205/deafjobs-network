import type { Metadata } from "next";
import Link from "next/link";
import { FocusHeading } from "../focus-heading";
import { Progress } from "../progress";
import styles from "../profile.module.css";

export const metadata: Metadata = {
  title: "Step 2 of 3: Video — DEAFJOBS",
};

// Placeholder: Step 2 is built next.
export default function Page() {
  return (
    <>
      <Progress current={2} />
      <FocusHeading className={styles.title}>Add a short video</FocusHeading>
      <p className={styles.intro}>This step is coming next.</p>
      <div className={styles.actions}>
        <Link className={styles.linkAction} href="/profile/new">
          Back to step 1
        </Link>
      </div>
    </>
  );
}
