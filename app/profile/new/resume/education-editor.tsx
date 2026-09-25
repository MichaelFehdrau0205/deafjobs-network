"use client";

import { useState } from "react";
import {
  type EducationEntry,
  emptyEducation,
  moveItem,
} from "../profile-context";
import styles from "../profile.module.css";

export function EducationEditor({
  entries,
  onChange,
}: {
  entries: EducationEntry[];
  onChange: (entries: EducationEntry[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EducationEntry | null>(null);

  function startAdd() {
    const next = emptyEducation();
    setDraft(next);
    setEditingId(next.id);
  }

  function startEdit(entry: EducationEntry) {
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
        Education
      </h3>
      <p className={styles.hint}>Optional.</p>

      {entries.map((entry, i) =>
        editingId === entry.id && draft ? (
          <EducationForm key={entry.id} draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} />
        ) : (
          <div className={styles.entryCard} key={entry.id}>
            <div className={styles.entryCardBody}>
              <p className={styles.entryCardTitle}>{entry.school || "Untitled school"}</p>
              <p className={styles.hint} style={{ margin: 0 }}>
                {[entry.degree, entry.field].filter(Boolean).join(", ")}
                {(entry.startYear || entry.endYear) &&
                  ` · ${entry.startYear || "?"}–${entry.endYear || "?"}`}
              </p>
            </div>
            <div className={styles.entryCardActions}>
              <button
                type="button"
                className={styles.iconButton}
                aria-label={`Move ${entry.school || "this school"} up`}
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                className={styles.iconButton}
                aria-label={`Move ${entry.school || "this school"} down`}
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
        <EducationForm draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} />
      )}

      {!isAddingNew && (
        <button type="button" className={styles.chipAddButton} onClick={startAdd}>
          + Add school
        </button>
      )}
    </div>
  );
}

function EducationForm({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: EducationEntry;
  setDraft: (d: EducationEntry) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className={styles.entryForm}>
      <div className={styles.entryFormGrid}>
        <FormField label="School" value={draft.school} onChange={(school) => setDraft({ ...draft, school })} />
        <FormField
          label="Degree"
          placeholder="AA, BFA, Certificate…"
          value={draft.degree}
          onChange={(degree) => setDraft({ ...draft, degree })}
        />
        <FormField label="Field of study" value={draft.field} onChange={(field) => setDraft({ ...draft, field })} />
        <FormField
          label="Start year"
          placeholder="2020"
          value={draft.startYear}
          onChange={(startYear) => setDraft({ ...draft, startYear })}
        />
        <FormField
          label="End year"
          placeholder="2022"
          value={draft.endYear}
          onChange={(endYear) => setDraft({ ...draft, endYear })}
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

function FormField(props: { label: string; value: string; placeholder?: string; onChange: (v: string) => void }) {
  const { label, value, placeholder, onChange } = props;
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
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
