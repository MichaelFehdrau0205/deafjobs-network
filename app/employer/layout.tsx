import Link from "next/link";
import { SignOutButton } from "../auth/sign-out-button";
import { EmployerProvider } from "./employer-context";
import styles from "./employer.module.css";

// Wraps every /employer/* screen: the commitment form, the dashboard, and
// post-a-role all read and write the same in-tab state (see
// employer-context.tsx), the same way the candidate profile builder shares
// ProfileProvider across its steps.
export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/">
            <span className={styles.srOnly}>DEAFJOBS home</span>
            <span aria-hidden="true">DEAFJOBS</span>
          </Link>
          <ul className={styles.nav}>
            <li>
              <Link href="/employer">Dashboard</Link>
            </li>
            <li>
              <Link href="/employer/applicants">Applicants</Link>
            </li>
            <li>
              <SignOutButton />
            </li>
          </ul>
        </div>
      </header>
      <main className={styles.main}>
        <EmployerProvider>{children}</EmployerProvider>
      </main>
    </div>
  );
}
