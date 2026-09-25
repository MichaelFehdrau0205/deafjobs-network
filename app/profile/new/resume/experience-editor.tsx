"use client";

import { useState } from "react";
import {
  type ExperienceEntry,
  emptyExperience,
  moveItem,
} from "../profile-context";
import styles from "../profile.module.css";

export function ExperienceEditor({
  entries,
  onChange,
}: {
  entries: ExperienceEntry[];
  onChange: (entries: ExperienceEntry[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ExperienceEntry | null>(null);

  function startAdd() {
    const next = emptyExperience();
    setDraft(next);
    setEditingId(next.id);
  }

  function startEdit(entry: ExperienceEntry) {
    setDraft({ ...entry });
    setEditingId(entry.id);
  }

  function cancel() {
    setEditingId(null);
    setDraft(null);
  }

  function save() {
    if (!draft) return;
    const exists = entries.some((e) => e.id === draft.id);
    onChange(exists ? entries.map((e) => (e.id === draft.id ? draft : e)) : [...entries, draft]);
    cancel();
  }

  function remove(id: string) {
    onChange(entries.filter((e) => e.id !== id));
    if (editingId === id) cancel();
  }

  function move(index: number, dir: -1 | 1) {
    onChange(moveItem(entries, index, dir));
  }

  const isAddingNew = editingId !== null && !entries.some((e) => e.id === editingId);

  return (
    <div className={styles.field}>
      <h3 className={styles.sectionTitle} style={{ marginBottom: "0.25rem" }}>
        Experience
      </h3>
      <p className={styles.hint}>
        Optional, but it gives employers a quick sense of where you&rsquo;ve worked.
      </p>

      {entries.map((entry, i) =>
        editingId === entry.id && draft ? (
          <ExperienceForm
            key={entry.id}
            draft={draft}
            setDraft={setDraft}
            onSave={save}
            onCancel={cancel}
          />
        ) : (
          <div className={styles.entryCard} key={entry.id}>
            <div className={styles.entryCardBody}>
              <p className={styles.entryCardTitle}>
                {entry.title || "Untitled role"}
                {entry.company ? ` · ${entry.company}` : ""}
              </p>
              <p className={styles.hint} style={{ margin: 0 }}>
                {entry.startDate || "?"} &ndash; {entry.current ? "Present" : entry.endDate || "?"}
              </p>
              {entry.description && <p className={styles.entryCardDesc}>{entry.description}</p>}
            </div>
            <div className={styles.entryCardActions}>
              <button
                type="button"
                className={styles.iconButton}
                aria-label={`Move ${entry.title || "this role"} up`}
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                className={styles.iconButton}
                aria-label={`Move ${entry.title || "this role"} down`}
                disabled={i === entries.length - 1}
                onClick={() => move(i, 1)}
              >
                ↓
              </button>
              <button type="button" className={styles.linkButton} onClick={() => startEdit(entry)}>
                Edit
              </button>
              <button type="button" className={styles.linkButton} onClick={() => remove(entry.id)}>
                Remove
              </button>
            </div>
          </div>
        ),
      )}

      {isAddingNew && draft && (
        <ExperienceForm draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} />
      )}

      {!isAddingNew && (
        <button type="button" className={styles.chipAddButton} onClick={startAdd}>
          + Add job
        </button>
      )}
    </div>
  );
}

function ExperienceForm({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: ExperienceEntry;
  setDraft: (d: ExperienceEntry) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className={styles.entryForm}>
      <div className={styles.entryFormGrid}>
        <FormField
          label="Job title"
          value={draft.title}
          onChange={(title) => setDraft({ ...draft, title })}
        />
        <FormField
          label="Company"
          value={draft.company}
          onChange={(company) => setDraft({ ...draft, company })}
        />
        <FormField
          label="Start"
          placeholder="2022"
          value={draft.startDate}
          onChange={(startDate) => setDraft({ ...draft, startDate })}
        />
        <FormField
          label="End"
          placeholder="2024"
          value={draft.endDate}
          disabled={draft.current}
          onChange={(endDate) => setDraft({ ...draft, endDate })}
        />
      </div>
      <label className={styles.check} style={{ margin: "0.5rem 0" }}>
        <input
          type="checkbox"
          checked={draft.current}
          onChange={(e) => setDraft({ ...draft, current: e.target.checked, endDate: e.target.checked ? "" : draft.endDate })}
        />
        <span className={styles.checkLabel}>I currently work here</span>
      </label>
      <div className={styles.field} style={{ margin: "0.5rem 0 0" }}>
        <label className={styles.label} htmlFor="exp-description">
          What you did (optional)
        </label>
        <textarea
          id="exp-description"
          className={`${styles.input} ${styles.cueText}`}
          rows={2}
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
      </div>
      <div className={styles.actions} style={{ marginTop: "0.75rem" }}>
        <button type="button" className={styles.button} onClick={onSave}>
          Save
        </button>
        <button type="button" className={styles.linkAction} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function FormField(props: {
  label: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  const { label, value, placeholder, disabled, onChange } = props;
  return (
    <div>
      <label className={styles.label} style={{ fontSize: "0.9rem" }}>
        {label}
      </label>
      <input
        type="text"
        className={styles.input}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
