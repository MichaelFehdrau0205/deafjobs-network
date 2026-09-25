"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { trapTab } from "../../auth/trap-tab";
import {
  STATUS_LABEL,
  sendMessage,
  type Application,
} from "../../applications/applications-store";
import { TEMPLATES, fillTemplate } from "../../applications/message-templates";
import { Thread } from "../../applications/thread";
import type { InterviewFormat } from "../employer-context";
import styles from "./applicants.module.css";

// How each interview format reads inside a sentence.
const FORMAT_PHRASE: Record<InterviewFormat, string> = {
  "asl-interpreter": "an ASL interpreter",
  "captions-live": "live captions",
  written: "a written or text-based interview",
  "video-captions-on-request": "a video call with captions",
};

function joinPhrases(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")}, or ${items[items.length - 1]}`;
}

// The employer picks a ready-made message, edits it if they like, and sends.
// Sending also moves the application to the matching status, which is what
// the candidate sees on their dashboard.
export function MessageDialog({
  app,
  formats,
  onClose,
}: {
  app: Application;
  formats: InterviewFormat[];
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const firstName = app.candidateName.split(" ")[0];
  const formatText = joinPhrases(
    formats.length > 0
      ? formats.map((f) => FORMAT_PHRASE[f])
      : ["live captions", "a written interview", "an ASL interpreter"],
  );

  const vars = { name: firstName, job: app.jobTitle, company: app.company, formats: formatText };
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [text, setText] = useState(() => fillTemplate(TEMPLATES[0].body, vars));
  const template = TEMPLATES.find((t) => t.id === templateId)!;

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  function choose(id: string) {
    const t = TEMPLATES.find((x) => x.id === id)!;
    setTemplateId(id);
    setText(fillTemplate(t.body, vars));
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(app.id, "employer", text.trim(), template.sets);
    document.querySelector<HTMLDialogElement>("dialog[data-message-dialog]")?.close();
  }

  return createPortal(
    <dialog
      ref={(el) => {
        if (el && !el.open) el.showModal();
      }}
      data-message-dialog
      className={styles.dialog}
      aria-labelledby="message-title"
      onKeyDown={trapTab}
      onClose={onClose}
    >
      <form className={styles.body} onSubmit={send}>
        <div className={styles.head}>
          <h2 id="message-title" className={styles.dialogTitle}>
            Message {app.candidateName}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className={styles.closeButton}
            aria-label="Close"
            onClick={(e) => e.currentTarget.closest("dialog")?.close()}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <p className={styles.dialogSub}>
          {app.jobTitle}. Messages are sent as text, and {firstName} can reply in text.
        </p>

        {app.thread.length > 0 && (
          <div className={styles.threadWrap}>
            <Thread messages={app.thread} viewer="employer" otherName={app.candidateName} />
          </div>
        )}

        <fieldset className={styles.templates}>
          <legend className={styles.legend}>Choose a message</legend>
          {TEMPLATES.map((t) => (
            <label key={t.id} className={`${styles.template} ${templateId === t.id ? styles.templateOn : ""}`}>
              <input
                type="radio"
                name="template"
                value={t.id}
                checked={templateId === t.id}
                onChange={() => choose(t.id)}
              />
              <span>
                <span className={styles.templateLabel}>{t.label}</span>
                <span className={styles.templateHint}>{t.hint}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <label className={styles.legend} htmlFor="message-text">
          Edit before you send
        </label>
        <textarea
          id="message-text"
          className={styles.textarea}
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <p className={styles.effect}>
          Sending marks this application as <strong>{STATUS_LABEL[template.sets]}</strong>.
        </p>

        <div className={styles.dialogActions}>
          <button type="submit" className={styles.primary} disabled={!text.trim()}>
            Send message
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={(e) => e.currentTarget.closest("dialog")?.close()}
          >
            Cancel
          </button>
        </div>
      </form>
    </dialog>,
    document.body,
  );
}
