"use client";

import { useState } from "react";
import { useEmployer, type EmploymentType, type RemoteType } from "./employer-context";
import styles from "./employer.module.css";

// Closing date is required and capped at 60 days out (PAGES-GOALS: without a
// cap, an open-forever posting is a free captioning subscription).
const MAX_DAYS_OPEN = 60;

function maxCloseDate() {
  const d = new Date();
  d.setDate(d.getDate() + MAX_DAYS_OPEN);
  return d.toISOString().slice(0, 10);
}

// The post-a-role form itself, shared by the standalone /employer/jobs/new
// page and the inline panel on the dashboard. `onPublished` fires once the
// posting is added; `onCancel` is optional (the dashboard uses it to close
// the inline panel without publishing).
export function PostRoleForm({
  onPublished,
  onCancel,
}: {
  onPublished: () => void;
  onCancel?: () => void;
}) {
  const { addPosting } = useEmployer();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [remoteType, setRemoteType] = useState<RemoteType>("onsite");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("full-time");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [closesAt, setClosesAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s]);
    setSkillInput("");
  }

  function removeSkill(s: string) {
    setSkills((prev) => prev.filter((x) => x !== s));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) {
      setError("Title, description, and location are all required.");
      return;
    }
    if (!salaryMin.trim() || !salaryMax.trim()) {
      setError("Salary range is required — not a nudge, a required field.");
      return;
    }
    if (!closesAt) {
      setError("Pick a closing date, up to 60 days out.");
      return;
    }
    setError(null);
    addPosting({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      remoteType,
      employmentType,
      salaryMin: salaryMin.trim(),
      salaryMax: salaryMax.trim(),
      requiredSkills: skills,
      closesAt,
    });
    onPublished();
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="title">Job title</label>
        <input id="title" className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="description">Description</label>
        <textarea
          id="description"
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="location">Location</label>
          <input
            id="location"
            className={styles.input}
            placeholder="e.g. Brooklyn, NY"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="remoteType">Remote type</label>
          <select
            id="remoteType"
            className={styles.select}
            value={remoteType}
            onChange={(e) => setRemoteType(e.target.value as RemoteType)}
          >
            <option value="onsite">On-site</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Employment type</span>
        <div className={styles.radioGroup} role="radiogroup" aria-label="Employment type">
          <label className={styles.radio}>
            <input
              type="radio"
              name="employmentType"
              checked={employmentType === "full-time"}
              onChange={() => setEmploymentType("full-time")}
            />
            Full-time
          </label>
          <label className={styles.radio}>
            <input
              type="radio"
              name="employmentType"
              checked={employmentType === "part-time"}
              onChange={() => setEmploymentType("part-time")}
            />
            Part-time
          </label>
        </div>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Salary range</span>
        <p className={styles.hint}>Required. Refusing to post a range is itself a signal.</p>
        <div className={styles.row2}>
          <input
            aria-label="Minimum salary"
            className={styles.input}
            inputMode="numeric"
            placeholder="Min, e.g. 45000"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value.replace(/[^\d]/g, ""))}
          />
          <input
            aria-label="Maximum salary"
            className={styles.input}
            inputMode="numeric"
            placeholder="Max, e.g. 55000"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value.replace(/[^\d]/g, ""))}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="skillInput">Required skills</label>
        <div className={styles.chipInputRow}>
          <input
            id="skillInput"
            className={styles.input}
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
          />
          <button type="button" className={styles.chipAddButton} onClick={addSkill}>
            Add
          </button>
        </div>
        {skills.length > 0 && (
          <ul className={styles.chipList}>
            {skills.map((s) => (
              <li key={s} className={styles.chip}>
                {s}
                <button
                  type="button"
                  className={styles.chipRemove}
                  aria-label={`Remove ${s}`}
                  onClick={() => removeSkill(s)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="closesAt">Closing date</label>
        <p className={styles.hint}>Up to 60 days out — captioning is active for as long as this posting is open.</p>
        <input
          id="closesAt"
          type="date"
          className={styles.input}
          style={{ maxWidth: "12rem" }}
          min={new Date().toISOString().slice(0, 10)}
          max={maxCloseDate()}
          value={closesAt}
          onChange={(e) => setClosesAt(e.target.value)}
        />
      </div>

      <p className={styles.captionNote}>
        Live captioning is included and active for as long as this posting stays open.
      </p>

      {error && (
        <p className={styles.errorText} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        <button type="submit" className={styles.button}>
          Publish role
        </button>
        {onCancel && (
          <button type="button" className={styles.buttonSecondary} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
