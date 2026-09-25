"use client";

import Link from "next/link";
import { useState } from "react";
import { ACCOMMODATIONS } from "./accommodations-data";
import { INTERVIEW_FORMAT_LABELS, useEmployer, type JobPosting } from "./employer-context";
import { HOLD_CANDIDATES } from "./hold-candidates-data";
import { PostRoleForm } from "./post-role-form";
import styles from "./employer.module.css";

function accommodationName(id: string) {
  return ACCOMMODATIONS.find((a) => a.id === id)?.name ?? id;
}

// The employer home: commitment status and postings on the left, and a
// right-hand column mirroring how a hiring manager actually works day to
// day — the roles they've posted, and below that, people worth keeping in
// mind for the next opening.
export default function EmployerDashboardPage() {
  const { commitment, postings, closePosting, reopenPosting } = useEmployer();
  const signed = Boolean(commitment.signedAt);
  const [showPostForm, setShowPostForm] = useState(false);
  const [justPublished, setJustPublished] = useState(false);

  return (
    <div className={styles.wide}>
      <h1 className={styles.title}>Employer dashboard</h1>
      <p className={styles.intro}>
        Sign the commitment once, then post roles that carry it automatically.
      </p>

      {!signed ? (
        <div className={styles.card}>
          <p className={styles.cardTitle}>Complete the commitment to start posting.</p>
          <p className={styles.cardText}>
            Four short questions — what you&rsquo;re prepared to offer, and who&rsquo;s
            accountable for it. It gates every posting on DEAFJOBS, including yours.
          </p>
          <div className={styles.actions} style={{ marginTop: 0 }}>
            <Link href="/employer/commitment" className={styles.button}>
              Answer the four questions
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.dashboardGrid}>
          <div>
            <CommitmentSummary />

            {!showPostForm ? (
              <div className={styles.actions} style={{ marginTop: 0 }}>
                <button type="button" className={styles.button} onClick={() => { setShowPostForm(true); setJustPublished(false); }}>
                  Post a role
                </button>
              </div>
            ) : (
              <div className={styles.card}>
                <p className={styles.cardTitle}>Post a role</p>
                <p className={styles.cardText}>
                  This posting carries your commitment automatically — candidates see it before
                  they apply.
                </p>
                <PostRoleForm
                  onPublished={() => {
                    setShowPostForm(false);
                    setJustPublished(true);
                  }}
                  onCancel={() => setShowPostForm(false)}
                />
              </div>
            )}

            {justPublished && (
              <p className={styles.captionNote} role="status">
                Role published — see it under &ldquo;My postings&rdquo; on the right.
              </p>
            )}
          </div>

          <aside className={styles.aside} aria-label="Your postings and candidates on hold">
            <div>
              <h2 className={styles.asideTitle}>My postings</h2>
              {postings.length === 0 ? (
                <p className={styles.empty}>
                  Nothing posted yet. Once you post a role, it&rsquo;ll show up here.
                </p>
              ) : (
                <ul className={styles.postingList}>
                  {postings.map((p) => (
                    <PostingRow key={p.id} posting={p} onClose={closePosting} onReopen={reopenPosting} />
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h2 className={styles.asideTitle}>Considering for later</h2>
              <p className={styles.asideNote}>
                Demo data — illustrating what holding strong candidates for a future opening
                could look like. DEAFJOBS only shows real candidates who&rsquo;ve actually applied.
              </p>
              <ul className={styles.holdList}>
                {HOLD_CANDIDATES.map((c) => (
                  <li key={c.id} className={styles.holdCard}>
                    <p className={styles.holdName}>{c.name}</p>
                    <p className={styles.holdHeadline}>{c.headline}</p>
                    <span className={styles.holdTag}>Considering for {c.consideringFor}</span>
                    <p className={styles.holdNote}>{c.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function CommitmentSummary() {
  const { commitment } = useEmployer();
  const [expanded, setExpanded] = useState(false);
  const hiredLabel =
    commitment.hasHiredBefore === "yes"
      ? "Yes"
      : commitment.hasHiredBefore === "no"
      ? "No"
      : "Not sure";

  return (
    <div className={styles.card}>
      <p className={styles.cardTitle}>Your commitment is signed.</p>
      <dl className={styles.summaryGrid}>
        <dt>Hired Deaf talent before</dt>
        <dd>{hiredLabel}</dd>
        <dt>Signed by</dt>
        <dd>
          {commitment.signedByName} ({commitment.signedByRole})
        </dd>
      </dl>
      <div className={styles.badgeRow}>
        <span className={styles.badge}>Live captioning included</span>
        {commitment.accommodationsOffered.map((id) => (
          <span key={id} className={styles.badge}>
            {accommodationName(id)}
          </span>
        ))}
        {commitment.interviewFormats.map((f) => (
          <span key={f} className={styles.badge}>
            {INTERVIEW_FORMAT_LABELS[f]}
          </span>
        ))}
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.linkAction} onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Hide" : "View"} as candidates will see it
        </button>
      </div>
      {expanded && (
        <p className={styles.cardText} style={{ marginTop: "0.75rem" }}>
          This is the commitment card shown on every one of your postings — accommodations,
          interview formats, and who signed off, so candidates can judge you before they apply.
        </p>
      )}
    </div>
  );
}

function PostingRow({
  posting,
  onClose,
  onReopen,
}: {
  posting: JobPosting;
  onClose: (id: string) => void;
  onReopen: (id: string) => void;
}) {
  const published = posting.status === "published";
  return (
    <li className={styles.posting}>
      <div className={styles.postingMain}>
        <p className={styles.postingTitle}>{posting.title}</p>
        <p className={styles.postingMeta}>
          {posting.location} · {posting.employmentType === "full-time" ? "Full-time" : "Part-time"}
          {posting.remoteType !== "onsite" && " · Remote-friendly"}
        </p>
        <p className={styles.postingMeta}>Closes {posting.closesAt || "—"}</p>
        <p className={styles.postingMeta}>0 applicants so far</p>
      </div>
      <div className={styles.postingSide}>
        <span className={`${styles.statusPill} ${published ? styles.statusPublished : styles.statusClosed}`}>
          {published ? "Published" : "Closed"}
        </span>
        <button
          type="button"
          className={styles.linkAction}
          onClick={() => (published ? onClose(posting.id) : onReopen(posting.id))}
        >
          {published ? "Close" : "Reopen"}
        </button>
      </div>
    </li>
  );
}
