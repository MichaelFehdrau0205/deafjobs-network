"use client";

import { createContext, useContext, useState } from "react";

// Client-side only, same pattern as the candidate profile builder
// (app/profile/new/profile-context.tsx): no server, no database, no
// localStorage. State lives for as long as this tab does.

export type HasHiredBefore = "" | "yes" | "no" | "not-sure";

export type InterviewFormat =
  | "asl-interpreter"
  | "captions-live"
  | "written"
  | "video-captions-on-request";

export type Commitment = {
  hasHiredBefore: HasHiredBefore;
  accommodationsOffered: string[]; // Accommodation ids from accommodations-data.ts
  interviewFormats: InterviewFormat[];
  signedByName: string;
  signedByRole: string;
  signedAt: string | null; // ISO timestamp, set once, on submit
};

export type RemoteType = "onsite" | "remote" | "hybrid";
export type EmploymentType = "full-time" | "part-time";
export type PostingStatus = "published" | "closed";

export type JobPosting = {
  id: string;
  title: string;
  description: string;
  location: string;
  remoteType: RemoteType;
  employmentType: EmploymentType;
  salaryMin: string;
  salaryMax: string;
  requiredSkills: string[];
  closesAt: string; // yyyy-mm-dd
  publishedAt: string; // ISO timestamp
  status: PostingStatus;
};

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export const EMPTY_COMMITMENT: Commitment = {
  hasHiredBefore: "",
  accommodationsOffered: [],
  interviewFormats: [],
  signedByName: "",
  signedByRole: "",
  signedAt: null,
};

export const INTERVIEW_FORMAT_LABELS: Record<InterviewFormat, string> = {
  "asl-interpreter": "Interview with an ASL interpreter provided",
  "captions-live": "Interview with live captions",
  written: "Written / text-based interview",
  "video-captions-on-request": "Video call, captions available on request",
};

type EmployerState = {
  commitment: Commitment;
  saveCommitment: (c: Commitment) => void;
  postings: JobPosting[];
  addPosting: (p: Omit<JobPosting, "id" | "publishedAt" | "status">) => void;
  closePosting: (id: string) => void;
  reopenPosting: (id: string) => void;
};

const EmployerContext = createContext<EmployerState | null>(null);

export function EmployerProvider({ children }: { children: React.ReactNode }) {
  const [commitment, saveCommitment] = useState<Commitment>(EMPTY_COMMITMENT);
  const [postings, setPostings] = useState<JobPosting[]>([]);

  function addPosting(p: Omit<JobPosting, "id" | "publishedAt" | "status">) {
    setPostings((prev) => [
      { ...p, id: newId(), publishedAt: new Date().toISOString(), status: "published" },
      ...prev,
    ]);
  }

  function closePosting(id: string) {
    setPostings((prev) => prev.map((p) => (p.id === id ? { ...p, status: "closed" } : p)));
  }

  function reopenPosting(id: string) {
    setPostings((prev) => prev.map((p) => (p.id === id ? { ...p, status: "published" } : p)));
  }

  return (
    <EmployerContext.Provider
      value={{ commitment, saveCommitment, postings, addPosting, closePosting, reopenPosting }}
    >
      {children}
    </EmployerContext.Provider>
  );
}

export function useEmployer() {
  const ctx = useContext(EmployerContext);
  if (!ctx) throw new Error("useEmployer must be used inside EmployerProvider");
  return ctx;
}
