"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { trapTab } from "./auth/trap-tab";
import styles from "./commitment-preview.module.css";

// "The commitment" link on the landing page's employer half opens this
// instead of navigating away — a hiring manager can read the actual four
// questions and the cost-anchoring content (PRD §6.5) before ever signing
// in. Answering for real still happens at /employer/commitment.
export function CommitmentPreviewLink() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={triggerRef} type="button" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        The commitment
      </button>
      {open && (
        <CommitmentPreviewDialog
          onClose={() => {
            setOpen(false);
            triggerRef.current?.focus();
          }}
        />
      )}
    </>
  );
}

function CommitmentPreviewDialog({ onClose }: { onClose: () => void }) {
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
      aria-labelledby="commitment-preview-title"
      onKeyDown={trapTab}
      onClose={onClose}
    >
      <div className={styles.body}>
        <div className={styles.head}>
          <h2 id="commitment-preview-title" className={styles.title}>
            The commitment
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
          Before any employer can post a role, we ask four questions. No commitment, no
          posting &mdash; that&rsquo;s the whole product. Here&rsquo;s exactly what&rsquo;s asked.
        </p>

        <ol className={styles.list}>
          <li className={styles.item}>
            <span className={styles.itemNumber} aria-hidden="true">1</span>
            <div className={styles.itemBody}>
              <p className={styles.itemTitle}>
                Have you employed a Deaf or hard of hearing person before?
              </p>
              <p className={styles.itemText}>Yes, no, or not sure &mdash; every answer is fine.</p>
            </div>
          </li>
          <li className={styles.item}>
            <span className={styles.itemNumber} aria-hidden="true">2</span>
            <div className={styles.itemBody}>
              <p className={styles.itemTitle}>Which accommodations are you prepared to provide?</p>
              <p className={styles.itemText}>
                Real monthly costs shown next to each one &mdash; most run in the tens of
                dollars, not the thousands most managers assume.
              </p>
              <span className={styles.callout}>Live captioning: included with every posting</span>
              <p className={styles.itemText} style={{ marginTop: "0.4rem" }}>
                Fluent in ASL yourself? Signing directly or texting works too &mdash; captioning
                covers you the rest of the time.
              </p>
            </div>
          </li>
          <li className={styles.item}>
            <span className={styles.itemNumber} aria-hidden="true">3</span>
            <div className={styles.itemBody}>
              <p className={styles.itemTitle}>Which interview formats can you offer?</p>
              <p className={styles.itemText}>
                Interpreter provided, live captions, written, or video with captions on request.
              </p>
            </div>
          </li>
          <li className={styles.item}>
            <span className={styles.itemNumber} aria-hidden="true">4</span>
            <div className={styles.itemBody}>
              <p className={styles.itemTitle}>Who at your company has agreed to this?</p>
              <p className={styles.itemText}>
                A specific name and role &mdash; this is what turns a policy into
                accountability. It shows on every posting you make.
              </p>
            </div>
          </li>
        </ol>

        <div className={styles.actions}>
          <Link href="/employer/commitment" className={styles.primary}>
            Answer the four questions
          </Link>
          <button type="button" className={styles.secondary} onClick={(e) => e.currentTarget.closest("dialog")?.close()}>
            Not right now
          </button>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
