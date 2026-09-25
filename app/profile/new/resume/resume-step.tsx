"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FocusHeading } from "../focus-heading";
import { Progress } from "../progress";
import { useProfileDraft } from "../profile-context";
import styles from "../profile.module.css";

const MAX_MB = 10;
const ACCEPT = ".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type Status = "idle" | "reading" | "error";

export function ResumeStep() {
  const router = useRouter();
  const { video, resume, saveResume } = useProfileDraft();

  const [status, setStatus] = useState<Status>("idle");
  const [problem, setProblem] = useState<string | null>(null);
  const [text, setText] = useState(resume?.text ?? "");
  const [fileName, setFileName] = useState(resume?.fileName ?? "");
  const [emptyError, setEmptyError] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const textHeadingRef = useRef<HTMLHeadingElement>(null);
  // Guards against a slow, earlier upload finishing after a later one and
  // overwriting its result — e.g. retry-after-failure, or the dev server
  // restarting mid-request. Only the most recent upload is allowed to
  // touch state; anything older is dropped when it resolves.
  const requestIdRef = useRef(0);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let them pick the same file again
    if (!file) return;

    const requestId = ++requestIdRef.current;
    setProblem(null);
    setEmptyError(false);

    if (file.size > MAX_MB * 1024 * 1024) {
      setProblem(`That file is bigger than ${MAX_MB} MB. Try a smaller file.`);
      requestAnimationFrame(() => problemRef.current?.focus());
      return;
    }

    setStatus("reading");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/parse-resume", { method: "POST", body });
      const data = await res.json();
      if (requestId !== requestIdRef.current) return; // a newer upload already won

      if (!res.ok) {
        setProblem(data.error || "That file couldn't be read. Try a different one.");
        setStatus("error");
        requestAnimationFrame(() => problemRef.current?.focus());
        return;
      }
      setText(data.text);
      setFileName(data.fileName);
      saveResume({ text: data.text, fileName: data.fileName });
      setStatus("idle");
      requestAnimationFrame(() => textHeadingRef.current?.focus());
    } catch {
      if (requestId !== requestIdRef.current) return; // a newer upload already won
      setProblem("That upload didn't go through. Check your connection and try again.");
      setStatus("error");
      requestAnimationFrame(() => problemRef.current?.focus());
    }
  }

  function removeResume() {
    saveResume(null);
    setText("");
    setFileName("");
    setEmptyError(false);
  }

  function onTextChange(next: string) {
    setText(next);
    if (fileName) saveResume({ text: next, fileName });
    if (next.trim()) setEmptyError(false);
  }

  function onContinue(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      setEmptyError(true);
      requestAnimationFrame(() => problemRef.current?.focus());
      return;
    }
    saveResume({ text: text.trim(), fileName: fileName || "Resume" });
    router.push("/profile/new/review");
  }

  return (
    <>
      <Progress current={4} />
      <FocusHeading className={styles.title}>Add your resume</FocusHeading>
      <p className={styles.intro}>
        Upload a PDF or Word file and we&rsquo;ll pull out the text for you to check.
        Nothing is guessed or reformatted &mdash; fix anything that came through wrong
        before you continue.
      </p>

      {(problem || emptyError) && (
        <div ref={problemRef} tabIndex={-1} className={styles.summary} role="alert">
          <p className={styles.summaryTitle}>
            {emptyError ? "1 thing needs fixing" : "That didn’t work"}
          </p>
          <p className={styles.summaryText}>
            {emptyError
              ? "Add your resume text, or upload a file, before continuing."
              : problem}
          </p>
        </div>
      )}

      {!fileName && !text && (
        <div className={styles.choices}>
          <button
            type="button"
            className={styles.button}
            onClick={() => fileRef.current?.click()}
            disabled={status === "reading"}
          >
            {status === "reading" ? "Reading your file…" : "Upload your resume"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            className={styles.srOnly}
            tabIndex={-1}
            aria-hidden="true"
            onChange={onFile}
          />
        </div>
      )}

      {(fileName || text) && (
        <section aria-labelledby="resume-text-title">
          <div className={styles.cueHead}>
            <h2 id="resume-text-title" ref={textHeadingRef} tabIndex={-1} className={styles.sectionTitle}>
              {fileName || "Your resume text"}
            </h2>
          </div>
          <label className={styles.label} htmlFor="resume-text">
            Check the text below
            <span className={styles.srOnly}>: fix anything that came through wrong</span>
          </label>
          <p className={styles.hint}>
            Pulled straight from your file. Line breaks and spacing may look different
            than the original &mdash; fix any words that came through wrong.
          </p>
          <textarea
            id="resume-text"
            className={`${styles.input} ${styles.cueText}`}
            style={{ minHeight: "16rem" }}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
          />
          <button type="button" className={styles.linkButton} onClick={removeResume}>
            Remove and upload a different file
          </button>
        </section>
      )}

      <form onSubmit={onContinue}>
        <div className={styles.actions}>
          <button type="submit" className={styles.button}>
            Next: review
          </button>
          {/* No video means the captions step was skipped, so go back past it. */}
          <Link
            className={styles.linkAction}
            href={video ? "/profile/new/captions" : "/profile/new/video"}
          >
            Back
          </Link>
        </div>
      </form>
    </>
  );
}
