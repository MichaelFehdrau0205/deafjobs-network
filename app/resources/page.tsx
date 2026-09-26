import type { Metadata } from "next";
import Link from "next/link";
import { ACCOMMODATIONS } from "../employer/accommodations-data";
import { SimplePage } from "../simple-page";
import simple from "../simple-page.module.css";
import styles from "./resources.module.css";

export const metadata: Metadata = {
  title: "Resources — DEAFJOBS",
};

type Resource = { name: string; blurb: string; href: string; host: string };

const CANDIDATE_RESOURCES: Resource[] = [
  {
    name: "Job Accommodation Network (JAN)",
    blurb:
      "Free, confidential guidance on workplace accommodations and how to ask for them, including for Deaf and hard of hearing employees.",
    href: "https://askjan.org",
    host: "askjan.org",
  },
  {
    name: "National Association of the Deaf (NAD)",
    blurb: "Advocacy and plain-language information on your rights at work and in hiring.",
    href: "https://www.nad.org",
    host: "nad.org",
  },
  {
    name: "Your rights under the ADA",
    blurb:
      "The Americans with Disabilities Act requires employers to provide reasonable accommodations, including in the interview.",
    href: "https://www.ada.gov",
    host: "ada.gov",
  },
  {
    name: "EEOC: filing a charge of discrimination",
    blurb: "If you believe you were treated unfairly in hiring, this explains how to file and what to expect.",
    href: "https://www.eeoc.gov",
    host: "eeoc.gov",
  },
];

const EMPLOYER_RESOURCES: Resource[] = [
  {
    name: "Job Accommodation Network (JAN)",
    blurb:
      "Free, confidential advice for employers on accommodations, with real examples and typical costs.",
    href: "https://askjan.org",
    host: "askjan.org",
  },
  {
    name: "IRS Form 8826: Disabled Access Credit",
    blurb:
      "Some small businesses can claim a federal tax credit for accessibility costs. Check current eligibility and amounts.",
    href: "https://www.irs.gov/forms-pubs/about-form-8826",
    host: "irs.gov",
  },
  {
    name: "ADA guidance for employers",
    blurb: "What reasonable accommodation means in practice, for hiring and on the job.",
    href: "https://www.ada.gov",
    host: "ada.gov",
  },
];


type Tool = { name: string; price: string; blurb: string };

// Free and low-cost tools for candidates. Prices change, so the section tells
// people to check before they sign up.
const CANDIDATE_TOOLS: Tool[] = [
  {
    name: "Video Relay Service (VRS)",
    price: "Free",
    blurb:
      "Phone calls through a live ASL interpreter over video. Federally funded, so it costs you nothing. Several providers offer it.",
  },
  {
    name: "Live Captions (built into your phone or computer)",
    price: "Free",
    blurb:
      "iPhone, Mac, Android and Chrome can caption speech on the device, in person or on calls. Turn it on in your accessibility settings.",
  },
  {
    name: "Google Live Transcribe",
    price: "Free",
    blurb: "Turns the speech around you into text on your Android phone, so you can read a conversation as it happens.",
  },
  {
    name: "Speech-to-text apps (Otter, Ava and others)",
    price: "About $5 a month",
    blurb:
      "Handy for interviews and meetings. Turns speech into text as people talk. Prices change, so check the app before you sign up.",
  },
  {
    name: "Typing back and forth",
    price: "Free",
    blurb:
      "A shared notes app or chat works for an interview or a quick question. Employers on DEAFJOBS offer written interviews for exactly this reason.",
  },
];

function ResourceCards({ items }: { items: Resource[] }) {
  return (
    <ul className={styles.cards}>
      {items.map((r) => (
        <li key={r.name} className={styles.card}>
          <p className={styles.cardTitle}>{r.name}</p>
          <p className={styles.cardText}>{r.blurb}</p>
          <a className={styles.external} href={r.href} target="_blank" rel="noopener noreferrer">
            {r.host}
            <span className={styles.srOnly}> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function ResourcesPage() {
  return (
    <SimplePage
      links={[
        { href: "/jobs", label: "Browse jobs" },
        { href: "/how-it-works", label: "How it works" },
        { href: "/privacy", label: "Privacy" },
      ]}
    >
      <h1 className={simple.title}>Resources</h1>
      <p className={simple.intro}>
        Rights, funding and real accommodation prices, in one place. Send this page to a hiring
        manager who has questions.
      </p>

      <nav aria-label="On this page" className={styles.jump}>
        <a href="#candidates">For candidates</a>
        <a href="#employers">For employers</a>
      </nav>

      <section id="candidates" aria-labelledby="candidates-h" className={styles.section}>
        <h2 id="candidates-h" className={`${styles.heading} ${styles.green}`}>
          For Deaf &amp; hard of hearing candidates
        </h2>
        <ResourceCards items={CANDIDATE_RESOURCES} />

        <div className={styles.costs}>
          <h3 className={styles.subheading}>Free and low-cost tools for you</h3>
          <p className={styles.sectionIntro}>
            You shouldn&rsquo;t have to pay much to communicate at work. Most of these are free,
            and the rest cost a few dollars a month. Plans change, so check each one before you
            sign up.
          </p>
          <ul className={styles.costList}>
            {CANDIDATE_TOOLS.map((t) => (
              <li key={t.name} className={styles.costItem}>
                <div className={styles.costHead}>
                  <p className={styles.costName}>{t.name}</p>
                  <p className={styles.costValue}>{t.price}</p>
                </div>
                <p className={styles.cardText}>{t.blurb}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="employers" aria-labelledby="employers-h" className={styles.section}>
        <h2 id="employers-h" className={`${styles.heading} ${styles.blue}`}>
          For employers &amp; hiring managers
        </h2>
        <ResourceCards items={EMPLOYER_RESOURCES} />

        <div id="costs" className={styles.costs}>
          <h3 className={styles.subheading}>What accommodations really cost</h3>
          <p className={styles.sectionIntro}>
            Live captioning is included with every posting. Everything else is optional, and most
            of it runs in the tens of dollars a month.
          </p>
          <ul className={styles.costList}>
            {ACCOMMODATIONS.map((a) => (
              <li key={a.id} className={styles.costItem}>
                <div className={styles.costHead}>
                  <p className={styles.costName}>{a.name}</p>
                  <p className={styles.costValue}>{a.monthlyCost}</p>
                </div>
                <p className={styles.cardText}>{a.description}</p>
              </li>
            ))}
          </ul>
          <p className={styles.footNote}>
            Prices are estimates for planning.{" "}
            <Link href="/how-it-works?for=employers">How it works for employers</Link>
          </p>
        </div>
      </section>

    </SimplePage>
  );
}
