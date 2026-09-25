"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Progress } from "./progress";
import { useProfileDraft, type Basics } from "./profile-context";
import styles from "./profile.module.css";

type FieldName = "displayName" | "location" | "headline";
type Errors = Partial<Record<FieldName, string>>;

// Plain-language messages: say what to do, with an example where it helps.
const MESSAGES: Record<FieldName, string> = {
  displayName: "Enter the name you want employers to see. A first name is fine.",
  location: "Enter where you live, like a city or town. Example: Austin, TX.",
  headline: "Write one short line about the work you do or want to do.",
};

// Order matches the order on the page, so the summary reads top to bottom.
const FIELD_ORDER: FieldName[] = ["displayName", "location", "headline"];

function validate(v: Basics): Errors {
  const errors: Errors = {};
  for (const name of FIELD_ORDER) {
    if (!v[name].trim()) errors[name] = MESSAGES[name];
  }
  return errors;
}

export function BasicsForm() {
  const router = useRouter();
  const { basics, saveBasics } = useProfileDraft();
  const [values, setValues] = useState<Basics>(basics);
  const [errors, setErrors] = useState<Errors>({});
  // Don't scold people while they're still typing the first time through:
  // errors only appear after they press Next, then update as they fix things.
  const [attempted, setAttempted] = useState(false);
  const [summaryKey, setSummaryKey] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);

  // On a failed "Next", move focus to the summary so keyboard and screen
  // reader users hear what's wrong straight away.
  useEffect(() => {
    if (summaryKey > 0) summaryRef.current?.focus();
  }, [summaryKey]);

  function update(next: Basics) {
    setValues(next);
    if (attempted) setErrors(validate(next));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setAttempted(true);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setSummaryKey((k) => k + 1);
      return;
    }
    saveBasics({
      displayName: values.displayName.trim(),
      location: values.location.trim(),
      headline: values.headline.trim(),
      openToRemote: values.openToRemote,
    });
    router.push("/profile/new/resume");
  }

  function focusField(name: FieldName) {
    document.getElementById(name)?.focus();
  }

  const errorList = FIELD_ORDER.filter((n) => errors[n]);

  return (
    <>
      <Progress current={1} />
      <h1 className={styles.title}>Tell us the basics</h1>
      <p className={styles.intro}>
        This takes about a minute. Employers see your name and headline first.
      </p>

      <form onSubmit={onSubmit} noValidate>
        {errorList.length > 0 && (
          <div
            ref={summaryRef}
            tabIndex={-1}
            className={styles.summary}
            role="alert"
            aria-labelledby="error-summary-title"
          >
            <h2 id="error-summary-title" className={styles.summaryTitle}>
              {errorList.length === 1
                ? "1 thing needs fixing"
                : `${errorList.length} things need fixing`}
            </h2>
            <ul className={styles.summaryList}>
              {errorList.map((name) => (
                <li key={name}>
                  <a
                    href={`#${name}`}
                    onClick={(e) => {
                      e.preventDefault();
                      focusField(name);
                    }}
                  >
                    {errors[name]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <TextField
          id="displayName"
          label="Your name"
          hint="The name employers will see."
          autoComplete="name"
          maxLength={60}
          value={values.displayName}
          error={errors.displayName}
          onChange={(displayName) => update({ ...values, displayName })}
        />

        <TextField
          id="location"
          label="Where you live"
          hint="A city or town is enough. Example: Austin, TX."
          autoComplete="address-level2"
          maxLength={80}
          value={values.location}
          error={errors.location}
          onChange={(location) => update({ ...values, location })}
        />

        <div className={styles.field}>
          <label className={styles.check} htmlFor="openToRemote">
            <input
              id="openToRemote"
              type="checkbox"
              checked={values.openToRemote}
              aria-describedby="openToRemote-hint"
              onChange={(e) => update({ ...values, openToRemote: e.target.checked })}
            />
            <span>
              <span className={styles.checkLabel}>I&rsquo;m open to remote work</span>
              <span id="openToRemote-hint" className={styles.hint}>
                Tick this if you&rsquo;d take a job you can do from home.
              </span>
            </span>
          </label>
        </div>

        <TextField
          id="headline"
          label="Your headline"
          hint="One line about what you do or want to do. Example: Warehouse team lead looking for a logistics role."
          maxLength={100}
          value={values.headline}
          error={errors.headline}
          onChange={(headline) => update({ ...values, headline })}
        />

        <div className={styles.actions}>
          <button type="submit" className={styles.button}>
            Next
          </button>
          <Link className={styles.linkAction} href="/">
            Back to home
          </Link>
        </div>
      </form>
    </>
  );
}

function TextField(props: {
  id: FieldName;
  label: string;
  hint: string;
  error?: string;
  value: string;
  maxLength: number;
  autoComplete?: string;
  onChange: (value: string) => void;
}) {
  const { id, label, hint, error, value, maxLength, autoComplete, onChange } = props;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <p id={hintId} className={styles.hint}>
        {hint}
      </p>
      <input
        id={id}
        name={id}
        type="text"
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        value={value}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${hintId} ${errorId}` : hintId}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <p id={errorId} className={styles.error}>
          <span className={styles.errorIcon} aria-hidden="true">
            !
          </span>
          <span>
            <span className={styles.srOnly}>Error: </span>
            {error}
          </span>
        </p>
      )}
    </div>
  );
}
