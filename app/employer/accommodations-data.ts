// Real-ish accommodation options with monthly cost estimates, standing in for
// the `accommodation_resource` table (PRD §6.5 / §8). Captioning is not in
// this list — it's bundled with every posting, not a line item to weigh
// (see the commitment form).
export type Accommodation = {
  id: string;
  name: string;
  monthlyCost: string;
  description: string;
};

export const ACCOMMODATIONS: Accommodation[] = [
  {
    id: "asl-interpreter",
    name: "On-site ASL interpreter (as needed)",
    monthlyCost: "~$65/hr, 1-hour minimum booking",
    description: "Best for job interviews and in-person meetings \u2014 billed only when used, and most interviews only need the one hour.",
  },
  {
    id: "vrs",
    name: "Video Relay Service (VRS) compatibility",
    monthlyCost: "Free for the employee \u2014 no cost to caption or interpret the call",
    description:
      "Lets a Deaf employee make and receive phone calls through an ASL interpreter over video. Federally funded, so there's nothing to pay for \u2014 just be ready for calls to come through a relay operator.",
  },
  {
    id: "vri",
    name: "Video Remote Interpreting (VRI)",
    monthlyCost: "~$30–$45/mo",
    description: "If your company already has VRI set up, this is where it fits \u2014 an on-demand interpreter over video for meetings or unscheduled conversations. Different from VRS, which is for phone calls.",
  },
  {
    id: "captioning-software",
    name: "Real-time captioning for meetings (beyond postings)",
    monthlyCost: "~$20/mo per seat",
    description: "Live captions in day-to-day meetings, not just the application process. For an interview itself, this can be as simple as typing questions and answers back and forth \u2014 no software required. Or, both sides can just hop on a VRS call and let the relay interpreter handle it.",
  },
  {
    id: "assistive-listening",
    name: "Assistive listening devices",
    monthlyCost: "~$15/mo (amortized)",
    description: "Personal FM/loop systems for shared spaces and conference rooms.",
  },
  {
    id: "note-taking",
    name: "Note-taking support",
    monthlyCost: "~$25/mo",
    description: "A shared notetaker or note-taking service for recurring meetings.",
  },
  {
    id: "visual-alerts",
    name: "Visual alert systems",
    monthlyCost: "~$10/mo (amortized)",
    description: "Visual signals for alarms, doorbells, and notifications in the workplace.",
  },
];
