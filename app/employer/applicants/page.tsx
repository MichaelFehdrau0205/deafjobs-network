"use client";

import Link from "next/link";
import { useState } from "react";
import {
  DEMO_EMPLOYER,
  formatDate,
  markViewed,
  useApplications,
  type Application,
} from "../../applications/applications-store";
import { StatusBadge } from "../../applications/status-badge";
import { Thread } from "../../applications/thread";
import { useEmployer } from "../employer-context";
import { MessageDialog } from "./message-dialog";
import employer from "../employer.module.css";
import styles from "./applicants.module.css";

// Everyone who applied to this employer, what state each application is in,
// and a way to reply from ready-made messages. Statuses set here are what
// candidates see on their own dashboard.
export default function ApplicantsPage() {
  const all = useApplications();
  const { commitment } = useEmployer();
  const applicants = all
    .filter((a) => a.company === DEMO_EMPLOYER)
    .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
  const [openId, setOpenId] = useState<string | null>(null);
  const [messaging, setMessaging] = useState<string | null>(null);

  const waiting = applicants.filter((a) => a.status === "applied").length;
  const messagingApp = applicants.find((a) => a.id === messaging) ?? null;

  function toggle(a: Application) {
    const opening = openId !== a.id;
    setOpenId(opening ? a.id : null);
    if (opening) markViewed(a.id);
  }

  return (
    <div className={employer.wide}>
      <h1 className={employer.title}>Applicants</h1>
      <p className={employer.intro}>
        {applicants.length} people have applied to {DEMO_EMPLOYER}.{" "}
        {waiting > 0 ? `${waiting} haven't been opened yet.` : "You've opened every application."}{" "}
        Opening an application marks it Viewed. Replying uses a ready-made message you can edit.
      </p>
      <p className={styles.back}>
        <Link href="/employer">Back to your dashboard</Link>
      </p>

      <ul className={styles.list}>
        {applicants.map((a) => {
          const isOpen = openId === a.id;
          return (
            <li key={a.id} className={styles.row}>
              <div className={styles.rowTop}>
                <div>
                  <p className={styles.name}>{a.candidateName}</p>
                  <p className={styles.meta}>{a.candidateHeadline}</p>
                  <p className={styles.meta}>
                    {a.jobTitle} · Applied {formatDate(a.appliedAt)}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>

              <div className={styles.rowActions}>
                <button
                  type="button"
                  className={styles.linkAction}
                  aria-expanded={isOpen}
                  aria-controls={`detail-${a.id}`}
                  onClick={() => toggle(a)}
                >
                  {isOpen ? "Close application" : "Open application"}
                </button>
                <button type="button" className={styles.primary} onClick={() => setMessaging(a.id)}>
                  {a.thread.length > 0 ? "Send another message" : "Message"}
                </button>
              </div>

              <div id={`detail-${a.id}`} hidden={!isOpen} className={styles.detail}>
                <p className={styles.detailNote}>
                  Video introduction with captions and resume appear here in the full product.
                </p>
                {a.thread.length > 0 ? (
                  <Thread messages={a.thread} viewer="employer" otherName={a.candidateName} />
                ) : (
                  <p className={styles.detailNote}>No messages yet.</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {messagingApp && (
        <MessageDialog
          key={messagingApp.id}
          app={messagingApp}
          formats={commitment.interviewFormats}
          onClose={() => setMessaging(null)}
        />
      )}
    </div>
  );
}
