"use client";

import Link from "next/link";
import { useVideoLater } from "../profile/new/video-later-store";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  DEMO_CANDIDATE,
  STATUS_HELP,
  formatDate,
  resetDemoApplications,
  sendMessage,
  useApplications,
  type Application,
  type Status,
} from "./applications-store";
import { StatusBadge } from "./status-badge";
import { Thread } from "./thread";
import styles from "./applications.module.css";

type Filter = "all" | "waiting" | "messages" | "declined";

const FILTERS: { id: Filter; label: string; match: (s: Status) => boolean }[] = [
  { id: "all", label: "All", match: () => true },
  { id: "waiting", label: "Waiting", match: (s) => s === "applied" || s === "viewed" },
  { id: "messages", label: "Messages & interviews", match: (s) => s === "messaged" || s === "interview" },
  { id: "declined", label: "Not a match", match: (s) => s === "declined" },
];


// How the candidate wants to hear back. Saved on this device. The demo saves
// the choice but doesn't send real alerts yet.
const ALERT_KEY = "deafjobs-alert-prefs";
const ALERT_OPTIONS = [
  { id: "text", label: "Text message to my phone" },
  { id: "email", label: "Email" },
  { id: "app", label: "Alert in the app (flash and vibrate)" },
];
const alertListeners = new Set<() => void>();

function readAlerts(): string {
  try {
    return window.localStorage.getItem(ALERT_KEY) ?? "";
  } catch {
    return "";
  }
}
function subscribeAlerts(cb: () => void) {
  alertListeners.add(cb);
  return () => {
    alertListeners.delete(cb);
  };
}
function writeAlerts(ids: string[]) {
  try {
    window.localStorage.setItem(ALERT_KEY, ids.join(","));
  } catch {
    /* storage blocked: the choice just isn't remembered */
  }
  alertListeners.forEach((l) => l());
}

function AlertPreferences() {
  const raw = useSyncExternalStore(subscribeAlerts, readAlerts, () => "");
  const chosen = useMemo(() => raw.split(",").filter(Boolean), [raw]);

  function toggle(id: string) {
    writeAlerts(chosen.includes(id) ? chosen.filter((c) => c !== id) : [...chosen, id]);
  }

  return (
    <fieldset className={styles.alerts}>
      <legend className={styles.alertsLegend}>How do you want to hear from employers?</legend>
      <p className={styles.alertsNote}>
        Optional. Pick any, or none. You can always just check this page.
      </p>
      <div className={styles.alertsOptions}>
        {ALERT_OPTIONS.map((o) => (
          <label key={o.id} className={styles.alertOption}>
            <input
              type="checkbox"
              checked={chosen.includes(o.id)}
              onChange={() => toggle(o.id)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      <p className={styles.alertsSaved} role="status">
        {chosen.length > 0 ? "Saved. Demo only: alerts aren't sent in this build." : ""}
      </p>
    </fieldset>
  );
}

export function ApplicationsDashboard() {
  const all = useApplications();
  const videoLater = useVideoLater();
  const mine = all
    .filter((a) => a.candidateName === DEMO_CANDIDATE)
    .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
  const [filter, setFilter] = useState<Filter>("all");

  const count = (f: Filter) => mine.filter((a) => FILTERS.find((x) => x.id === f)!.match(a.status)).length;
  const shown = mine.filter((a) => FILTERS.find((x) => x.id === filter)!.match(a.status));

  return (
    <div>
      {videoLater && (
        <div className={styles.reminder} role="status">
          <div>
            <p className={styles.reminderTitle}>Add your video introduction</p>
            <p className={styles.reminderText}>
              Your profile is saved without a video. Employers respond most to profiles with one,
              whenever you&rsquo;re ready.
            </p>
          </div>
          <Link href="/profile/new/video" className={styles.reminderLink}>
            Add your video
          </Link>
        </div>
      )}

      <dl className={styles.tiles}>
        <div className={styles.tile}>
          <dt>Applied</dt>
          <dd>{mine.length}</dd>
        </div>
        <div className={styles.tile}>
          <dt>Waiting</dt>
          <dd>{count("waiting")}</dd>
        </div>
        <div className={styles.tile}>
          <dt>Messages &amp; interviews</dt>
          <dd>{count("messages")}</dd>
        </div>
        <div className={styles.tile}>
          <dt>Not a match</dt>
          <dd>{count("declined")}</dd>
        </div>
      </dl>

      <AlertPreferences />

      <div className={styles.filters} role="group" aria-label="Filter applications">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`${styles.chip} ${filter === f.id ? styles.chipOn : ""}`}
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label} ({count(f.id)})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className={styles.empty}>Nothing here yet.</p>
      ) : (
        <ul className={styles.list}>
          {shown.map((a) => (
            <ApplicationCard key={a.id} app={a} />
          ))}
        </ul>
      )}

      <p className={styles.demoNote}>
        Demo data. In this build the applications are examples, and messages sent from the
        employer side show up here.{" "}
        <button type="button" className={styles.linkButton} onClick={resetDemoApplications}>
          Reset the demo
        </button>
      </p>
    </div>
  );
}

function ApplicationCard({ app }: { app: Application }) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);
  const panelId = `thread-${app.id}`;
  const canReply = app.thread.length > 0 && app.status !== "declined";

  function submitReply(e: React.FormEvent) {
    e.preventDefault();
    const text = reply.trim();
    if (!text) return;
    sendMessage(app.id, "candidate", text);
    setReply("");
    setSent(true);
  }

  return (
    <li className={styles.card}>
      <div className={styles.cardTop}>
        <div>
          <p className={styles.jobTitle}>{app.jobTitle}</p>
          <p className={styles.company}>
            {app.company} · Applied {formatDate(app.appliedAt)}
          </p>
        </div>
        <StatusBadge status={app.status} />
      </div>
      <p className={styles.statusHelp}>{STATUS_HELP[app.status]}</p>

      {app.thread.length > 0 && (
        <>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Hide" : "Read"} messages ({app.thread.length})
          </button>
          <div id={panelId} hidden={!open}>
            <Thread messages={app.thread} viewer="candidate" otherName={app.company} />
            {canReply && (
              <form className={styles.replyForm} onSubmit={submitReply}>
                <label className={styles.replyLabel} htmlFor={`reply-${app.id}`}>
                  Your reply
                </label>
                <textarea
                  id={`reply-${app.id}`}
                  className={styles.textarea}
                  rows={3}
                  value={reply}
                  onChange={(e) => {
                    setReply(e.target.value);
                    setSent(false);
                  }}
                />
                <div className={styles.replyActions}>
                  <button type="submit" className={styles.primary} disabled={!reply.trim()}>
                    Send reply
                  </button>
                  <span role="status" className={styles.sentNote}>
                    {sent ? "Reply sent." : ""}
                  </span>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </li>
  );
}
