"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FocusHeading } from "../focus-heading";
import { Progress } from "../progress";
import {
  activeCueIndex,
  formatTime,
  speakTime,
  useProfileDraft,
  type Cue,
} from "../profile-context";
import styles from "../profile.module.css";

let nextId = 0;
const newId = () => `cue-${Date.now()}-${nextId++}`;

// Demo only: stands in for speech-to-text. It has two wrong words on purpose
// ("where house", "roll") so the review step has something real to catch.
function draftFor(name: string, duration: number): Cue[] {
  const lines = [
    `Hi, I'm ${name || "Sam"}.`,
    "I've worked in a where house for six years.",
    "Right now I lead a team of twelve on the night shift.",
    "I'm good at keeping things organized and training new people.",
    "I'm looking for a roll where I can grow into logistics.",
  ];
  // Spread the lines across the video so they line up roughly.
  const span = duration > 1 ? duration : 20;
  const step = span / lines.length;
  return lines.map((text, i) => ({
    id: newId(),
    start: Number((i * step).toFixed(1)),
    text,
  }));
}

const sortCues = (cues: Cue[]) => [...cues].sort((a, b) => a.start - b.start);

export function CaptionsStep() {
  const router = useRouter();
  const { basics, video, captions, saveCaptions } = useProfileDraft();

  const [cues, setCues] = useState<Cue[]>(() => {
    if (!video?.mode) return [];
    if (captions.forMode === video.mode && captions.cues.length) return captions.cues;
    return video.mode === "spoke"
      ? draftFor(basics.displayName, video.duration)
      : [{ id: newId(), start: 0, text: "" }];
  });
  const [confirmed, setConfirmed] = useState(captions.confirmed);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(video?.duration ?? 0);
  const [playing, setPlaying] = useState(false);
  const [errors, setErrors] = useState<{ empty?: string[]; confirm?: boolean }>({});
  const [announce, setAnnounce] = useState("");
  const [summaryKey, setSummaryKey] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (summaryKey > 0) summaryRef.current?.focus();
  }, [summaryKey]);

  // Video is required, so there's nothing to caption without one — send the
  // candidate back rather than offering a way around it.
  if (!video || !video.mode) {
    router.replace("/profile/new/video");
    return null;
  }

  const signed = video.mode === "signed";
  const active = activeCueIndex(cues, time);
  const end = duration || video.duration;

  function seek(t: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(t, end || t));
    setTime(v.currentTime);
  }

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }

  function update(id: string, patch: Partial<Cue>) {
    setCues((cs) => {
      const next = cs.map((c) => (c.id === id ? { ...c, ...patch } : c));
      return patch.start !== undefined ? sortCues(next) : next;
    });
    if (errors.empty && patch.text?.trim()) {
      setErrors((e) => ({ ...e, empty: e.empty?.filter((x) => x !== id) }));
    }
  }

  function setStart(id: string, start: number, label: number) {
    const clamped = Number(Math.max(0, Math.min(start, end || start)).toFixed(1));
    update(id, { start: clamped });
    setAnnounce(`Line ${label} now starts at ${speakTime(clamped)}.`);
  }

  function addLine() {
    const start = Number(time.toFixed(1));
    const cue = { id: newId(), start, text: "" };
    setCues((cs) => sortCues([...cs, cue]));
    videoRef.current?.pause();
    setAnnounce(`New line added at ${speakTime(start)}.`);
    requestAnimationFrame(() => document.getElementById(`${cue.id}-text`)?.focus());
  }

  function removeLine(id: string, label: number) {
    const idx = cues.findIndex((c) => c.id === id);
    setCues((cs) => cs.filter((c) => c.id !== id));
    setAnnounce(`Line ${label} removed.`);
    // Keep focus somewhere sensible: the line that took its place, or Add.
    requestAnimationFrame(() => {
      const after = cues[idx + 1] ?? cues[idx - 1];
      const target = after
        ? document.getElementById(`${after.id}-text`)
        : document.getElementById("add-line");
      target?.focus();
    });
  }

  function onContinue(e: React.FormEvent) {
    e.preventDefault();
    const empty = cues.filter((c) => !c.text.trim()).map((c) => c.id);
    const found = {
      empty: empty.length || cues.length === 0 ? empty : undefined,
      confirm: !confirmed || undefined,
    };
    if (found.empty || found.confirm) {
      setErrors(found);
      setSummaryKey((k) => k + 1);
      return;
    }
    saveCaptions({
      cues: cues.map((c) => ({ ...c, text: c.text.trim() })),
      confirmed: true,
      forMode: video!.mode,
    });
    router.push("/profile/new/resume");
  }

  const problems: { href: string; text: string }[] = [];
  if (errors.empty) {
    if (cues.length === 0) problems.push({ href: "#add-line", text: "Add at least one caption line." });
    errors.empty.forEach((id) => {
      const n = cues.findIndex((c) => c.id === id) + 1;
      if (n > 0) problems.push({ href: `#${id}-text`, text: `Line ${n} is empty. Write it, or remove it.` });
    });
  }
  if (errors.confirm)
    problems.push({ href: "#confirm", text: "Tick the box to confirm your captions are accurate." });

  return (
    <>
      <Progress current={3} />
      <FocusHeading className={styles.title}>
        {signed ? "Write your captions" : "Check your captions"}
      </FocusHeading>
      <p className={styles.intro}>
        {signed ? (
          <>
            Employers who don&rsquo;t sign will read these words. You decide how your
            signing reads in English. Play the video and write what you said, line by
            line.
          </>
        ) : (
          <>
            We made a draft from your voice. Auto-captions get about 1 word in 10
            wrong, so play the video and fix anything that isn&rsquo;t what you said.
          </>
        )}
      </p>

      <p className={styles.srOnly} role="status" aria-live="polite">
        {announce}
      </p>

      <form onSubmit={onContinue} noValidate>
        {problems.length > 0 && (
          <div
            ref={summaryRef}
            tabIndex={-1}
            className={styles.summary}
            role="alert"
            aria-labelledby="cap-summary-title"
          >
            <h2 id="cap-summary-title" className={styles.summaryTitle}>
              {problems.length === 1 ? "1 thing needs fixing" : `${problems.length} things need fixing`}
            </h2>
            <ul className={styles.summaryList}>
              {problems.map((p) => (
                <li key={p.href}>
                  <a
                    href={p.href}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(p.href.slice(1))?.focus();
                    }}
                  >
                    {p.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.editor}>
          {/* ---------- player ---------- */}
          <div className={styles.player}>
            <div className={styles.videoFrame}>
              <video
                ref={videoRef}
                className={styles.video}
                src={video.url}
                controls
                playsInline
                preload="metadata"
                aria-label="Your video introduction"
                onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                onSeeked={(e) => setTime(e.currentTarget.currentTime)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onLoadedMetadata={(e) => {
                  const d = e.currentTarget.duration;
                  if (Number.isFinite(d) && d > 0) setDuration(d);
                }}
              />
            </div>
            {/* Captions sit below the picture, never on top of it: an overlay
                would cover the signer's hands. */}
            <div className={styles.captionBar} aria-hidden="true">
              {active >= 0 && cues[active].text.trim() ? (
                cues[active].text
              ) : (
                <span className={styles.captionEmpty}>Captions show here as the video plays</span>
              )}
            </div>
            <div className={styles.toolbar}>
              <button type="button" className={styles.toolButton} onClick={togglePlay}>
                {playing ? "Pause" : "Play"}
              </button>
              <button type="button" className={styles.toolButton} onClick={() => seek(time - 3)}>
                Back 3 sec
              </button>
              <p className={styles.clock}>
                <span className={styles.srOnly}>Video time: </span>
                {formatTime(time)}
                {end > 0 && <span className={styles.clockTotal}> / {formatTime(end)}</span>}
              </p>
            </div>
          </div>

          {/* ---------- lines ---------- */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.label}>Caption lines</legend>
            <p className={styles.hint}>
              Each line shows from its start time until the next line starts.
              {signed && " Pause where a new thought starts and add a line there."}
            </p>
            <ol className={styles.cues}>
              {cues.map((cue, i) => {
                const n = i + 1;
                const isEmpty = errors.empty?.includes(cue.id);
                return (
                  <li
                    key={cue.id}
                    className={`${styles.cue} ${i === active ? styles.cueActive : ""}`}
                  >
                    <div className={styles.cueHead}>
                      <label className={styles.cueLabel} htmlFor={`${cue.id}-text`}>
                        Line {n}
                        <span className={styles.cueTime}>
                          <span className={styles.srOnly}>, starts at </span>
                          <span aria-hidden="true"> · </span>
                          {formatTime(cue.start)}
                        </span>
                      </label>
                      {i === active && (
                        <span className={styles.nowTag}>
                          <span aria-hidden="true">●</span> On screen now
                        </span>
                      )}
                    </div>
                    <textarea
                      id={`${cue.id}-text`}
                      className={`${styles.input} ${styles.cueText} ${isEmpty ? styles.inputError : ""}`}
                      rows={3}
                      maxLength={140}
                      value={cue.text}
                      placeholder={signed ? "What you signed, in your words" : undefined}
                      aria-invalid={isEmpty || undefined}
                      onChange={(e) => update(cue.id, { text: e.target.value })}
                      onFocus={() => {
                        const v = videoRef.current;
                        if (v && v.paused) seek(cue.start);
                      }}
                    />
                    <div className={styles.cueTools} role="group" aria-label={`Line ${n} timing`}>
                      <button type="button" className={styles.toolButton} onClick={() => { seek(cue.start); videoRef.current?.play().catch(() => {}); }}>
                        Play this line
                      </button>
                      <button
                        type="button"
                        className={styles.toolButton}
                        onClick={() => setStart(cue.id, time, n)}
                      >
                        Start at {formatTime(time)}
                      </button>
                      <button
                        type="button"
                        className={styles.toolButton}
                        aria-label={`Line ${n}: start half a second earlier`}
                        onClick={() => setStart(cue.id, cue.start - 0.5, n)}
                      >
                        −0.5s
                      </button>
                      <button
                        type="button"
                        className={styles.toolButton}
                        aria-label={`Line ${n}: start half a second later`}
                        onClick={() => setStart(cue.id, cue.start + 0.5, n)}
                      >
                        +0.5s
                      </button>
                      <button
                        type="button"
                        className={styles.toolRemove}
                        onClick={() => removeLine(cue.id, n)}
                      >
                        Remove<span className={styles.srOnly}> line {n}</span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
            <button id="add-line" type="button" className={styles.buttonSecondary} onClick={addLine}>
              + Add a line at {formatTime(time)}
            </button>
          </fieldset>
        </div>

        {/* ---------- the gate ---------- */}
        <div className={`${styles.confirm} ${errors.confirm ? styles.confirmError : ""}`}>
          <label className={styles.check} htmlFor="confirm">
            <input
              id="confirm"
              type="checkbox"
              checked={confirmed}
              aria-describedby="confirm-hint"
              aria-invalid={errors.confirm || undefined}
              onChange={(e) => {
                setConfirmed(e.target.checked);
                if (e.target.checked) setErrors((x) => ({ ...x, confirm: undefined }));
              }}
            />
            <span>
              <span className={styles.checkLabel}>These captions are accurate</span>
              <span id="confirm-hint" className={styles.hint}>
                I watched my video and the captions say what I mean. Employers only see
                my video after I confirm this.
              </span>
            </span>
          </label>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.button}>
            Save captions
          </button>
          <Link className={styles.linkAction} href="/profile/new/video">
            Back
          </Link>
        </div>
      </form>
    </>
  );
}
