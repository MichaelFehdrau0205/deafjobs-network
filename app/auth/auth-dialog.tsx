"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Role } from "./auth-store";
import { trapTab } from "./trap-tab";
import styles from "./auth.module.css";

const CODE_LENGTH = 6;

// Everything that differs between the two sign-in modals. The structure and
// behaviour are shared.
const COPY: Record<Role, { heading: string }> = {
  candidate: { heading: "Sign in to find work." },
  employer: { heading: "Sign in to hire." },
};

// The box opens for someone coming back. A newcomer taps "Start here" to
// switch the same box to a welcome view; both use the same sign-in methods.
const NEW_COPY: Record<Role, { heading: string; note: string }> = {
  candidate: {
    heading: "Welcome. Let\u2019s get started.",
    note: "After you sign in, we\u2019ll help you build your profile.",
  },
  employer: {
    heading: "Welcome. Let\u2019s get you hiring.",
    note: "After you sign in, we\u2019ll start with the four commitment questions.",
  },
};

type Method = "Email" | "Apple" | "Google";
const METHODS: Method[] = ["Email", "Apple", "Google"];

type Props = {
  role: Role;
  open: boolean;
  // Fired when the dialog closes by itself (Esc or the Close button).
  onClose: () => void;
  // Fired once a 6-digit code has been entered. `returning` is true when a
  // candidate said they have been here before (they skip the profile builder).
  onVerified: (returning: boolean) => void;
};

// The dialog is drawn into <body>, not inside the nav it was opened from, so
// screen readers don't read it as part of the navigation. It only exists
// while open, which also gives every opening a fresh start.
export function AuthDialog({ role, open, onClose, onVerified }: Props) {
  if (!open) return null;
  return createPortal(
    <dialog
      // Runs as the dialog is added to the page, before AuthFlow's effects,
      // so focus can move into it straight away.
      ref={(el) => {
        if (el && !el.open) el.showModal();
      }}
      className={`${styles.dialog} ${styles[role]}`}
      aria-labelledby="auth-title"
      onKeyDown={trapTab}
      // "close" fires for Esc and for the Close button alike.
      onClose={onClose}
    >
      <AuthFlow role={role} onVerified={onVerified} />
    </dialog>,
    document.body,
  );
}

function AuthFlow({ role, onVerified }: { role: Role; onVerified: (returning: boolean) => void }) {
  const [step, setStep] = useState<"choose" | "verify">("choose");
  const [method, setMethod] = useState<Method>("Email");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  // Coming back (the default) or new here? Decides where they land.
  const [isNew, setIsNew] = useState(false);

  const firstOptionRef = useRef<HTMLButtonElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  // Focus follows the step: the first option to start, the code box once the
  // code screen shows (the button that was pressed is gone by then).
  useEffect(() => {
    if (step === "verify") codeRef.current?.focus();
    else firstOptionRef.current?.focus();
  }, [step]);

  function choose(m: Method) {
    setMethod(m);
    setCode("");
    setError(null);
    setResent(false);
    setStep("verify");
  }

  function onCodeChange(raw: string) {
    // Pasting "123 456" or "123-456" works: keep the digits, drop the rest.
    // No maxLength on the input, since it would cut a pasted code short
    // before this ran.
    setCode(raw.replace(/\D/g, "").slice(0, CODE_LENGTH));
    setError(/[^\d\s-]/.test(raw) ? "The code is numbers only." : null);
    setResent(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < CODE_LENGTH) {
      setError(
        code.length === 0
          ? "Enter your 6-digit code."
          : `Enter all 6 digits. You have entered ${code.length}.`,
      );
      codeRef.current?.focus();
      return;
    }
    onVerified(!isNew); // demo: any 6 digits are accepted
  }

  function resend() {
    setCode("");
    setError(null);
    setResent(true);
    codeRef.current?.focus();
  }

  return (
    <div className={styles.body}>
      <div className={styles.head}>
        <h2 id="auth-title" className={styles.title}>
          {step === "choose" ? (isNew ? NEW_COPY[role].heading : COPY[role].heading) : "Enter your code."}
        </h2>
        <button
          type="button"
          className={styles.closeButton}
          aria-label="Close"
          onClick={(e) => e.currentTarget.closest("dialog")?.close()}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {step === "choose" ? (
        <div>
          <p className={styles.whoNote}>
            {/* One button whose words change, so keyboard focus stays on it. */}
            <span aria-live="polite">{isNew ? NEW_COPY[role].note : <>New to <strong>DEAFJOBS</strong>?</>}</span>{" "}
            <button type="button" className={styles.textLink} onClick={() => setIsNew((v) => !v)}>
              {isNew ? "Been here before? Sign in." : "Start here."}
            </button>
          </p>
        <div className={styles.options}>
          {METHODS.map((m, i) => (
            <button
              key={m}
              ref={i === 0 ? firstOptionRef : undefined}
              type="button"
              className={styles.option}
              onClick={() => choose(m)}
            >
              Continue with {m}
            </button>
          ))}
        </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <p id="code-hint" className={styles.hint}>
            We sent a 6-digit code to sign you in with {method}. Enter it below.
          </p>

          <label className={styles.label} htmlFor="code">
            6-digit code
          </label>
          {/* One real input does all the work (typing, paste, autofill, screen
              readers). It sits invisibly on top of six boxes that just show
              what has been typed, so nothing depends on six separate fields. */}
          <div className={styles.codeWrap}>
            <input
              ref={codeRef}
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              enterKeyHint="done"
              pattern="[0-9]*"
              className={styles.codeInput}
              value={code}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "code-hint code-error" : "code-hint"}
              onChange={(e) => onCodeChange(e.target.value)}
            />
            <div className={styles.boxes} aria-hidden="true">
              {Array.from({ length: CODE_LENGTH }, (_, i) => (
                <span
                  key={i}
                  className={`${styles.box} ${i === Math.min(code.length, CODE_LENGTH - 1) ? styles.boxActive : ""}`}
                >
                  {code[i] ?? ""}
                </span>
              ))}
            </div>
          </div>

          {error && (
            <p id="code-error" className={styles.error} role="alert">
              <span className={styles.errorIcon} aria-hidden="true">
                !
              </span>
              <span>
                <span className={styles.srOnly}>Error: </span>
                {error}
              </span>
            </p>
          )}

          {/* Stays until they type again. No countdown, no timeout. */}
          <p className={styles.resent} role="status">
            {resent ? "We sent you a new code." : ""}
          </p>

          <button type="submit" className={`${styles.option} ${styles.verify}`}>
            Verify
          </button>

          <div className={styles.linkRow}>
            <button type="button" className={styles.linkButton} onClick={resend}>
              Resend code
            </button>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => setStep("choose")}
            >
              Choose a different way
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
