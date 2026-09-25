"use client";

import { useRef } from "react";
import styles from "../profile.module.css";

// Same idea as the caption step's "?" box (captions/help-dialog.tsx): a round
// button that opens a short, numbered how-to. This one explains recording or
// uploading the video introduction. Built on the native <dialog>, so the page
// behind goes inert and Esc closes it.

// Small line icons, one per step. Decorative: the words carry the meaning.
const ICONS = {
  camera: (
    <>
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h8A2.5 2.5 0 0 1 16 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-8A2.5 2.5 0 0 1 3 15.5z" />
      <path d="m16 10.5 5-2.5v8l-5-2.5" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  hand: (
    <>
      <path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M11 11V5a1.5 1.5 0 0 1 3 0v6" />
      <path d="M14 11V6.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-1a5 5 0 0 1-4-2l-2.5-3.5a1.5 1.5 0 0 1 2.4-1.8L8 15" />
    </>
  ),
  stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
  repeat: (
    <>
      <path d="m17 2.5 3.5 3.5-3.5 3.5" />
      <path d="M3.5 11V10a4 4 0 0 1 4-4h13" />
      <path d="m7 21.5-3.5-3.5L7 14.5" />
      <path d="M20.5 13v1a4 4 0 0 1-4 4h-13" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M4.5 16v2.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V16" />
    </>
  ),
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

export function VideoHelpDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Keep Tab inside the box while it is open.
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
        aria-label="How to record your video"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        <svg
          className={styles.helpIcon}
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

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="video-help-title"
        aria-describedby="video-help-steps"
        onKeyDown={onKeyDown}
        onClose={() => triggerRef.current?.focus()}
      >
        <h2 id="video-help-title" className={styles.dialogTitle}>
          How to record your video
        </h2>
        <ol id="video-help-steps" role="list" className={styles.dialogSteps}>
          <li>
            <StepIcon name="camera" />
            <span className={styles.stepText}>Click Record a video.</span>
          </li>
          <li>
            <StepIcon name="check" />
            <span className={styles.stepText}>
              When your browser asks, click Allow so it can use your camera.
            </span>
          </li>
          <li>
            <StepIcon name="hand" />
            <span className={styles.stepText}>
              Sign or speak, whichever is natural for you. Say who you are and what work you
              want. Up to 2 minutes.
            </span>
          </li>
          <li>
            <StepIcon name="stop" />
            <span className={styles.stepText}>Click Stop when you are done.</span>
          </li>
          <li>
            <StepIcon name="repeat" />
            <span className={styles.stepText}>
              Watch it. Not happy? Record again. You can do it as many times as you like.
            </span>
          </li>
          <li>
            <StepIcon name="upload" />
            <span className={styles.stepText}>
              No camera, or already have a video? Click Upload a video instead.
            </span>
          </li>
          <li>
            <StepIcon name="check" />
            <span className={styles.stepText}>
              Tell us if you signed or spoke, then click Next to add captions.
            </span>
          </li>
        </ol>
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
