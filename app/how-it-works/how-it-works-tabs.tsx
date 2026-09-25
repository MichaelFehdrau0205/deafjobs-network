"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AUDIENCE_LABEL, FAQS, TAB_LABEL, type Audience } from "./how-it-works-data";
import styles from "./how-it-works.module.css";

const ORDER: Audience[] = ["candidates", "employers"];

// One section, two audiences. Tabs switch between the Deaf-candidate and
// employer FAQs; each answer opens in place (native <details>, so it works
// with a keyboard and screen readers without any script).
export function HowItWorksTabs({ initial }: { initial: Audience }) {
  const [active, setActive] = useState<Audience>(initial);
  const tabRefs = useRef<Record<Audience, HTMLButtonElement | null>>({
    candidates: null,
    employers: null,
  });

  function select(next: Audience, focus = false) {
    setActive(next);
    // Keep the address shareable: /how-it-works?for=employers
    try {
      window.history.replaceState(null, "", `?for=${next}`);
    } catch {
      /* address bar not writable: the tab still switches */
    }
    if (focus) tabRefs.current[next]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent, current: Audience) {
    const i = ORDER.indexOf(current);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const step = e.key === "ArrowRight" ? 1 : -1;
      select(ORDER[(i + step + ORDER.length) % ORDER.length], true);
    } else if (e.key === "Home") {
      e.preventDefault();
      select(ORDER[0], true);
    } else if (e.key === "End") {
      e.preventDefault();
      select(ORDER[ORDER.length - 1], true);
    }
  }

  return (
    <div>
      <div className={styles.tabs} role="tablist" aria-label="Who is this for?">
        {ORDER.map((a) => (
          <button
            key={a}
            ref={(el) => {
              tabRefs.current[a] = el;
            }}
            id={`tab-${a}`}
            type="button"
            role="tab"
            aria-selected={active === a}
            aria-controls={`panel-${a}`}
            tabIndex={active === a ? 0 : -1}
            className={`${styles.tab} ${styles[a]} ${active === a ? styles.tabActive : ""}`}
            onClick={() => select(a)}
            onKeyDown={(e) => onKeyDown(e, a)}
          >
            {TAB_LABEL[a]}
          </button>
        ))}
      </div>

      {ORDER.map((a) => (
        <div
          key={a}
          id={`panel-${a}`}
          role="tabpanel"
          aria-labelledby={`tab-${a}`}
          hidden={active !== a}
          className={styles.panel}
        >
          <p className={styles.zone}>{AUDIENCE_LABEL[a]}</p>
          <div className={styles.faqList}>
            {FAQS[a].map((f, i) => (
              <details key={f.q} className={styles.faq} open={i === 0 ? true : undefined}>
                <summary className={styles.question}>{f.q}</summary>
                <div className={styles.answer}>
                  {f.a.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </details>
            ))}
          </div>

          <div className={styles.cta}>
            {a === "candidates" ? (
              <>
                <Link href="/profile/new" className={styles.primary}>
                  Build your profile
                </Link>
                <Link href="/jobs" className={styles.secondary}>
                  Browse jobs
                </Link>
              </>
            ) : (
              <>
                <Link href="/employer" className={styles.primary}>
                  Post a role
                </Link>
                <Link href="/resources" className={styles.secondary}>
                  See accommodation costs
                </Link>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
