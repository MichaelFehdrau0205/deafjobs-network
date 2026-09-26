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
  US_STATES,
} from "./profile-context";
import styles from "./profile.module.css";

type FieldName = "displayName" | "street" | "city" | "state" | "zip" | "headline" | "commPreferences";
type Errors = Partial<Record<FieldName, string>>;

// Plain-language messages: say what to do, with an example where it helps.
const MESSAGES: Record<FieldName, string> = {
  displayName: "Enter the name you want employers to see. A first name is fine.",
  street: "Enter your street address, like 123 Main Street.",
  city: "Enter your city.",
  state: "Choose your state.",
  zip: "Enter your 5-digit ZIP code, like 11201.",
  headline: "Write one short line about the work you do or want to do.",
  commPreferences: "Choose at least one option that describes how you communicate.",
};

// Order matches the order on the page, so the summary reads top to bottom.
const FIELD_ORDER: FieldName[] = [
  "displayName",
  "street",
  "city",
  "state",
  "zip",
  "headline",
  "commPreferences",
];

const COMMUTE_OPTIONS: Exclude<CommuteRange, "">[] = ["local", "15", "30", "50", "anywhere"];
const COMM_PREFERENCE_OPTIONS: CommPreference[] = [
  "deaf",
  "hard-of-hearing",
  "asl",
  "english",
  "both",
];

// Adds the dashes as someone types digits: 6469544075 becomes 646-954-4075.
// A leading 1 (the US country code) is dropped, and anything past 10 digits
// is ignored.
function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits[0] === "1") digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function validate(v: Basics): Errors {
  const errors: Errors = {};
  if (!v.displayName.trim()) errors.displayName = MESSAGES.displayName;
  if (!v.street.trim()) errors.street = MESSAGES.street;
  if (!v.city.trim()) errors.city = MESSAGES.city;
  if (!v.state) errors.state = MESSAGES.state;
  if (!/^\d{5}(-\d{4})?$/.test(v.zip.trim())) errors.zip = MESSAGES.zip;
  if (!v.headline.trim()) errors.headline = MESSAGES.headline;
  if (v.commPreferences.length === 0) errors.commPreferences = MESSAGES.commPreferences;
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
      street: values.street.trim(),
      street2: values.street2.trim(),
      city: values.city.trim(),
      zip: values.zip.trim(),
      headline: values.headline.trim(),
      roleInterest: values.roleInterest.trim(),
      salaryAmount: values.salaryAmount.trim(),
    });
    router.push("/profile/new/resume");
  }

  function focusField(name: FieldName) {
    if (name === "commPreferences") {
      document.getElementById(`commPreference-${values.commPreferences[0] ?? COMM_PREFERENCE_OPTIONS[0]}`)?.focus();
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
          autoCapitalize="words"
          label="Your name"
          hint="The name employers will see."
          autoComplete="name"
          maxLength={60}
          value={values.displayName}
          error={errors.displayName}
          onChange={(displayName) => update({ ...values, displayName })}
        />

        <fieldset className={styles.addressGroup}>
          <legend className={styles.label}>Home address</legend>
          <p className={styles.hint}>
            Employers use this to see how far you live from the job.
          </p>

          <TextField
            id="street"
            autoCapitalize="words" autoCorrect="off"
            label="Street address"
            placeholder="123 Main Street"
            autoComplete="address-line1"
            maxLength={100}
            value={values.street}
            error={errors.street}
            onChange={(street) => update({ ...values, street })}
          />
          <TextField
            id="street2"
            autoCapitalize="words" autoCorrect="off"
            label="Apartment, suite or unit (optional)"
            placeholder="Apt 4B"
            autoComplete="address-line2"
            maxLength={60}
            value={values.street2}
            onChange={(street2) => update({ ...values, street2 })}
          />
          <TextField
            id="city"
            autoCapitalize="words" autoCorrect="off"
            label="City"
            placeholder="Brooklyn"
            autoComplete="address-level2"
            maxLength={60}
            value={values.city}
            error={errors.city}
            onChange={(city) => update({ ...values, city })}
          />

          <div className={styles.field}>
            <label className={styles.label} htmlFor="state">
              State
            </label>
            <select
              id="state"
              name="state"
              autoComplete="address-level1"
              className={`${styles.input} ${errors.state ? styles.inputError : ""}`}
              value={values.state}
              aria-invalid={errors.state ? true : undefined}
              aria-describedby={errors.state ? "state-error" : undefined}
              onChange={(e) => update({ ...values, state: e.target.value })}
            >
              <option value="">Choose your state</option>
              {US_STATES.map(([abbr, name]) => (
                <option key={abbr} value={abbr}>
                  {name}
                </option>
              ))}
            </select>
            {errors.state && (
              <p id="state-error" className={styles.error}>
                <span className={styles.errorIcon} aria-hidden="true">
                  !
                </span>
                <span>
                  <span className={styles.srOnly}>Error: </span>
                  {errors.state}
                </span>
              </p>
            )}
          </div>

          <TextField
            id="zip"
            label="ZIP code"
            placeholder="11201"
            autoComplete="postal-code"
            inputMode="numeric"
            maxLength={10}
            value={values.zip}
            error={errors.zip}
            onChange={(zip) => update({ ...values, zip })}
          />
        </fieldset>

        <div className={styles.field}>
          <span className={styles.label}>Phone numbers</span>
          <p className={styles.hint}>
            Optional. Let employers know how to actually reach you by phone.
          </p>

          <div>
            <div className={styles.phoneField}>
              <label className={styles.phoneLabel} htmlFor="vrsPhone">
                Video Relay Service (VRS) number
              </label>
              <p className={styles.hint}>For calls placed through an ASL interpreter.</p>
              <div className={styles.salaryRow}>
                <input
                  id="vrsPhone"
                  name="vrsPhone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className={styles.input}
                  maxLength={20}
                  value={values.vrsPhone}
                  onChange={(e) => update({ ...values, vrsPhone: formatPhone(e.target.value) })}
                />
                <span className={styles.inputSuffix}>VRS</span>
              </div>
            </div>

            <div className={styles.phoneField}>
              <label className={styles.phoneLabel} htmlFor="textOrCallPhone">
                Text or voice call number
              </label>
              <p className={styles.hint}>
                For hard of hearing candidates, or if you&rsquo;d rather take a direct call or text.
              </p>
              <div className={styles.salaryRow}>
                <input
                  id="textOrCallPhone"
                  name="textOrCallPhone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className={styles.input}
                  maxLength={20}
                  value={values.textOrCallPhone}
                  onChange={(e) => update({ ...values, textOrCallPhone: formatPhone(e.target.value) })}
                />
                <div className={styles.segmented} role="group" aria-label="Text or call">
                  {(["text", "call"] as Exclude<typeof values.phoneContactType, "">[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`${styles.segBtn} ${values.phoneContactType === opt ? styles.segBtnActive : ""}`}
                      aria-pressed={values.phoneContactType === opt}
                      onClick={() =>
                        update({
                          ...values,
                          phoneContactType: values.phoneContactType === opt ? "" : opt,
                        })
                      }
                    >
                      {opt === "text" ? "Text" : "Call"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

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
              autoCapitalize="words"
              autoCorrect="off"
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
            Pick all that apply. This helps employers know how to set up your interview and the job itself.
          </p>
          {COMM_PREFERENCE_OPTIONS.map((opt) => (
            <label className={styles.radio} htmlFor={`commPreference-${opt}`} key={opt}>
              <input
                id={`commPreference-${opt}`}
                type="checkbox"
                name="commPreference"
                checked={values.commPreferences.includes(opt)}
                aria-describedby="commPreference-hint"
                onChange={(e) =>
                  update({
                    ...values,
                    commPreferences: e.target.checked
                      ? [...values.commPreferences, opt]
                      : values.commPreferences.filter((c) => c !== opt),
                  })
                }
              />
              <span>{COMM_PREFERENCE_LABELS[opt]}</span>
            </label>
          ))}
          {errors.commPreferences && (
            <p className={styles.error}>
              <span className={styles.errorIcon} aria-hidden="true">
                !
              </span>
              <span>
                <span className={styles.srOnly}>Error: </span>
                {errors.commPreferences}
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
  hint?: string;
  placeholder?: string;
  error?: string;
  value: string;
  maxLength: number;
  autoComplete?: string;
  inputMode?: "numeric";
  autoCapitalize?: "words" | "none" | "sentences";
  autoCorrect?: "off" | "on";
  onChange: (value: string) => void;
}) {
  const { id, label, hint, placeholder, error, value, maxLength, autoComplete, inputMode, autoCapitalize, autoCorrect, onChange } = props;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      <input
        id={id}
        name={id}
        type="text"
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        value={value}
        maxLength={maxLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        aria-required={error !== undefined ? "true" : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? (hint ? `${hintId} ${errorId}` : errorId) : hint ? hintId : undefined
        }
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
