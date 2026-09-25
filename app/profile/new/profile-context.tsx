"use client";

import { createContext, useContext, useState } from "react";

// Client-side only, on purpose: nothing here touches a server, a database or
// localStorage. It lives in the /profile/new layout, which stays mounted as the
// candidate moves between steps, so Back/Next keep what they typed.

export type CommuteRange = "" | "local" | "15" | "30" | "50" | "anywhere";

export type CommPreference = "" | "deaf" | "hard-of-hearing" | "asl" | "english" | "both";

export type SalaryType = "" | "hourly" | "yearly";

export type Basics = {
  displayName: string;
  homeAddress: string;
  openToRemote: boolean;
  headline: string;
  workLocations: string[];
  commuteRange: CommuteRange;
  roleInterest: string;
  commPreference: CommPreference;
  salaryType: SalaryType;
  salaryAmount: string;
};

// How the candidate talks in the video decides the caption path in step 3:
// a signed video has no audio, so there is nothing to auto-transcribe.
export type VideoMode = "signed" | "spoke";

export type Video = {
  url: string; // object URL, lives only in this tab
  fileName: string;
  source: "recorded" | "uploaded";
  duration: number; // seconds
  mode: VideoMode | null;
};

// One caption line. It shows from `start` until the next line starts.
export type Cue = {
  id: string;
  start: number;
  text: string;
};

export type Captions = {
  cues: Cue[];
  confirmed: boolean; // "These captions are accurate" (transcript_edited)
  forMode: VideoMode | null; // which path the cues were made for
};

export type Resume = {
  text: string;
  fileName: string;
};

// Structured entries shown alongside the raw resume text, LinkedIn/Indeed
// style: candidates can add, edit, remove, and reorder these independent of
// whether they've uploaded a file.
export type ExperienceEntry = {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

export type EducationEntry = {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
};

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = list.slice();
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function emptyExperience(): ExperienceEntry {
  return { id: newId(), title: "", company: "", startDate: "", endDate: "", current: false, description: "" };
}

export function emptyEducation(): EducationEntry {
  return { id: newId(), school: "", degree: "", field: "", startYear: "", endYear: "" };
}

const EMPTY: Basics = {
  displayName: "",
  homeAddress: "",
  openToRemote: false,
  headline: "",
  workLocations: [],
  commuteRange: "",
  roleInterest: "",
  commPreference: "",
  salaryType: "",
  salaryAmount: "",
};

const NO_CAPTIONS: Captions = { cues: [], confirmed: false, forMode: null };

type ProfileDraft = {
  basics: Basics;
  saveBasics: (basics: Basics) => void;
  video: Video | null;
  saveVideo: (video: Video | null) => void;
  captions: Captions;
  saveCaptions: (captions: Captions) => void;
  resume: Resume | null;
  saveResume: (resume: Resume | null) => void;
  experience: ExperienceEntry[];
  saveExperience: (entries: ExperienceEntry[]) => void;
  education: EducationEntry[];
  saveEducation: (entries: EducationEntry[]) => void;
};

const ProfileContext = createContext<ProfileDraft | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [basics, saveBasics] = useState<Basics>(EMPTY);
  const [video, setVideo] = useState<Video | null>(null);
  const [captions, saveCaptions] = useState<Captions>(NO_CAPTIONS);
  const [resume, saveResume] = useState<Resume | null>(null);
  const [experience, saveExperience] = useState<ExperienceEntry[]>([]);
  const [education, saveEducation] = useState<EducationEntry[]>([]);

  function saveVideo(next: Video | null) {
    // A new or removed video means the old captions no longer match it.
    if (video && video.url !== next?.url) {
      URL.revokeObjectURL(video.url);
      saveCaptions(NO_CAPTIONS);
    } else if (video && next && video.mode !== next.mode) {
      saveCaptions(NO_CAPTIONS);
    }
    setVideo(next);
  }

  return (
    <ProfileContext.Provider
      value={{
        basics,
        saveBasics,
        video,
        saveVideo,
        captions,
        saveCaptions,
        resume,
        saveResume,
        experience,
        saveExperience,
        education,
        saveEducation,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileDraft() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfileDraft must be used inside ProfileProvider");
  return ctx;
}

export function formatTime(seconds: number) {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const rest = (s - m * 60).toFixed(1).padStart(4, "0");
  return `${m}:${rest}`;
}

// Screen-reader friendly version: "1 minute 4.5 seconds" rather than "1:04.5".
export function speakTime(seconds: number) {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const rest = Number((s - m * 60).toFixed(1));
  const secs = `${rest} ${rest === 1 ? "second" : "seconds"}`;
  return m > 0 ? `${m} ${m === 1 ? "minute" : "minutes"} ${secs}` : secs;
}

// The line on screen at time t: the last line that has started.
export function activeCueIndex(cues: Cue[], t: number) {
  let found = -1;
  cues.forEach((c, i) => {
    if (c.start <= t + 0.05) found = i;
  });
  return found;
}

export const COMMUTE_LABELS: Record<Exclude<CommuteRange, "">, string> = {
  local: "Same city or town only",
  "15": "Up to 15 miles",
  "30": "Up to 30 miles",
  "50": "Up to 50 miles",
  anywhere: "I'll travel however far it takes",
};

export const COMM_PREFERENCE_LABELS: Record<Exclude<CommPreference, "">, string> = {
  deaf: "Deaf",
  "hard-of-hearing": "Hard of hearing",
  asl: "ASL preferred",
  english: "English preferred",
  both: "Both ASL and English",
};
