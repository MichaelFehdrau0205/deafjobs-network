"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FocusHeading } from "../focus-heading";
import { Progress } from "../progress";
import { speakTime, useProfileDraft, type VideoMode } from "../profile-context";
import styles from "../profile.module.css";

const MAX_SECONDS = 120; // 2 minutes, for recording and for uploads

// 95 -> "1:35"
const clock = (secs: number) =>
  `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, "0")}`;
const MAX_UPLOAD_MB = 200;

// "starting" is the wait between pressing Record and the picture appearing:
// the browser may be asking for permission, or the camera may be warming up.
type Phase = "choose" | "starting" | "camera" | "recording";

// What went wrong, and what to do about it, in plain words.
function cameraProblem(err: unknown) {
  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Your browser blocked the camera. Click the camera or lock icon in the address bar, choose Allow, then try again. On a Mac, also check System Settings > Privacy & Security > Camera. Or upload a video instead.";
  }
  if (name === "NotFoundError") {
    return "We couldn't find a camera or microphone on this device. Plug one in and try again, or upload a video instead.";
  }
  if (name === "NotReadableError" || name === "AbortError") {
    return "Your camera is busy or isn't responding. Close other apps that use it, like Zoom or FaceTime, then try again. Or upload a video instead.";
  }
  return "The camera didn't start. Try again, or upload a video instead.";
}

// Safari records MP4, Chrome and Firefox record WebM. Ask, don't assume.
function pickRecorderType() {
  if (typeof MediaRecorder === "undefined") return "";
  const options = [
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  return options.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

export function VideoStep() {
  const router = useRouter();
  const { video, saveVideo } = useProfileDraft();

  const [phase, setPhase] = useState<Phase>("choose");
  const [elapsed, setElapsed] = useState(0);
  const [problem, setProblem] = useState<string | null>(null);
  const [modeError, setModeError] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [live, setLive] = useState(false); // the camera picture is actually playing

  const liveRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const attemptRef = useRef(0); // which "Record a video" press is the current one
  const warnedRef = useRef(0); // 0 = none, 1 = "30 left" said, 2 = "10 left" said
  const timerRef = useRef<number | null>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<HTMLFieldSetElement>(null);
  const previewHeadingRef = useRef<HTMLHeadingElement>(null);
  const recordButtonRef = useRef<HTMLButtonElement>(null);

  // Turn the camera off whenever we leave this page. Bumping the attempt
  // number also makes a request still waiting on the browser's permission
  // prompt switch its camera straight back off when it finally answers.
  useEffect(
    () => () => {
      attemptRef.current += 1;
      stopCamera();
    },
    [],
  );

  // Connect the camera to the picture AFTER the <video> is on the page. Doing
  // this right after getUserMedia raced with React's render, and lost
  // sometimes: the element wasn't there yet, so the picture stayed black.
  useEffect(() => {
    if (phase !== "camera") return;
    const el = liveRef.current;
    const stream = streamRef.current;
    if (!el || !stream) return;
    el.srcObject = stream;
    el.play().catch(() => {}); // if this is blocked, the check below says so
    recordButtonRef.current?.focus();
  }, [phase]);

  // A black picture with no explanation looks broken. If the camera is
  // connected but nothing plays within 5 seconds, say so.
  useEffect(() => {
    if (phase !== "camera" || live) return;
    const t = window.setTimeout(() => {
      setProblem(
        "Your camera connected, but no picture is showing yet. Choose Turn camera off, then Record a video to try again.",
      );
    }, 5000);
    return () => window.clearTimeout(t);
  }, [phase, live]);

  useEffect(() => {
    if (problem) problemRef.current?.focus();
  }, [problem]);

  function stopCamera() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function openCamera() {
    setProblem(null);
    if (!window.isSecureContext) {
      setProblem(
        "Your browser only allows the camera on a secure page (https, or localhost). Open the site from its normal address, or upload a video instead.",
      );
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setProblem(
        "This browser can't record video. You can upload a video you already have instead.",
      );
      return;
    }
    const attempt = ++attemptRef.current;
    setLive(false);
    setPhase("starting");
    setAnnounce("Turning on your camera. If your browser asks, choose Allow.");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: true,
      });
      // They cancelled or left while the browser was asking. Don't leave the
      // camera running with nobody watching.
      if (attempt !== attemptRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      setPhase("camera"); // the effect above connects it once the <video> exists
      setAnnounce("Camera is on. You can see yourself below.");
    } catch (err) {
      if (attempt !== attemptRef.current) return;
      setPhase("choose");
      setProblem(cameraProblem(err));
    }
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    const type = pickRecorderType();
    const recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const duration = (Date.now() - startedAtRef.current) / 1000;
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
      stopCamera();
      saveVideo({
        url: URL.createObjectURL(blob),
        fileName: "Recorded video",
        source: "recorded",
        duration,
        mode: video?.mode ?? null,
      });
      setPhase("choose");
      setAnnounce(
        `Recording stopped${duration >= MAX_SECONDS ? " at the 2 minute limit" : ""}. Your video is ${speakTime(Math.round(duration))} long.`,
      );
      requestAnimationFrame(() => previewHeadingRef.current?.focus());
    };
    recorderRef.current = recorder;
    recorder.start(250);
    startedAtRef.current = Date.now();
    setElapsed(0);
    setPhase("recording");
    setAnnounce("Recording.");
    warnedRef.current = 0;
    timerRef.current = window.setInterval(() => {
      const secs = (Date.now() - startedAtRef.current) / 1000;
      setElapsed(secs);
      // The badge ticks every second, which is far too chatty to read out.
      // Tell screen reader users only when time is getting short.
      const left = MAX_SECONDS - secs;
      if (left <= 10 && warnedRef.current < 2) {
        warnedRef.current = 2;
        setAnnounce("10 seconds left.");
      } else if (left <= 30 && warnedRef.current < 1) {
        warnedRef.current = 1;
        setAnnounce("30 seconds left.");
      }
      if (secs >= MAX_SECONDS) stopRecording();
    }, 250);
  }

  function stopRecording() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  function cancelCamera() {
    attemptRef.current += 1;
    stopCamera();
    setLive(false);
    setPhase("choose");
    setAnnounce("Camera turned off.");
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setProblem(null);
    const file = e.target.files?.[0];
    e.target.value = ""; // let them pick the same file again later
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setProblem("That file isn't a video. Choose a video file, like an MP4 or MOV.");
      return;
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setProblem(`That video is bigger than ${MAX_UPLOAD_MB} MB. Try a shorter clip.`);
      return;
    }
    const url = URL.createObjectURL(file);
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      // Round first, so a clip that is 2:00.3 long isn't turned away.
      const length = Math.round(probe.duration);
      if (Number.isFinite(length) && length > MAX_SECONDS) {
        URL.revokeObjectURL(url);
        setProblem(
          `That video is ${speakTime(length)} long. The limit is 2 minutes. Trim it to 2 minutes or shorter, then upload it again.`,
        );
        return;
      }
      saveVideo({
        url,
        fileName: file.name,
        source: "uploaded",
        duration: Number.isFinite(probe.duration) ? probe.duration : 0,
        mode: video?.mode ?? null,
      });
      setAnnounce(`${file.name} added.`);
      requestAnimationFrame(() => previewHeadingRef.current?.focus());
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      setProblem(
        "This browser can't play that video. Try an MP4 file, or record one here instead.",
      );
    };
    probe.src = url;
  }

  function removeVideo() {
    saveVideo(null);
    setModeError(false);
    setAnnounce("Video removed.");
  }

  function setMode(mode: VideoMode) {
    if (!video) return;
    saveVideo({ ...video, mode });
    setModeError(false);
  }

  function onNext() {
    if (!video) return;
    if (!video.mode) {
      setModeError(true);
      modeRef.current?.querySelector("input")?.focus();
      return;
    }
    router.push("/profile/new/captions");
  }

  return (
    <>
      <Progress current={3} />
      <FocusHeading className={styles.title}>Add a short video</FocusHeading>
      <p className={styles.intro}>
        A video lets employers meet you before they read your resume. Sign or
        speak, whichever is natural for you. Up to 2 minutes. You can
        also skip this for now.
      </p>

      <p className={styles.srOnly} role="status" aria-live="polite">
        {announce}
      </p>

      {problem && (
        <div ref={problemRef} tabIndex={-1} className={styles.summary} role="alert">
          <p className={styles.summaryTitle}>That didn&rsquo;t work</p>
          <p className={styles.summaryText}>{problem}</p>
        </div>
      )}

      {!video && (
        <section aria-labelledby="ideas-title" className={styles.panel}>
          <h2 id="ideas-title" className={styles.panelTitle}>
            Not sure what to say? Try these
          </h2>
          <ul className={styles.prompts}>
            <li>What kind of work do you want to do?</li>
            <li>What are you good at? Give one real example.</li>
            <li>How do you like to communicate at work?</li>
          </ul>
        </section>
      )}

      {/* ---------- camera ---------- */}
      {!video && phase !== "choose" && (
        <section aria-labelledby="camera-title">
          <h2 id="camera-title" className={styles.sectionTitle}>
            Record with your camera
          </h2>
          <div className={styles.videoFrame}>
            {/* Live self-view: mirrored, muted so it doesn't echo. */}
            <video
              ref={liveRef}
              className={`${styles.video} ${styles.mirror}`}
              muted
              autoPlay
              playsInline
              aria-label="Your camera"
              onPlaying={() => setLive(true)}
            />
            {/* Visible while connecting; screen readers get the same words
                from the live region above. */}
            {!live && (
              <p className={styles.cameraStatus} aria-hidden="true">
                Turning on your camera…
              </p>
            )}
            {phase === "recording" && (
              <p className={styles.recBadge}>
                <span className={styles.recDot} aria-hidden="true" />
                Recording {clock(elapsed)} · {clock(Math.max(0, Math.ceil(MAX_SECONDS - elapsed)))} left
              </p>
            )}
          </div>
          <p className={styles.hint}>
            {phase === "starting"
              ? "If your browser asks to use your camera, choose Allow."
              : "Make sure your hands and face are in the frame. Good light in front of you helps."}
          </p>
          <div className={styles.actions}>
            {phase === "starting" ? (
              <button type="button" className={styles.linkButton} onClick={cancelCamera}>
                Cancel
              </button>
            ) : phase === "camera" ? (
              <button
                ref={recordButtonRef}
                type="button"
                className={styles.button}
                onClick={startRecording}
              >
                Start recording
              </button>
            ) : (
              <button type="button" className={styles.buttonStop} onClick={stopRecording}>
                Stop recording
              </button>
            )}
            {phase === "camera" && (
              <button type="button" className={styles.linkButton} onClick={cancelCamera}>
                Turn camera off
              </button>
            )}
          </div>
        </section>
      )}

      {/* ---------- choose ---------- */}
      {!video && phase === "choose" && (
        <div className={styles.choices}>
          <button type="button" className={styles.button} onClick={openCamera}>
            Record a video
          </button>
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={() => fileRef.current?.click()}
          >
            Upload a video
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className={styles.srOnly}
            tabIndex={-1}
            aria-hidden="true"
            onChange={onFile}
          />
        </div>
      )}

      {/* Always a real, visible link, right under the record button. Leaving
          turns the camera off (see the cleanup effect above). */}
      {!video && (
        <p className={styles.skipRow}>
          {/* Past captions too: with no video there is nothing to caption. */}
          <Link className={styles.linkAction} href="/profile/new/review">
            Skip for now
          </Link>
          <span className={styles.hint}>
            You can add a video later. Your captions step is skipped too.
          </span>
        </p>
      )}

      {/* ---------- preview ---------- */}
      {video && (
        <section aria-labelledby="preview-title">
          <h2
            id="preview-title"
            ref={previewHeadingRef}
            tabIndex={-1}
            className={styles.sectionTitle}
          >
            Your video
          </h2>
          <div className={styles.videoFrame}>
            <video
              className={styles.video}
              src={video.url}
              controls
              playsInline
              preload="metadata"
              aria-label="Your video introduction"
            />
          </div>
          <p className={styles.hint}>
            {video.source === "recorded" ? "Recorded here" : video.fileName}
            {video.duration > 0 && ` · ${Math.round(video.duration)} seconds`}
          </p>
          <button type="button" className={styles.linkButton} onClick={removeVideo}>
            Remove and try again
          </button>

          <fieldset
            ref={modeRef}
            className={styles.fieldset}
            aria-describedby={modeError ? "mode-hint mode-error" : "mode-hint"}
          >
            <legend className={styles.label}>How do you talk in this video?</legend>
            <p id="mode-hint" className={styles.hint}>
              This decides how you make your captions in the next step.
            </p>
            <label className={styles.radio}>
              <input
                type="radio"
                name="mode"
                checked={video.mode === "signed"}
                onChange={() => setMode("signed")}
              />
              <span>
                <span className={styles.checkLabel}>I sign</span>
                <span className={styles.hint}>
                  You&rsquo;ll write the captions yourself, in your own words.
                </span>
              </span>
            </label>
            <label className={styles.radio}>
              <input
                type="radio"
                name="mode"
                checked={video.mode === "spoke"}
                onChange={() => setMode("spoke")}
              />
              <span>
                <span className={styles.checkLabel}>I speak</span>
                <span className={styles.hint}>
                  We&rsquo;ll make a draft. You check it and fix any mistakes.
                </span>
              </span>
            </label>
            {modeError && (
              <p id="mode-error" className={styles.error}>
                <span className={styles.errorIcon} aria-hidden="true">
                  !
                </span>
                <span>
                  <span className={styles.srOnly}>Error: </span>
                  Choose whether you sign or speak in this video.
                </span>
              </p>
            )}
          </fieldset>
        </section>
      )}

      <div className={styles.actions}>
        {video && (
          <button type="button" className={styles.button} onClick={onNext}>
            Next: captions
          </button>
        )}
        <Link className={styles.linkAction} href="/profile/new/resume">
          Back
        </Link>
      </div>
    </>
  );
}
