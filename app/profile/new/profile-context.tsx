"use client";

import { createContext, useContext, useState } from "react";
import { setVideoLater } from "./video-later-store";

// Client-side only, on purpose: nothing here touches a server, a database or
// localStorage. It lives in the /profile/new layout, which stays mounted as the
// candidate moves between steps, so Back/Next keep what they typed.

export type CommuteRange = "" | "local" | "15" | "30" | "50" | "anywhere";

// How someone communicates. They can pick more than one (Deaf and ASL preferred, say).
export type CommPreference = "deaf" | "hard-of-hearing" | "asl" | "english" | "both";

export type SalaryType = "" | "hourly" | "yearly";

export type PhoneContactType = "" | "text" | "call";

export type Basics = {
  displayName: string;
  street: string; // street address, line 1
  street2: string; // apartment, suite or unit (optional)
  city: string;
  state: string; // two-letter code, like NY
  zip: string; // 5 digits, or ZIP+4
  vrsPhone: string; // Video Relay Service number: calls placed through an ASL interpreter
  textOrCallPhone: string; // direct text or voice call number (e.g. for hard of hearing candidates)
  phoneContactType: PhoneContactType; // whether that direct number takes texts or voice calls
  openToRemote: boolean;
  headline: string;
  workLocations: string[];
  commuteRange: CommuteRange;
  roleInterest: string;
  commPreferences: CommPreference[];
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
  street: "",
  street2: "",
  city: "",
  state: "",
  zip: "",
  vrsPhone: "",
  textOrCallPhone: "",
  phoneContactType: "",
  openToRemote: false,
  headline: "",
  workLocations: [],
  commuteRange: "",
  roleInterest: "",
  commPreferences: [],
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
    if (next) setVideoLater(false); // they added one: no reminder needed
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

export const COMM_PREFERENCE_LABELS: Record<CommPreference, string> = {
  deaf: "Deaf",
  "hard-of-hearing": "Hard of Hearing",
  asl: "ASL preferred",
  english: "English preferred",
  both: "Both ASL and English",
};

// The home address as display lines: street (and apartment) on the first, then
// "City, ST 12345". Empty parts are left out.
export function formatAddress(b: Pick<Basics, "street" | "street2" | "city" | "state" | "zip">): string[] {
  const line1 = [b.street, b.street2].filter(Boolean).join(", ");
  const cityState = [b.city, [b.state, b.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return [line1, cityState].filter(Boolean);
}

export const US_STATES: [string, string][] = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"],
  ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"],
  ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"],
  ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"],
  ["ME", "Maine"], ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
  ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"],
  ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"],
  ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"],
  ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"], ["SD", "South Dakota"],
  ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"],
  ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
];
