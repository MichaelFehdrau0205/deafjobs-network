import type { Metadata } from "next";
import { SimplePage } from "../simple-page";
import simple from "../simple-page.module.css";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy — DEAFJOBS",
};

// Plain language, and only what is true of this build today. It does not claim
// any legal compliance: DEAFJOBS collects no health information.
type Item = { q: string; a: string[] };

const ITEMS: Item[] = [
  {
    q: "What is this?",
    a: [
      "DEAFJOBS is a demo. There is no server database, no real accounts and no real employers yet. This page says what happens to your information today, and what we would keep doing as it grows.",
    ],
  },
  {
    q: "Where does my video go?",
    a: [
      "Nowhere. Your video stays in your own browser tab. It isn't uploaded or saved. When you close the tab, or record a new one, it's gone.",
    ],
  },
  {
    q: "What happens to the profile I type?",
    a: [
      "It stays in your browser too. If you refresh the page, the profile builder starts over. Nothing you type in the profile is sent to us.",
    ],
  },
  {
    q: "What happens to my resume?",
    a: [
      "When you upload a resume, the file is sent to our site for a moment so it can be read and turned into text you can check. We don't keep the file or the text. The text comes back to your browser, and that's where it stays.",
    ],
  },
  {
    q: "Is my sign-in real?",
    a: [
      "No. The sign-in and create-account forms are for the demo. They accept any email and any password, and nothing is sent or saved. Please don't type a real password.",
    ],
  },
  {
    q: "What is saved on my device?",
    a: [
      "A few small things, so the demo remembers you between pages: whether you're signed in as a candidate or an employer, the sample applications and messages, how you'd like to be alerted, and a reminder to add a video. They're stored in your browser only. On the Your applications page, \"Reset the demo\" clears the sample applications.",
    ],
  },
  {
    q: "Do you use cookies or tracking?",
    a: [
      "We don't set cookies, and we don't use analytics or advertising trackers. Our hosting service keeps standard server logs, like the time of a visit and the network address it came from.",
    ],
  },
  {
    q: "How do I delete everything?",
    a: [
      "Close the tab to lose your video and your profile. To clear the small saved items, clear this site's data in your browser settings.",
    ],
  },
  {
    q: "What about health information and laws like HIPAA?",
    a: [
      "DEAFJOBS doesn't collect health information, so HIPAA doesn't apply to it. If a product like this ever handled health or wellness details, we would design for it from the start: ask for only what's needed, explain it in plain words, ask clearly before collecting it, keep it out of web addresses and notifications, and let people see and delete their own information.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <SimplePage
      links={[
        { href: "/how-it-works", label: "How it works" },
        { href: "/resources", label: "Resources" },
      ]}
    >
      <h1 className={simple.title}>Privacy</h1>
      <p className={simple.intro}>
        Your information is yours. Here is what happens to it, in plain words.
      </p>
      <div className={styles.list}>
        {ITEMS.map((item) => (
          <section key={item.q} className={styles.item} aria-labelledby={`p-${item.q.length}-${item.q.charCodeAt(0)}`}>
            <h2 className={styles.question} id={`p-${item.q.length}-${item.q.charCodeAt(0)}`}>
              {item.q}
            </h2>
            {item.a.map((p) => (
              <p key={p} className={styles.answer}>
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </SimplePage>
  );
}
