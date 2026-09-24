"use client";

import Link from "next/link";
import { FocusHeading } from "../focus-heading";
import { useProfileDraft, formatTime } from "../profile-context";
import styles from "../profile.module.css";

// End of the demo build: a preview of what an employer would see, and
// confirmation that the caption gate did its job. Publishing, skills, and
// communication preferences are out of scope for this build (see
// DEAFJOBS-DEMO-STARTER.md).
export default function ReviewPage() {
  const { basics, video, captions, resume } = useProfileDraft();

  return (
    <>
      <FocusHeading className={styles.title}>Looking good</FocusHeading>
      <p className={styles.intro}>
        Here&rsquo;s what an employer would see so far. In the full product this
        is where you&rsquo;d add your skills and communication preferences next.
      </p>

      <section aria-labelledby="preview-title" className={styles.panel}>
        <h2 id="preview-title" className={styles.panelTitle}>
          {basics.displayName || "Your name"}
        </h2>
        {basics.location && <p className={styles.hint}>{basics.location}</p>}
        {basics.headline && <p className={styles.intro} style={{ margin: "0.5rem 0 0" }}>{basics.headline}</p>}

        {video ? (
          <div style={{ marginTop: "1.25rem" }}>
            <div className={styles.videoFrame}>
              <video
                className={styles.video}
                src={video.url}
                controls
                playsInline
                preload="metadata"
                aria-label="Video introduction"
              />
            </div>
            <p className={styles.hint}>
              {captions.confirmed
                ? `Captions confirmed by the candidate · ${captions.cues.length} line${captions.cues.length === 1 ? "" : "s"}`
                : "Captions not yet confirmed"}
            </p>
            {captions.confirmed && captions.cues.length > 0 && (
              <details className={styles.details}>
                <summary>Read the captions</summary>
                <ol className={styles.transcript}>
                  {captions.cues.map((c) => (
                    <li key={c.id}>
                      <span className={styles.hint}>{formatTime(c.start)} </span>
                      {c.text}
                    </li>
                  ))}
                </ol>
              </details>
            )}
          </div>
        ) : (
          <p className={styles.hint} style={{ marginTop: "1rem" }}>
            No video added.
          </p>
        )}
      </section>

      <section aria-labelledby="resume-title" className={styles.panel}>
        <h2 id="resume-title" className={styles.panelTitle}>
          Resume
        </h2>
        {resume ? (
          <>
            <p className={styles.hint}>{resume.fileName}</p>
            <details className={styles.details}>
              <summary>Read the resume text</summary>
              <p className={styles.transcript} style={{ whiteSpace: "pre-wrap" }}>
                {resume.text}
              </p>
            </details>
          </>
        ) : (
          <p className={styles.hint}>No resume added.</p>
        )}
      </section>

      <div className={styles.actions}>
        <Link className={styles.linkAction} href="/profile/new/video">
          Edit video
        </Link>
        <Link className={styles.linkAction} href="/profile/new/resume">
          Edit resume
        </Link>
        <Link className={styles.linkAction} href="/">
          Back to home
        </Link>
      </div>
    </>
  );
}
