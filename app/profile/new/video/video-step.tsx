"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FocusHeading } from "../focus-heading";
import { Progress } from "../progress";
import { formatTime, useProfileDraft, type VideoMode } from "../profile-context";
import styles from "../profile.module.css";

const MAX_SECONDS = 90;
const MAX_UPLOAD_MB = 200;

type Phase = "choose" | "camera" | "recording";

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

  const liveRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<HTMLFieldSetElement>(null);
  const previewHeadingRef = useRef<HTMLHeadingElement>(null);
  const recordButtonRef = useRef<HTMLButtonElement>(null);

  // Turn the camera off whenever we leave this page.
  useEffect(() => stopCamera, []);

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
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setProblem(
        "This browser can't record video. You can upload a video you already have instead.",
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      setPhase("camera");
      setAnnounce("Camera is on. You can see yourself below.");
      // The <video> mounts on the next render.
      requestAnimationFrame(() => {
        if (liveRef.current) {
          liveRef.current.srcObject = stream;
          liveRef.current.play().catch(() => {});
        }
        recordButtonRef.current?.focus();
      });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      setProblem(
        name === "NotAllowedError"
          ? "The browser didn't get permission to use your camera. Allow camera access in the address bar, then try again. Or upload a video instead."
          : name === "NotFoundError"
            ? "We couldn't find a camera on this device. You can upload a video instead."
            : "The camera didn't start. Close other apps that might be using it and try again, or upload a video instead.",
      );
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
      setAnnounce(`Recording stopped. Your video is ${Math.round(duration)} seconds long.`);
      requestAnimationFrame(() => previewHeadingRef.current?.focus());
    };
    recorderRef.current = recorder;
    recorder.start(250);
    startedAtRef.current = Date.now();
    setElapsed(0);
    setPhase("recording");
    setAnnounce("Recording.");
    timerRef.current = window.setInterval(() => {
      const secs = (Date.now() - startedAtRef.current) / 1000;
      setElapsed(secs);
      if (secs >= MAX_SECONDS) stopRecording();
    }, 250);
  }

  function stopRecording() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  function cancelCamera() {
    stopCamera();
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
      <Progress current={2} />
      <FocusHeading className={styles.title}>Add a short video</FocusHeading>
      <p className={styles.intro}>
        A video is required. It lets employers meet you before they read your
        resume, and lets a hiring manager decide from something real instead of a
        guess. Sign or speak, whichever is natural for you. Up to {MAX_SECONDS}{" "}
        seconds.
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
              playsInline
              aria-label="Your camera"
            />
            {phase === "recording" && (
              <p className={styles.recBadge}>
                <span className={styles.recDot} aria-hidden="true" />
                Recording {formatTime(elapsed).replace(/\.\d$/, "")} /{" "}
                {Math.floor(MAX_SECONDS / 60)}:{String(MAX_SECONDS % 60).padStart(2, "0")}
              </p>
            )}
          </div>
          <p className={styles.hint}>
            Make sure your hands and face are in the frame. Good light in front of you
            helps.
          </p>
          <div className={styles.actions}>
            {phase === "camera" ? (
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
        <Link className={styles.linkAction} href="/profile/new">
          Back
        </Link>
      </div>
    </>
  );
}
