import Link from "next/link";
import { ProfileProvider } from "./profile-context";
import styles from "./profile.module.css";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#main">
        Skip to the form
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/">
            <span className={styles.srOnly}>DEAFJOBS home</span>
            <span aria-hidden="true">DEAFJOBS</span>
          </Link>
          <p className={styles.headerZone}>
            For Deaf &amp; hard of hearing job seekers ·{" "}
            <Link href="/applications">Your applications</Link>
          </p>
        </div>
      </header>
      <main id="main" className={styles.main}>
        <ProfileProvider>{children}</ProfileProvider>
      </main>
    </div>
  );
}
