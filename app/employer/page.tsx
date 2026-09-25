import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "../auth/sign-out-button";
import styles from "./employer.module.css";

export const metadata: Metadata = {
  title: "Employer dashboard — DEAFJOBS",
};

// A placeholder: employers land here after signing in.
export default function EmployerPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Employer dashboard coming soon.</h1>
        <p className={styles.text}>
          You&rsquo;re signed in as an employer. This is where you&rsquo;ll post
          roles once it&rsquo;s ready.
        </p>
        <div className={styles.actions}>
          <Link className={styles.action} href="/">
            Back to home
          </Link>
          <SignOutButton className={styles.action} />
        </div>
      </div>
    </main>
  );
}
