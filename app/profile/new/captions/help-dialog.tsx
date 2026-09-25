"use client";

import { useRef } from "react";
import styles from "../profile.module.css";

// Small line icons, one per step. Decorative: the words carry the meaning, so
// they are hidden from screen readers. They use currentColor, like the "?".
const ICONS = {
  play: <path d="M8 5.5v13l10-6.5z" />,
  pause: <path d="M9 5.5v13M15 5.5v13" />,
  type: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <path d="M6.5 10h.01M10 10h.01M14 10h.01M17.5 10h.01M7.5 14h9" />
    </>
  ),
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  repeat: (
    <>
      <path d="m17 2.5 3.5 3.5-3.5 3.5" />
      <path d="M3.5 11V10a4 4 0 0 1 4-4h13" />
      <path d="m7 21.5-3.5-3.5L7 14.5" />
      <path d="M20.5 13v1a4 4 0 0 1-4 4h-13" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
};

function StepIcon({ name }: { name: keyof typeof ICONS }) {
  return (
    <span className={styles.stepIcon} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        {ICONS[name]}
      </svg>
    </span>
  );
}

// A round "?" button and the modal it opens. Built on the native <dialog>:
// showModal() makes the page behind inert, Esc closes it, and it announces
// itself as a dialog. Focus wrapping and focus return are done by hand below
// so they don't depend on how a given browser treats them.
export function HelpDialog({ signed = true }: { signed?: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function onKeyDown(e: React.KeyboardEvent<HTMLDialogElement>) {
    if (e.key !== "Tab") return;
    const items = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>("button, [href], input, [tabindex]:not([tabindex='-1'])"),
    );
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.helpButton}
        aria-label={signed ? "How to add captions" : "How to check your captions"}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        {/* Drawn, not typed: looks the same in every browser and font. Uses
            currentColor, so the button's colour states apply to it. */}
        <svg
          className={styles.helpIcon}
          // Cropped tight around the "?" (it spans about x 8-16, y 4-19), so it
          // fills the circle instead of floating in it.
          viewBox="4 3.5 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
          <path d="M12 17.5h.01" />
        </svg>
      </button>

      {/* "close" fires for Esc and for the Close button alike. */}
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="help-title"
        aria-describedby="help-steps"
        onKeyDown={onKeyDown}
        onClose={() => triggerRef.current?.focus()}
      >
        <h2 id="help-title" className={styles.dialogTitle}>
          {signed ? "How to add captions" : "How to check your captions"}
        </h2>
        {/* role="list": list-style is off (the numbers come from CSS), and
            some screen readers drop list semantics when it is. */}
        {signed ? (
        <ol id="help-steps" role="list" className={styles.dialogSteps}>
          <li>
            <StepIcon name="play" />
            <span className={styles.stepText}>Play the video.</span>
          </li>
          <li>
            <StepIcon name="pause" />
            <span className={styles.stepText}>Pause where a sign starts.</span>
          </li>
          <li>
            <StepIcon name="type" />
            <span className={styles.stepText}>Type what you signed.</span>
          </li>
          <li>
            <StepIcon name="plus" />
            <span className={styles.stepText}>Click Add line.</span>
          </li>
          <li>
            <StepIcon name="repeat" />
            <span className={styles.stepText}>Repeat for each new sign.</span>
          </li>
          <li>
            <StepIcon name="check" />
            <span className={styles.stepText}>
              When every sign has a caption, check &ldquo;These captions are
              accurate&rdquo; to continue.
            </span>
          </li>
        </ol>
        ) : (
        <ol id="help-steps" role="list" className={styles.dialogSteps}>
          <li>
            <StepIcon name="play" />
            <span className={styles.stepText}>
              We made a draft from your voice. Click Play from start.
            </span>
          </li>
          <li>
            <StepIcon name="check" />
            <span className={styles.stepText}>Read each line as it appears.</span>
          </li>
          <li>
            <StepIcon name="type" />
            <span className={styles.stepText}>
              A word is wrong? Click Edit on that line and fix it.
            </span>
          </li>
          <li>
            <StepIcon name="plus" />
            <span className={styles.stepText}>
              A line is missing? Pause the video, type it, and click Add line.
            </span>
          </li>
          <li>
            <StepIcon name="check" />
            <span className={styles.stepText}>
              When every line says what you said, check &ldquo;These captions are
              accurate&rdquo; to continue.
            </span>
          </li>
        </ol>
        )}
        <button
          type="button"
          className={styles.button}
          onClick={() => dialogRef.current?.close()}
        >
          Close
        </button>
      </dialog>
    </>
  );
}
