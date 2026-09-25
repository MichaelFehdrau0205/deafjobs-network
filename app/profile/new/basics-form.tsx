"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Progress } from "./progress";
import {
  useProfileDraft,
  type Basics,
  type CommuteRange,
  type CommPreference,
  type SalaryType,
  COMMUTE_LABELS,
  COMM_PREFERENCE_LABELS,
} from "./profile-context";
import styles from "./profile.module.css";

type FieldName = "displayName" | "homeAddress" | "headline" | "commPreference";
type Errors = Partial<Record<FieldName, string>>;

// Plain-language messages: say what to do, with an example where it helps.
const MESSAGES: Record<FieldName, string> = {
  displayName: "Enter the name you want employers to see. A first name is fine.",
  homeAddress: "Enter where you live, like a city and state, or a full address.",
  headline: "Write one short line about the work you do or want to do.",
  commPreference: "Choose the option that best describes how you communicate.",
};

// Order matches the order on the page, so the summary reads top to bottom.
const FIELD_ORDER: FieldName[] = ["displayName", "homeAddress", "headline", "commPreference"];

const COMMUTE_OPTIONS: Exclude<CommuteRange, "">[] = ["local", "15", "30", "50", "anywhere"];
const COMM_PREFERENCE_OPTIONS: Exclude<CommPreference, "">[] = [
  "deaf",
  "hard-of-hearing",
  "asl",
  "english",
  "both",
];

function validate(v: Basics): Errors {
  const errors: Errors = {};
  if (!v.displayName.trim()) errors.displayName = MESSAGES.displayName;
  if (!v.homeAddress.trim()) errors.homeAddress = MESSAGES.homeAddress;
  if (!v.headline.trim()) errors.headline = MESSAGES.headline;
  if (!v.commPreference) errors.commPreference = MESSAGES.commPreference;
  return errors;
}

export function BasicsForm() {
  const router = useRouter();
  const { basics, saveBasics } = useProfileDraft();
  const [values, setValues] = useState<Basics>(basics);
  const [locationDraft, setLocationDraft] = useState("");
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

  function addWorkLocation() {
    const v = locationDraft.trim();
    if (!v) return;
    if (values.workLocations.includes(v)) {
      setLocationDraft("");
      return;
    }
    update({ ...values, workLocations: [...values.workLocations, v] });
    setLocationDraft("");
  }

  function removeWorkLocation(loc: string) {
    update({ ...values, workLocations: values.workLocations.filter((l) => l !== loc) });
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
      ...values,
      displayName: values.displayName.trim(),
      homeAddress: values.homeAddress.trim(),
      headline: values.headline.trim(),
      roleInterest: values.roleInterest.trim(),
      salaryAmount: values.salaryAmount.trim(),
    });
    router.push("/profile/new/resume");
  }

  function focusField(name: FieldName) {
    if (name === "commPreference") {
      document.getElementById(`commPreference-${values.commPreference || COMM_PREFERENCE_OPTIONS[0]}`)?.focus();
      return;
    }
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
          id="homeAddress"
          label="Home address"
          hint="A city and state is enough, or a full address if you'd rather. Example: Brooklyn, NY."
          autoComplete="street-address"
          maxLength={120}
          value={values.homeAddress}
          error={errors.homeAddress}
          onChange={(homeAddress) => update({ ...values, homeAddress })}
        />

        <TextField
          id="roleInterest"
          label="What roles are you interested in?"
          hint="Optional. Example: Warehouse lead, front-desk coordinator, data entry."
          maxLength={120}
          value={values.roleInterest}
          onChange={(roleInterest) => update({ ...values, roleInterest })}
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

        <div className={styles.field}>
          <label className={styles.label} htmlFor="work-location-draft">
            Where would you like to work?
          </label>
          <p className={styles.hint}>
            Add as many cities or areas as you want. Example: Brooklyn, NY.
          </p>
          <div className={styles.chipInputRow}>
            <input
              id="work-location-draft"
              type="text"
              className={styles.input}
              value={locationDraft}
              maxLength={80}
              placeholder="Add a city or area"
              onChange={(e) => setLocationDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addWorkLocation();
                }
              }}
            />
            <button type="button" className={styles.chipAddButton} onClick={addWorkLocation}>
              Add
            </button>
          </div>
          {values.workLocations.length > 0 && (
            <ul className={styles.chipList}>
              {values.workLocations.map((loc) => (
                <li key={loc} className={styles.chip}>
                  <span>{loc}</span>
                  <button
                    type="button"
                    className={styles.chipRemove}
                    aria-label={`Remove ${loc}`}
                    onClick={() => removeWorkLocation(loc)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="commuteRange">
            How far can you commute?
          </label>
          <p className={styles.hint}>Optional. Pick whichever is closest.</p>
          <select
            id="commuteRange"
            className={styles.input}
            value={values.commuteRange}
            onChange={(e) => update({ ...values, commuteRange: e.target.value as CommuteRange })}
          >
            <option value="">No preference</option>
            {COMMUTE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {COMMUTE_LABELS[opt]}
              </option>
            ))}
          </select>
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

        <fieldset className={styles.fieldset}>
          <legend className={styles.label}>How do you communicate?</legend>
          <p className={styles.hint} id="commPreference-hint">
            This helps employers know how to set up your interview and the job itself.
          </p>
          {COMM_PREFERENCE_OPTIONS.map((opt) => (
            <label className={styles.radio} htmlFor={`commPreference-${opt}`} key={opt}>
              <input
                id={`commPreference-${opt}`}
                type="radio"
                name="commPreference"
                checked={values.commPreference === opt}
                aria-describedby="commPreference-hint"
                onChange={() => update({ ...values, commPreference: opt })}
              />
              <span>{COMM_PREFERENCE_LABELS[opt]}</span>
            </label>
          ))}
          {errors.commPreference && (
            <p className={styles.error}>
              <span className={styles.errorIcon} aria-hidden="true">
                !
              </span>
              <span>
                <span className={styles.srOnly}>Error: </span>
                {errors.commPreference}
              </span>
            </p>
          )}
        </fieldset>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="salaryAmount">
            Salary preference
          </label>
          <p className={styles.hint}>Optional. Type a number, then pick hourly or yearly.</p>
          <div className={styles.salaryRow}>
            <input
              id="salaryAmount"
              type="text"
              inputMode="numeric"
              className={styles.input}
              placeholder={values.salaryType === "yearly" ? "e.g. 55000" : "e.g. 22"}
              value={values.salaryAmount}
              onChange={(e) => update({ ...values, salaryAmount: e.target.value.replace(/[^\d.]/g, "") })}
            />
            <div className={styles.segmented} role="group" aria-label="Hourly or yearly">
              {(["hourly", "yearly"] as Exclude<SalaryType, "">[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`${styles.segBtn} ${values.salaryType === opt ? styles.segBtnActive : ""}`}
                  aria-pressed={values.salaryType === opt}
                  onClick={() => update({ ...values, salaryType: values.salaryType === opt ? "" : opt })}
                >
                  {opt === "hourly" ? "/ hour" : "/ year"}
                </button>
              ))}
            </div>
          </div>
        </div>

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
  id: string;
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
        aria-required={error !== undefined ? "true" : undefined}
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
