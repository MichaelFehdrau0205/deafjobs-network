import Link from "next/link";
import styles from "./page.module.css";

// DEAF and JOBS paths, lifted from deafjobs-wordmark-outlined.svg and split
// into two SVGs, each with its viewBox cropped tightly to its own ink (no
// padding above/below). Fills are hardcoded, overriding the source file's
// colors: DEAF renders blue (on the green half), JOBS renders green (on the
// blue half).
function DeafMark() {
  return (
    <svg
      className={`${styles.markPart} ${styles.deaf}`}
      viewBox="0 0 746.75 177.8"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        fill="#1400e6"
        d="M193.29,87.63c0,58.42-50.04,90.17-87.38,90.17H0V0h107.95c43.69,0,85.34,33.27,85.34,87.63ZM133.35,87.38c0-28.7-18.03-40.39-45.47-40.39h-28.45v83.82h30.48c24.89,0,43.43-16.76,43.43-43.43Z"
      />
      <path
        fill="#1400e6"
        d="M273.05,46.74v18.54h97.54v46.99h-97.54v18.79h97.54v46.74h-156.97V0h156.97v46.74h-97.54Z"
      />
      <path
        fill="#1400e6"
        d="M512.57,159.76h-64.01l-4.83,18.03h-61.72L433.83,0h93.47l51.82,177.8h-61.72l-4.83-18.03ZM499.87,112.27l-17.27-65.28h-4.06l-17.27,65.28h38.61Z"
      />
      <path
        fill="#1400e6"
        d="M649.98,46.99v18.29h96.77v46.99h-96.77v65.53h-59.44V0h156.21v46.99h-96.77Z"
      />
    </svg>
  );
}

function JobsMark() {
  // The viewBox top is the flat cap line of J/B/S (177.47), not O's round
  // overshoot (174.68) -- otherwise the box has blank space above J/B/S
  // that shows as a strip of the section's own background. overflow="visible"
  // lets O's overshoot still paint above that line, into the green half,
  // instead of being clipped by the tighter box.
  return (
    <svg
      className={`${styles.markPart} ${styles.jobs}`}
      viewBox="0.41 177.47 753.19 180.34"
      preserveAspectRatio="none"
      overflow="visible"
      aria-hidden="true"
    >
      <path
        fill="#00e87a"
        d="M.41,270.94h59.18c.51,24.89,10.16,37.34,27.94,37.34s26.67-12.7,26.67-36.32v-94.49h59.44v96.26c0,59.94-38.35,84.07-86.36,84.07C33.18,357.81.41,326.82.41,270.94Z"
      />
      <path
        fill="#00e87a"
        d="M188.91,266.12c0-50.54,41.15-91.44,91.69-91.44s91.69,40.89,91.69,91.44-41.15,91.69-91.69,91.69-91.69-40.89-91.69-91.69ZM313.37,266.12c0-18.03-14.73-32.77-32.77-32.77s-32.77,14.73-32.77,32.77,14.73,33.02,32.77,33.02,32.77-14.73,32.77-33.02Z"
      />
      <path
        fill="#00e87a"
        d="M561.85,265.61c6.6,9.14,10.67,20.83,10.67,33.27,0,35.56-22.1,56.39-58.17,56.39h-127v-177.8h127c36.07,0,58.17,20.57,58.17,56.13,0,11.94-4.06,23.11-10.67,32ZM446.78,223.95v19.3h58.93c5.59,0,9.65-3.81,9.65-9.91s-4.06-9.4-9.65-9.4h-58.93ZM515.36,298.88c0-6.1-4.06-9.65-9.65-9.65h-58.93v19.56h58.93c5.59,0,9.65-3.81,9.65-9.91Z"
      />
      <path
        fill="#00e87a"
        d="M589.78,308.28h92.71c7.87,0,11.68-3.56,11.68-9.4s-3.81-9.14-11.94-9.14h-42.16c-29.72,0-53.85-20.32-53.85-56.13,0-41.15,28.19-56.13,56.64-56.13h105.16v46.99h-90.68c-6.86,0-11.68,2.54-11.68,8.89s4.83,9.4,11.68,9.4h39.62c34.04,0,56.64,20.07,56.64,55.88,0,33.78-25.4,56.64-58.42,56.64h-106.17l.76-46.99Z"
      />
    </svg>
  );
}

function Wordmark({ hidden }: { hidden?: boolean }) {
  const marks = (
    <>
      <DeafMark />
      <JobsMark />
    </>
  );

  return hidden ? (
    <div className={styles.markwrap} aria-hidden="true">
      {marks}
    </div>
  ) : (
    <h1 className={styles.markwrap} role="img" aria-label="DEAFJOBS">
      {marks}
    </h1>
  );
}

export default function Home() {
  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#employers">
        Skip to the section for employers
      </a>

      {/* ============ TOP · GREEN · CANDIDATES ============ */}
      <section
        className={`${styles.half} ${styles.top}`}
        id="candidates"
        aria-labelledby="candidates-zone"
      >
        <div className={styles.inner}>
          <nav aria-label="Candidate navigation">
            <ul className={styles.links}>
              <li>
                <a href="#">
                  <span className={styles.full}>Browse jobs</span>
                  <span className={styles.short}>Jobs</span>
                </a>
              </li>
              <li>
                <a href="#">How it works</a>
              </li>
              <li>
                <Link href="/profile/new">
                  <span className={styles.full}>Your </span>profile
                </Link>
              </li>
              <li>
                <a href="#">Resources</a>
              </li>
              <li>
                <a href="#">Sign in</a>
              </li>
            </ul>
          </nav>

          <p className={styles.copy}>
            <strong>Every job here is open to you first.</strong> Hearing ap&shy;pli&shy;cants
            don&rsquo;t see these postings. Every employer answered real questions before
            they could post. You see their answers before you apply.{" "}
            <strong>Apply for the job you actually want.</strong>
          </p>

          <p className={styles.zone} id="candidates-zone">
            For Deaf &amp; hard of hearing candidates
          </p>
        </div>

        <Wordmark />
      </section>

      {/* ============ BOTTOM · BLUE · EMPLOYERS ============ */}
      <section
        className={`${styles.half} ${styles.bottom}`}
        id="employers"
        aria-labelledby="employers-zone"
        tabIndex={-1}
      >
        <Wordmark hidden />

        <div className={styles.inner}>
          <p className={styles.zone} id="employers-zone">
            For employers &amp; hiring managers
          </p>

          <p className={styles.copy}>
            <strong>You&rsquo;ve probably passed on a Deaf candidate without meaning to.</strong>{" "}
            Not prejudice. Just not knowing how it would work. Cap&shy;tion&shy;ing comes with
            your posting. The support is a few minutes, not a full-time condition. And you
            won&rsquo;t figure it out alone. They&rsquo;ve done this more times than
            you have. Then the training ends, and you just have a Deaf employee.{" "}
            {/* Each closing sentence is unbreakable (white-space: nowrap), so a
                line can end between them but never inside one. */}
            <strong className={styles.sentence}>Post a role.</strong>{" "}
            <strong className={styles.sentence}>Answer four questions.</strong>
          </p>

          <nav aria-label="Employer navigation">
            <ul className={styles.links}>
              <li>
                <a href="#">Post a role</a>
              </li>
              <li>
                <a href="#">
                  <span className={styles.full}>The </span>commitment
                </a>
              </li>
              <li>
                <a href="#">
                  <span className={styles.full}>What it </span>costs
                </a>
              </li>
              <li>
                <a href="#">How it works</a>
              </li>
              <li>
                <a href="#">Sign in</a>
              </li>
            </ul>
          </nav>
        </div>

        <p className={styles.footnote}>
          Federal law and tax credits already cover this. You&rsquo;re not doing anything
          unusual.
        </p>
      </section>
    </div>
  );
}
