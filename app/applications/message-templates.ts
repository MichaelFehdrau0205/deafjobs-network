import type { Status } from "./applications-store";

// Ready-made messages an employer can send to a Deaf candidate. Every one is
// plain text and offers a text reply, so nothing depends on a phone call.
// {name} {job} {company} {formats} are filled in before the employer edits.
export type MessageTemplate = {
  id: string;
  label: string;
  hint: string;
  body: string;
  // Status the application moves to once this is sent.
  sets: Status;
};

export const TEMPLATES: MessageTemplate[] = [
  {
    id: "thanks",
    label: "Thanks for your interest",
    hint: "A warm first reply. Keeps the door open.",
    sets: "messaged",
    body: "Hi {name}, thank you for your interest in the {job} role at {company}. We've read your profile and watched your video. We'll be in touch soon with next steps. If you have any questions in the meantime, reply here in text.",
  },
  {
    id: "questions",
    label: "A few questions for you",
    hint: "Ask in writing before you set up an interview.",
    sets: "messaged",
    body: "Hi {name}, thanks for applying to the {job} role. A few questions for you:\n1. What draws you to this role?\n2. What experience do you have that fits it?\n3. When could you start?\nReply here in text whenever it suits you.",
  },
  {
    id: "interview",
    label: "What time works for an interview?",
    hint: "Asks for their best time and how they'd like to interview.",
    sets: "interview",
    body: "Hi {name}, we'd like to set up an interview for the {job} role. What time works best for you this week or next? For the interview we can offer: {formats}. Tell us which you prefer and we'll set it up.",
  },
  {
    id: "decline",
    label: "Not the right match",
    hint: "A kind, clear answer that says it's about fit. Candidates remember how they were told.",
    sets: "declined",
    body: "Hi {name}, thank you for applying for the {job} role and for the time you put into your profile. After looking closely, this role isn't the right match, and that is about fit, not about you. We enjoyed learning about you. Please keep going, and we'd be glad to see you apply again for other openings.",
  },
];

export function fillTemplate(
  body: string,
  vars: { name: string; job: string; company: string; formats: string },
) {
  return body
    .replaceAll("{name}", vars.name)
    .replaceAll("{job}", vars.job)
    .replaceAll("{company}", vars.company)
    .replaceAll("{formats}", vars.formats);
}
