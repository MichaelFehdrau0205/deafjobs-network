# DEAFJOBS — Sprint 1

**Duration:** 1–2 weeks
**Team:** solo
**Status:** not started

---

## Goal

One end-to-end thin slice: **a candidate can build a profile and apply; an employer can post a role and see the application.**

Nothing else. If a task doesn't serve that sentence, it belongs in the backlog.

---

## Exit criteria

In one sitting, on the **deployed URL** (not localhost), you can:

1. Create a candidate account and attest
2. Publish a profile with a video and an **accurate, hand-edited** caption transcript
3. Log out, sign up as an employer
4. Complete the commitment form
5. Post a role with a salary range
6. Log back in as the candidate, find that role, and apply
7. Log back in as the employer and see the application in the inbox
8. Move it to "in review" and see the status change on the candidate's side

If any step requires you to explain a workaround out loud, the sprint isn't done.

---

## Tasks

| # | Task | Side | Depends on | Done when |
|---|---|---|---|---|
| 1 | Lock product decisions | Platform | — | `PRD.md` §6 reviewed; disagreements resolved |
| 2 | Repo + Supabase + Vercel + auth | Platform | 1 | A deployed URL where you can log in |
| 3 | Schema migration + RLS policies + seed | Platform | 2 | RLS tests pass (see below) |
| 4 | Candidate: signup → attestation → profile | Candidate | 3 | Profile publishes with edited transcript |
| 5 | Employer: signup → commitment → post a job | Employer | 3 | Posting live with commitment card |
| 6 | Candidate: browse → job detail → apply | Candidate | 4, 5 | Application row lands in DB |
| 7 | Employer: application inbox + status control | Employer | 6 | Status change visible to candidate |
| 8 | Walk the full loop as both users | Platform | 7 | All exit criteria pass on deployed URL |

**Suggested order:** strictly 1 → 8. Each unblocks the next; there's no useful parallelism when you're one person.

---

## Task notes

### 2 — Repo + infrastructure
Get a deployed URL with working login **on day one**, before any feature work. Deploying late is how solo projects discover their auth doesn't work in production during week two. Boring and unglamorous; do it first.

### 3 — Schema + RLS
Write the RLS policies in the same task as the schema, not later. "We'll add security after" is how the central promise of this product quietly becomes a UI-only illusion.

**RLS tests to write here, before moving on:**

- A logged-out visitor gets zero rows from `job_posting`
- An employer account gets zero rows from other employers' postings
- A candidate with `deaf_attestation = false` gets zero published postings
- A candidate with `deaf_attestation = true` gets all published postings
- An employer reading `candidate_profile` gets only candidates who applied to *their* postings
- A candidate reading `application` gets only their own

Six tests. They are the product's integrity, in code.

### 4 — Candidate profile
The multi-step flow: basics → video → **transcript edit** → resume → skills & communication preferences → review & publish.

The transcript edit step is a required screen, not a skippable one. Auto-generate on upload, present it in an editor next to the playing video, require an explicit "these captions are correct" confirmation before publish.

Video is optional (PRD §6.6) — a candidate can skip to a written-only profile. Make the skip available but not the path of least resistance.

### 5 — Employer commitment + posting
The commitment form comes **before** the ability to post, and gates it. An employer who won't complete it doesn't get to post — that's the whole product.

Show real monthly costs beside each accommodation checkbox. That's the highest-leverage content in the platform (PRD §6.5) and it's three lines of JSX pulling from `accommodation_resource`.

Salary range is a required field.

### 6 — Browse + apply
**A list and two filters. Not search.** Under ~50 postings, search is worse than a list — it returns nothing and feels broken. Filters: remote/on-site, and full-time/part-time. That's it.

Job detail page renders the commitment card prominently. It's the reason a candidate trusts the posting.

### 7 — Application inbox
A list, a detail view with the candidate's video and resume, and a status dropdown. Changing status updates the candidate's view.

No bulk actions, no notes, no ratings, no team assignment.

---

## Explicitly cut from v1

Listed so they can be cut once rather than re-litigated weekly:

- Search (a list is fine under ~50 jobs)
- In-app messaging
- Notifications beyond one transactional email per application
- Employer analytics or dashboard
- Saved jobs / job alerts
- Employer reviews and ratings
- Interactive training module
- Candidate sourcing / employer-side browse
- Native mobile apps
- Team seats, ATS integration, billing

---

## On the wireframe tasks

The original plan had three standalone wireframe tasks (candidate profile, job posting form, browse view). **Recommendation: skip them and build the screens directly with shadcn/ui.**

Solo, wireframing is frequently a full pass of work that gets thrown away, and component libraries have made "sketch first" much cheaper to skip. `PAGES-GOALS.md` already does the thinking that wireframes would — what each screen is for and what's on it.

**The exception:** if you need something to show other people — a cohort review, a pitch, an employer conversation before the build exists — then wireframes are worth making, for that reason rather than as a design step. Say so and they can be built as clickable HTML.

---

## Sprint 2 candidates

Not committed — just where things point next.

- Onboard the first 5 employers by concierge (PRD §6.3)
- Plain-language privacy policy (PRD §10.2)
- Transactional email: application received, status changed
- Seed the accommodation resource catalogue with real, price-checked tools
- Report/flag handling for profiles
- Basic admin view

---

## The thing this sprint doesn't address

Getting employers to post.

Sprint 1 produces a platform where the loop works. It does not produce a platform with jobs on it. Those are different problems, and the second one is harder and is not solved by code.

Budget time for employer outreach **alongside** this sprint, not after it. Arriving at the end of Sprint 1 with a working product and zero postings is the most likely way this project stalls.
