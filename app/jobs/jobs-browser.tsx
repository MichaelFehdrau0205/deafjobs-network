"use client";

import { useMemo, useState } from "react";
import { JOBS } from "./jobs-data";
import styles from "./jobs.module.css";

const STATES = ["NY", "NJ", "CT"] as const;

function stateOf(location: string): string | null {
  for (const s of STATES) {
    if (location.endsWith(`, ${s}`)) return s;
  }
  return null;
}

// A wider spread of flat tones cycled by company name so each logo tile
// reads distinctly, standing in for each company's own brand color.
const LOGO_COLORS = [
  "#1400e6", // blue
  "#00895c", // green
  "#b5540a", // orange
  "#7a1fb0", // purple
  "#0a6fb0", // sky
  "#c21858", // pink/red
  "#8a7000", // olive
  "#0f766e", // teal
  "#a8331f", // rust
  "#455a9c", // slate blue
];

function logoColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return LOGO_COLORS[hash % LOGO_COLORS.length];
}

export function JobsBrowser() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return JOBS.filter((job) => {
      if (state && stateOf(job.location) !== state) return false;
      if (!q) return true;
      const haystack = [job.title, job.company, job.location, ...job.tags].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [query, state]);

  return (
    <>
      <div className={styles.searchRow}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by title, company, or keyword"
          aria-label="Search jobs by title, company, or keyword"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className={styles.locationSelect}
          aria-label="Filter by state"
          value={state}
          onChange={(e) => setState(e.target.value)}
        >
          <option value="">All areas (NY, NJ, CT)</option>
          <option value="NY">New York</option>
          <option value="NJ">New Jersey</option>
          <option value="CT">Connecticut</option>
        </select>
      </div>

      <p className={styles.resultCount}>
        {filtered.length} {filtered.length === 1 ? "job" : "jobs"} found
      </p>

      {filtered.length === 0 ? (
        <p className={styles.empty}>
          No demo listings match that search. Try a different keyword or area.
        </p>
      ) : (
        <ul className={styles.list}>
          {filtered.map((job) => (
            <li className={styles.card} key={job.id}>
              <div
                className={styles.logo}
                style={{ background: logoColor(job.company) }}
                aria-hidden="true"
              >
                {job.company.charAt(0)}
              </div>
              <div className={styles.cardMain}>
                <p className={styles.cardTitle}>{job.title}</p>
                <p className={styles.cardCompany}>{job.company}</p>
                <p className={styles.cardLocation}>{job.location}</p>
                <div className={styles.tagRow}>
                  {job.remote && <span className={styles.tag}>Remote-friendly</span>}
                  {job.hiredDeafBefore && (
                    <span className={`${styles.tag} ${styles.tagCheck}`}>
                      <span aria-hidden="true">✓</span> Has hired Deaf employees before
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.cardSide}>
                <span className={styles.salary}>{job.salaryRange}</span>
                <span className={styles.commitmentBadge}>
                  {job.commitmentCount} accommodations committed
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
