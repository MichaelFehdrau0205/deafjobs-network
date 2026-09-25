"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FocusHeading } from "../focus-heading";
import { Progress } from "../progress";
import { HelpDialog } from "./help-dialog";
import {
  activeCueIndex,
  formatTime,
  speakTime,
  useProfileDraft,
  type Cue,
} from "../profile-context";
import styles from "../profile.module.css";

// About two lines of 42 characters, the usual subtitle limit. Keeps the
// overlay to a small strip.
const MAX_LINE = 84;

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

type Errors = { noLines?: boolean; pending?: boolean; confirm?: boolean };

export function CaptionsStep() {
  const router = useRouter();
  const { basics, video, captions, saveCaptions } = useProfileDraft();

  const [cues, setCues] = useState<Cue[]>(() => {
    if (!video?.mode) return [];
    if (captions.forMode === video.mode && captions.cues.length) return captions.cues;
    return video.mode === "spoke" ? draftFor(basics.displayName, video.duration) : [];
  });
  const [draft, setDraft] = useState("");
  const [lineError, setLineError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(captions.confirmed);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(video?.duration ?? 0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [announce, setAnnounce] = useState("");
  // Read out by a live region while the video plays, each time the caption
  // on screen changes. Separate from `announce` so editing messages and
  // playback captions never overwrite each other.
  const [liveCaption, setLiveCaption] = useState("");
  const [summaryKey, setSummaryKey] = useState(0);

  const lastActiveRef = useRef(-1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (summaryKey > 0) summaryRef.current?.focus();
  }, [summaryKey]);

  // Nothing to caption without a video (e.g. they skipped it, or opened this
  // page directly) — send them back to the video step.
  const missingVideo = !video || !video.mode;
  useEffect(() => {
    if (missingVideo) router.replace("/profile/new/video");
  }, [missingVideo, router]);
  if (!video || !video.mode) return null;

  const signed = video.mode === "signed";
  const active = activeCueIndex(cues, time);
  const end = duration || video.duration;
  // One line at a time: the last line that has started, until the next starts.
  const overlayText = active >= 0 ? cues[active].text.trim() : "";

  // Runs on every time update and seek: keeps the clock current and, while
  // playing, announces a caption the moment it changes. Scrubbing while
  // paused updates the overlay but stays quiet.
  function sync(v: HTMLVideoElement) {
    const t = v.currentTime;
    setTime(t);
    const idx = activeCueIndex(cues, t);
    if (idx === lastActiveRef.current) return;
    lastActiveRef.current = idx;
    if (!v.paused) {
      const text = idx >= 0 ? cues[idx].text.trim() : "";
      setLiveCaption(text ? `Caption: ${text}` : "");
    }
  }

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

  // The preview: from the top, with the overlay changing line by line.
  function playFromStart() {
    const v = videoRef.current;
    if (!v) return;
    lastActiveRef.current = -1;
    setLiveCaption("");
    v.play().catch(() => {});
    v.currentTime = 0;
    setTime(0);
  }

  function onDraftChange(value: string) {
    // Typing a line while the picture moves on is hard: pause at the moment
    // they start, so "Add line" stamps the spot they were looking at.
    const v = videoRef.current;
    if (!draft && value && v && !v.paused) {
      v.pause();
      setAnnounce("Video paused while you type.");
    }
    setDraft(value);
    if (lineError) setLineError(null);
    if (errors.pending) setErrors((e) => ({ ...e, pending: undefined }));
  }

  function addLine() {
    const text = draft.trim();
    if (!text) {
      setLineError("Type the caption line first, then press Add line.");
      inputRef.current?.focus();
      return;
    }
    const v = videoRef.current;
    const start = Number((v ? v.currentTime : time).toFixed(1));
    if (cues.some((c) => Math.abs(c.start - start) < 0.05)) {
      setLineError(
        `A line already starts at ${formatTime(start)}. Move the video to a different moment, or remove that line first.`,
      );
      inputRef.current?.focus();
      return;
    }
    setCues((cs) => sortCues([...cs, { id: newId(), start, text }]));
    setDraft("");
    setLineError(null);
    setErrors((e) => ({ ...e, noLines: undefined, pending: undefined }));
    setAnnounce(
      `Line added at ${speakTime(start)}. ${cues.length + 1} ${cues.length === 0 ? "line" : "lines"} so far.`,
    );
    inputRef.current?.focus();
  }

  // Puts a line back in the box (and the video at its start) so it can be
  // fixed and added again, with no timestamp to re-enter.
  function editLine(id: string, label: number) {
    const cue = cues.find((c) => c.id === id);
    if (!cue) return;
    if (draft.trim()) {
      setLineError("Add or clear the line you're typing before you edit another one.");
      inputRef.current?.focus();
      return;
    }
    videoRef.current?.pause();
    setCues((cs) => cs.filter((c) => c.id !== id));
    setDraft(cue.text);
    setLineError(null);
    seek(cue.start);
    setAnnounce(`Line ${label} is in the box. Change it, then press Add line.`);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function removeLine(id: string, label: number) {
    const idx = cues.findIndex((c) => c.id === id);
    setCues((cs) => cs.filter((c) => c.id !== id));
    setAnnounce(`Line ${label} removed.`);
    // Keep focus somewhere sensible: the line that took its place, or the box.
    requestAnimationFrame(() => {
      const after = cues[idx + 1] ?? cues[idx - 1];
      const target = after
        ? document.getElementById(`${after.id}-remove`)
        : inputRef.current;
      target?.focus();
    });
  }

  function onContinue(e: React.FormEvent) {
    e.preventDefault();
    const found: Errors = {
      noLines: cues.length === 0 || undefined,
      pending: draft.trim() ? true : undefined,
      confirm: !confirmed || undefined,
    };
    if (found.noLines || found.pending || found.confirm) {
      setErrors(found);
      setSummaryKey((k) => k + 1);
      return;
    }
    saveCaptions({
      cues,
      confirmed: true,
      forMode: video!.mode,
    });
    router.push("/profile/new/review");
  }

  const problems: { href: string; text: string }[] = [];
  if (errors.noLines) problems.push({ href: "#caption-line", text: "Add at least one caption line." });
  if (errors.pending)
    problems.push({
      href: "#caption-line",
      text: "You typed a line but didn't add it. Press Add line, or clear the box.",
    });
  if (errors.confirm)
    problems.push({ href: "#confirm", text: "Tick the box to confirm your captions are accurate." });

  return (
    <>
      <Progress current={4} />
      <FocusHeading className={styles.title}>
        {signed ? "Write your captions" : "Check your captions"}
      </FocusHeading>
      <p className={styles.intro}>
        {signed ? (
          <>
            Employers who don&rsquo;t sign will read these words. You decide how your
            signing reads in English. Play the video, pause where a line starts, type
            it and press Add line. Then press Play from start to watch it the way an
            employer will.
          </>
        ) : (
          <>
            We made a draft from your voice. Auto-captions get about 1 word in 10
            wrong, so press Play from start and use Edit on any line that isn&rsquo;t
            what you said.
          </>
        )}
      </p>

      <p className={styles.srOnly} role="status" aria-live="polite">
        {announce}
      </p>
      <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
        {liveCaption}
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
                <li key={p.text}>
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
              {/* No native controls: they'd sit on top of the caption overlay.
                  The buttons and slider below do the same job. */}
              <video
                ref={videoRef}
                className={styles.video}
                src={video.url}
                muted={muted}
                playsInline
                preload="metadata"
                aria-label="Your video introduction"
                onTimeUpdate={(e) => sync(e.currentTarget)}
                onSeeked={(e) => sync(e.currentTarget)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onLoadedMetadata={(e) => {
                  const d = e.currentTarget.duration;
                  if (Number.isFinite(d) && d > 0) setDuration(d);
                }}
              />
              {/* The caption on screen right now: one line, like real closed
                  captions. Screen readers get it from the live region. */}
              {overlayText && (
                <p className={styles.captionOverlay} aria-hidden="true">
                  {overlayText}
                </p>
              )}
            </div>
            <div className={styles.scrubRow}>
              <p className={styles.clock}>
                <span className={styles.srOnly}>Video time: </span>
                {formatTime(time)}
                {end > 0 && <span className={styles.clockTotal}> / {formatTime(end)}</span>}
              </p>
              {end > 0 && (
                <input
                  type="range"
                  className={styles.seek}
                  min={0}
                  max={end}
                  step={0.5}
                  value={Math.min(time, end)}
                  aria-label="Move through the video"
                  aria-valuetext={speakTime(time)}
                  onChange={(e) => seek(Number(e.target.value))}
                />
              )}
            </div>
            <div className={styles.toolbar}>
              <button type="button" className={styles.toolButton} onClick={playFromStart}>
                Play from start
              </button>
              <button type="button" className={styles.toolButton} onClick={togglePlay}>
                {playing ? "Pause" : "Resume"}
              </button>
              <button type="button" className={styles.toolButton} onClick={() => seek(time - 3)}>
                Back 3 sec
              </button>
              <button
                type="button"
                className={styles.toolButton}
                aria-pressed={muted}
                onClick={() => setMuted((m) => !m)}
              >
                {muted ? "Sound off" : "Sound on"}
              </button>
            </div>
          </div>

          <div className={styles.lines}>
            {/* ---------- add a line ---------- */}
            <section aria-labelledby="add-title">
              <div className={styles.titleRow}>
                <h2 id="add-title" className={styles.sectionTitle}>
                  Add a caption line
                </h2>
                <HelpDialog signed={signed} />
              </div>
              <label className={styles.label} htmlFor="caption-line">
                Caption line
              </label>
              <p id="caption-line-hint" className={styles.hint}>
                {signed ? "What you signed, in your words. " : ""}
                Keep it short, up to {MAX_LINE} characters. It starts at the
                video&rsquo;s current time: <strong>{formatTime(time)}</strong>.
              </p>
              <div className={styles.addRow}>
                <input
                  ref={inputRef}
                  id="caption-line"
                  type="text"
                  className={`${styles.input} ${styles.lineInput} ${lineError ? styles.inputError : ""}`}
                  value={draft}
                  maxLength={MAX_LINE}
                  aria-invalid={lineError ? true : undefined}
                  aria-describedby={
                    lineError ? "caption-line-hint caption-line-error" : "caption-line-hint"
                  }
                  onChange={(e) => onDraftChange(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter adds the line; it must not submit the whole step.
                    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      addLine();
                    }
                  }}
                />
                <button id="add-line" type="button" className={styles.button} onClick={addLine}>
                  Add line
                </button>
              </div>
              {lineError && (
                <p id="caption-line-error" className={styles.error} role="alert">
                  <span className={styles.errorIcon} aria-hidden="true">
                    !
                  </span>
                  <span>
                    <span className={styles.srOnly}>Error: </span>
                    {lineError}
                  </span>
                </p>
              )}
            </section>

            {/* ---------- the list ---------- */}
            <section aria-labelledby="lines-title">
              <h2 id="lines-title" className={styles.sectionTitle}>
                Your caption lines ({cues.length})
              </h2>
              {cues.length === 0 ? (
                <p className={styles.hint}>No lines yet. Add your first one above.</p>
              ) : (
                <ol className={styles.lineList}>
                  {cues.map((cue, i) => {
                    const n = i + 1;
                    return (
                      <li
                        key={cue.id}
                        className={`${styles.lineItem} ${i === active ? styles.lineActive : ""}`}
                      >
                        <span className={styles.lineTime}>
                          <span className={styles.srOnly}>Starts at </span>
                          {formatTime(cue.start)}
                        </span>
                        <span className={styles.lineText}>{cue.text}</span>
                        {i === active && (
                          <span className={styles.nowTag}>
                            <span aria-hidden="true">●</span> On screen now
                          </span>
                        )}
                        <span className={styles.lineTools}>
                          <button
                            type="button"
                            className={styles.toolButton}
                            onClick={() => editLine(cue.id, n)}
                          >
                            Edit<span className={styles.srOnly}> line {n}: {cue.text}</span>
                          </button>
                          <button
                            id={`${cue.id}-remove`}
                            type="button"
                            className={styles.toolRemove}
                            onClick={() => removeLine(cue.id, n)}
                          >
                            Remove<span className={styles.srOnly}> line {n}: {cue.text}</span>
                          </button>
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          </div>
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
          {/* aria-disabled, not disabled: the button stays reachable by keyboard
              and screen reader, and pressing it explains what's missing. */}
          <button
            type="submit"
            className={styles.button}
            aria-disabled={!confirmed}
            aria-describedby={confirmed ? undefined : "continue-hint"}
          >
            Continue
          </button>
          {!confirmed && (
            <p id="continue-hint" className={styles.hint}>
              Tick &ldquo;These captions are accurate&rdquo; to continue.
            </p>
          )}
          <Link className={styles.linkAction} href="/profile/new/video">
            Back
          </Link>
        </div>
      </form>
    </>
  );
}
