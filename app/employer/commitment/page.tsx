"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ACCOMMODATIONS } from "../accommodations-data";
import {
  EMPTY_COMMITMENT,
  INTERVIEW_FORMAT_LABELS,
  useEmployer,
  type HasHiredBefore,
  type InterviewFormat,
} from "../employer-context";
import styles from "../employer.module.css";

const HAS_HIRED_OPTIONS: { value: Exclude<HasHiredBefore, "">; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not-sure", label: "Not sure" },
];

const INTERVIEW_FORMATS = Object.keys(INTERVIEW_FORMAT_LABELS) as InterviewFormat[];

// The single highest-leverage screen in the product (PRD §6.5 / PAGES-GOALS):
// four questions, gating the ability to post. Captioning is never listed
// here as a cost to weigh — it's included with every posting, said plainly
// in question 2, next to accommodations that do carry a real price.
export default function CommitmentPage() {
  const router = useRouter();
  const { commitment, saveCommitment } = useEmployer();
  const [draft, setDraft] = useState(
    commitment.signedAt ? commitment : { ...EMPTY_COMMITMENT },
  );
  const [error, setError] = useState<string | null>(null);

  function toggleAccommodation(id: string) {
    setDraft((d) => ({
      ...d,
      accommodationsOffered: d.accommodationsOffered.includes(id)
        ? d.accommodationsOffered.filter((a) => a !== id)
        : [...d.accommodationsOffered, id],
    }));
  }

  function toggleFormat(format: InterviewFormat) {
    setDraft((d) => ({
      ...d,
      interviewFormats: d.interviewFormats.includes(format)
        ? d.interviewFormats.filter((f) => f !== format)
        : [...d.interviewFormats, format],
    }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.hasHiredBefore) {
      setError("Answer question 1 to continue.");
      return;
    }
    if (draft.interviewFormats.length === 0) {
      setError("Choose at least one interview format in question 3.");
      return;
    }
    if (!draft.signedByName.trim() || !draft.signedByRole.trim()) {
      setError("Question 4 needs a name and role — this is who's accountable for it.");
      return;
    }
    setError(null);
    saveCommitment({ ...draft, signedAt: new Date().toISOString() });
    router.push("/employer");
  }

  return (
    <div className={styles.narrow}>
      <h1 className={styles.title}>The commitment</h1>
      <p className={styles.intro}>
        Before you can post a role, we ask four questions. No commitment, no posting — that&rsquo;s
        the whole product. This takes about two minutes.
      </p>

      <form onSubmit={submit} noValidate>
        <div className={styles.question}>
          <span className={styles.questionNumber}>Question 1 of 4</span>
          <p className={styles.questionLabel}>
            Have you employed a Deaf or hard of hearing person before?
          </p>
          <p className={styles.hint}>Any answer is fine — we just want to meet you where you are.</p>
          <div className={styles.radioGroup} role="radiogroup" aria-label="Have you employed a Deaf or hard of hearing person before?">
            {HAS_HIRED_OPTIONS.map((opt) => (
              <label key={opt.value} className={styles.radio}>
                <input
                  type="radio"
                  name="hasHiredBefore"
                  checked={draft.hasHiredBefore === opt.value}
                  onChange={() => setDraft((d) => ({ ...d, hasHiredBefore: opt.value }))}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.question}>
          <span className={styles.questionNumber}>Question 2 of 4</span>
          <p className={styles.questionLabel}>Which accommodations are you prepared to provide?</p>
          <p className={styles.hint}>
            Optional to select any — but here&rsquo;s what they actually cost, not what you might
            assume.
          </p>
          <div className={styles.checkList}>
            <label className={`${styles.checkOption} ${styles.checkOptionChecked}`}>
              <input type="checkbox" checked readOnly disabled aria-label="Live captioning, included with every posting" />
              <span className={styles.checkOptionBody}>
                <span className={styles.checkOptionTitle}>
                  Live captioning
                  <span className={styles.costIncluded}>Included with your posting</span>
                </span>
                <p className={styles.checkOptionDesc}>
                  Active for as long as this posting is open. Not a line item — it&rsquo;s already
                  covered. If you&rsquo;re fluent in ASL yourself, signing directly or texting works
                  too — captioning is there for whenever you&rsquo;re not.
                </p>
              </span>
            </label>
            {ACCOMMODATIONS.map((acc) => {
              const checked = draft.accommodationsOffered.includes(acc.id);
              return (
                <label
                  key={acc.id}
                  className={`${styles.checkOption} ${checked ? styles.checkOptionChecked : ""}`}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggleAccommodation(acc.id)} />
                  <span className={styles.checkOptionBody}>
                    <span className={styles.checkOptionTitle}>
                      {acc.name}
                      <span className={styles.costEstimate}>{acc.monthlyCost}</span>
                    </span>
                    <p className={styles.checkOptionDesc}>{acc.description}</p>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className={styles.question}>
          <span className={styles.questionNumber}>Question 3 of 4</span>
          <p className={styles.questionLabel}>Which interview formats can you offer?</p>
          <p className={styles.hint}>Choose at least one.</p>
          <div className={styles.checkList}>
            {INTERVIEW_FORMATS.map((format) => {
              const checked = draft.interviewFormats.includes(format);
              return (
                <label
                  key={format}
                  className={`${styles.checkOption} ${checked ? styles.checkOptionChecked : ""}`}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggleFormat(format)} />
                  <span className={styles.checkOptionBody}>
                    <span className={styles.checkOptionTitle}>{INTERVIEW_FORMAT_LABELS[format]}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className={styles.question} style={{ marginBottom: "1rem" }}>
          <span className={styles.questionNumber}>Question 4 of 4</span>
          <p className={styles.questionLabel}>Who at your company has agreed to this?</p>
          <p className={styles.hint}>
            A specific name and role, not a department. This is what makes it real.
          </p>
          <div className={styles.row2}>
            <div className={styles.field} style={{ marginBottom: 0 }}>
              <label className={styles.label} htmlFor="signedByName">Name</label>
              <input
                id="signedByName"
                className={styles.input}
                value={draft.signedByName}
                onChange={(e) => setDraft((d) => ({ ...d, signedByName: e.target.value }))}
              />
            </div>
            <div className={styles.field} style={{ marginBottom: 0 }}>
              <label className={styles.label} htmlFor="signedByRole">Role</label>
              <input
                id="signedByRole"
                className={styles.input}
                value={draft.signedByRole}
                onChange={(e) => setDraft((d) => ({ ...d, signedByRole: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {error && (
          <p className={styles.errorText} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.button}>
            Sign and continue
          </button>
        </div>
      </form>
    </div>
  );
}
