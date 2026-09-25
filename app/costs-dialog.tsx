"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { trapTab } from "./auth/trap-tab";
import { ACCOMMODATIONS } from "./employer/accommodations-data";
import styles from "./commitment-preview.module.css";
import pageStyles from "./page.module.css";

// "What it costs" on the landing page's employer half. Same pattern as the
// commitment preview: a modal a hiring manager can read before signing in.
export function CostsLink() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={triggerRef} type="button" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <span className={pageStyles.full}>What it </span>Costs
      </button>
      {open && (
        <CostsDialog
          onClose={() => {
            setOpen(false);
            triggerRef.current?.focus();
          }}
        />
      )}
    </>
  );
}

// Everything the commitment form prices, plus the two lines that matter most:
// what you pay to post, and that captioning comes with it.
function CostsDialog({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return createPortal(
    <dialog
      ref={(el) => {
        if (el && !el.open) el.showModal();
      }}
      className={styles.dialog}
      aria-labelledby="costs-title"
      onKeyDown={trapTab}
      onClose={onClose}
    >
      <div className={styles.body}>
        <div className={styles.head}>
          <h2 id="costs-title" className={styles.title}>
            What it costs
          </h2>
          <button
            ref={closeRef}
            type="button"
            className={styles.closeButton}
            aria-label="Close"
            onClick={(e) => e.currentTarget.closest("dialog")?.close()}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <p className={styles.intro}>
          The biggest cost managers expect is captioning, and that one comes with your posting.
          The rest run in the tens of dollars a month, not the thousands.
        </p>

        <ul className={styles.costList}>
          <li className={styles.costRow}>
            <p className={styles.costName}>Posting a role</p>
            <p className={styles.costValue}>One-time posting fee</p>
          </li>
          <li className={styles.costRow}>
            <p className={styles.costName}>Live captioning</p>
            <p className={styles.costIncluded}>Included while your posting is open</p>
          </li>
          {ACCOMMODATIONS.map((a) => (
            <li key={a.id} className={styles.costRow}>
              <p className={styles.costName}>{a.name}</p>
              <p className={styles.costValue}>{a.monthlyCost}</p>
            </li>
          ))}
        </ul>

        <p className={styles.costNote}>
          Every accommodation is optional. You choose what you&rsquo;re prepared to provide.
          Captioning stays on for as long as your posting is open, up to 60 days. Keeping it for
          everyday meetings afterward is about $20 a month per seat. Federal law and tax
          credits already cover much of this, so check current rules or ask your accountant.
        </p>

        <div className={styles.actions}>
          <Link href="/employer" className={styles.primary}>
            Post a role
          </Link>
          <Link href="/how-it-works?for=employers" className={styles.secondary}>
            How it works
          </Link>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
