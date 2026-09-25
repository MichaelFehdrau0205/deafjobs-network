import { useSyncExternalStore } from "react";

// Demo applications, shared by the candidate dashboard (/applications) and the
// employer's Applicants page (/employer/applicants). Client-side only, like
// auth-store.ts: no server, kept in localStorage so a reload keeps it and a
// message sent from the employer side shows up on the candidate side.

export type Status = "applied" | "viewed" | "messaged" | "interview" | "declined";

export const STATUS_LABEL: Record<Status, string> = {
  applied: "Applied",
  viewed: "Viewed",
  messaged: "Messaged",
  interview: "Interview requested",
  declined: "Not a match",
};

// What each status means, in the candidate's terms.
export const STATUS_HELP: Record<Status, string> = {
  applied: "Sent. No reply yet, and that's normal. Employers can take a while.",
  viewed: "The employer has looked at your profile and video.",
  messaged: "The employer sent you a message.",
  interview: "The employer wants to interview you. Reply with a time that works.",
  declined: "This job wasn't the right match. That's about fit, not about you. Your profile is ready for the next one.",
};

export type Message = {
  id: string;
  from: "employer" | "candidate";
  text: string;
  at: string; // ISO timestamp
};

export type Application = {
  id: string;
  candidateName: string;
  candidateHeadline: string;
  jobTitle: string;
  company: string;
  appliedAt: string; // ISO timestamp
  status: Status;
  thread: Message[];
};

// The demo signs you in as this candidate on the candidate side, and as this
// employer on the employer side. The two views share the records.
export const DEMO_CANDIDATE = "Michael F.";
export const DEMO_EMPLOYER = "Northbridge Logistics";

const SEED: Application[] = [
  {
    id: "a1",
    candidateName: DEMO_CANDIDATE,
    candidateHeadline: "Deaf builder · frontend & design",
    jobTitle: "Warehouse Associate",
    company: DEMO_EMPLOYER,
    appliedAt: "2026-09-24T14:10:00Z",
    status: "applied",
    thread: [],
  },
  {
    id: "a2",
    candidateName: DEMO_CANDIDATE,
    candidateHeadline: "Deaf builder · frontend & design",
    jobTitle: "Front Desk Coordinator",
    company: "Harbor View Dental",
    appliedAt: "2026-09-22T16:30:00Z",
    status: "viewed",
    thread: [],
  },
  {
    id: "a3",
    candidateName: DEMO_CANDIDATE,
    candidateHeadline: "Deaf builder · frontend & design",
    jobTitle: "Data Entry Specialist",
    company: "Meridian Insurance Group",
    appliedAt: "2026-09-20T13:05:00Z",
    status: "messaged",
    thread: [
      {
        id: "a3-1",
        from: "employer",
        at: "2026-09-23T15:20:00Z",
        text: "Hi, thanks for applying. A few questions for you:\n1. Are you comfortable working fully remote?\n2. What tools have you used for data entry?\n3. When could you start?\nReply here in text whenever it suits you.",
      },
    ],
  },
  {
    id: "a4",
    candidateName: DEMO_CANDIDATE,
    candidateHeadline: "Deaf builder · frontend & design",
    jobTitle: "Graphic Designer",
    company: "Palette & Co.",
    appliedAt: "2026-09-18T11:00:00Z",
    status: "interview",
    thread: [
      {
        id: "a4-1",
        from: "employer",
        at: "2026-09-21T14:00:00Z",
        text: "Hi, we'd like to set up an interview. What time works best for you this week or next? We can do live captions, a written interview, or bring in an ASL interpreter. Tell us which you prefer.",
      },
    ],
  },
  {
    id: "a5",
    candidateName: DEMO_CANDIDATE,
    candidateHeadline: "Deaf builder · frontend & design",
    jobTitle: "Seamstress",
    company: "Hudson & Vine Alterations",
    appliedAt: "2026-09-12T10:15:00Z",
    status: "declined",
    thread: [
      {
        id: "a5-1",
        from: "employer",
        at: "2026-09-19T17:45:00Z",
        text: "Thank you for applying and for the time you put into your profile. After looking closely, this role isn't the right match, and that is about fit, not about you. Your work stood out, and we'd be glad to see you apply again for other openings.",
      },
    ],
  },
  // Other people who applied to the demo employer's Warehouse Associate role.
  {
    id: "e1",
    candidateName: "Priya N.",
    candidateHeadline: "Warehouse team lead, 6 years",
    jobTitle: "Warehouse Associate",
    company: DEMO_EMPLOYER,
    appliedAt: "2026-09-23T12:00:00Z",
    status: "viewed",
    thread: [],
  },
  {
    id: "e2",
    candidateName: "Marcus T.",
    candidateHeadline: "Front desk & scheduling",
    jobTitle: "Warehouse Associate",
    company: DEMO_EMPLOYER,
    appliedAt: "2026-09-25T09:40:00Z",
    status: "applied",
    thread: [],
  },
  {
    id: "e3",
    candidateName: "Elena R.",
    candidateHeadline: "QA tester, mobile & web",
    jobTitle: "Inventory Clerk",
    company: DEMO_EMPLOYER,
    appliedAt: "2026-09-21T15:20:00Z",
    status: "interview",
    thread: [
      {
        id: "e3-1",
        from: "employer",
        at: "2026-09-22T13:00:00Z",
        text: "Hi Elena, we'd like to set up an interview. What time works best for you? We can do live captions, a written interview, or an ASL interpreter.",
      },
      {
        id: "e3-2",
        from: "candidate",
        at: "2026-09-22T18:30:00Z",
        text: "Thank you! Thursday afternoon works for me. Live captions are great.",
      },
    ],
  },
];

const KEY = "deafjobs-applications-v3";
const listeners = new Set<() => void>();

// getSnapshot must return the same object until something changes, so the
// parsed value is cached against the raw string it came from.
let cachedRaw: string | null = null;
let cachedValue: Application[] = SEED;
// Storage that can't be written still lets this tab work for the session.
let memory: Application[] | null = null;

function getSnapshot(): Application[] {
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    cachedValue = raw ? (JSON.parse(raw) as Application[]) : SEED;
  } catch {
    cachedRaw = null;
    cachedValue = SEED;
  }
  return cachedValue;
}

function write(next: Application[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    memory = null;
  } catch {
    memory = next;
  }
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

// The server and the first client render both see the seed, so the HTML
// matches; any saved changes arrive right after hydration.
export function useApplications(): Application[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => SEED);
}

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function update(id: string, change: (a: Application) => Application) {
  write(getSnapshot().map((a) => (a.id === id ? change(a) : a)));
}

// Opening an application moves it from Applied to Viewed. Later statuses are
// never moved backwards.
export function markViewed(id: string) {
  const app = getSnapshot().find((a) => a.id === id);
  if (app && app.status === "applied") update(id, (a) => ({ ...a, status: "viewed" }));
}

export function sendMessage(
  id: string,
  from: Message["from"],
  text: string,
  setStatus?: Status,
) {
  update(id, (a) => ({
    ...a,
    status: setStatus ?? a.status,
    thread: [...a.thread, { id: newId(), from, text, at: new Date().toISOString() }],
  }));
}

export function resetDemoApplications() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing stored to clear */
  }
  memory = null;
  cachedRaw = null;
  cachedValue = SEED;
  listeners.forEach((l) => l());
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "America/New_York",
});
const TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
});

export function formatDate(iso: string) {
  return DATE_FORMAT.format(new Date(iso));
}
export function formatDateTime(iso: string) {
  return `${DATE_FORMAT.format(new Date(iso))}, ${TIME_FORMAT.format(new Date(iso))}`;
}
