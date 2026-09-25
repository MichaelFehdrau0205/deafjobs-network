import type { Metadata } from "next";
import Link from "next/link";
import { JobsBrowser } from "./jobs-browser";
import styles from "./jobs.module.css";

export const metadata: Metadata = {
  title: "Browse jobs — DEAFJOBS",
};

// Demo listings only, scoped to NYC/NJ/CT for this build. Every posting on
// the real product gates behind the employer commitment form (see
// PAGES-GOALS.md) — these ten are static placeholders to show what that
// looks like once employers can actually post.
export default function JobsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/">
            DEAFJOBS
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Browse jobs</h1>
        <p className={styles.intro}>
          Demo listings only, in the New York, New Jersey, and Connecticut area. Every real
          posting on DEAFJOBS carries a commitment card &mdash; accommodations, interview formats,
          and whether the employer has hired Deaf talent before.
        </p>

        <JobsBrowser />

        <p className={styles.footerNote}>
          These are placeholder listings for this demo build. In the full product, jobs are only
          posted once an employer completes the commitment form.
        </p>
      </main>
    </div>
  );
}
