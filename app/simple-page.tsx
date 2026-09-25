import Link from "next/link";
import styles from "./simple-page.module.css";

export type ShellLink = { href: string; label: string };

// Header + page frame shared by the standalone content pages.
export function SimplePage({
  links,
  children,
}: {
  links?: ShellLink[];
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#main">
        Skip to the content
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/">
            <span style={SR_ONLY}>DEAFJOBS home</span>
            <span aria-hidden="true">DEAFJOBS</span>
          </Link>
          {links && (
            <nav aria-label="Page navigation">
              <ul className={styles.nav}>
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </header>
      <main id="main" className={styles.main}>
        {children}
      </main>
    </div>
  );
}

const SR_ONLY: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
  border: 0,
};
