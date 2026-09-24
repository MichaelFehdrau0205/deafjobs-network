# CLAUDE CODE STARTER — deafjobs-network

Drop-in context for building DEAFJOBS with Claude Code.

**How to use this file:** copy everything between the `CLAUDE.md` markers into a file called `CLAUDE.md` at your repo root. Claude Code reads it automatically at the start of every session, so you never have to re-explain the project. Then use the starter prompts at the bottom to kick off each task.

---

## Part 1 — The `CLAUDE.md` file

<!-- ====== BEGIN CLAUDE.md ====== -->

# DEAFJOBS — Project Context

A job platform for Deaf and hard-of-hearing people. Candidates get first access to postings; employers complete a structured commitment before they can post.

Full product docs live in `/docs`: `PRD.md` (what and why), `SPRINT.md` (what's being built now), `PAGES-GOALS.md` (every screen). Read `PRD.md` §6 before proposing anything that changes product behavior.

## Stack

- **Next.js** (App Router, TypeScript)
- **Supabase** — Postgres, auth, storage, row-level security
- **Vercel** — hosting, deploys on push to `main`
- **shadcn/ui + Tailwind** — components
- **Speech-to-text API** — caption generation

Web only, mobile-responsive. No native apps.

## Non-negotiable rules

These are product integrity, not style preferences. Do not violate them to make something work, and flag it rather than working around them.

**1. Access gating is enforced by RLS, never by the UI.**
"Postings are visible only to attested Deaf candidates" is the central promise. It lives in Postgres row-level security so a UI bug cannot leak the job board.
- Never use the service-role key on a user-facing path
- Never filter postings client-side and call it access control
- Every new table gets RLS policies in the same migration that creates it

**2. Auto-captions are always human-edited before publishing.**
Speech-to-text is wrong 5–15% of the time. Garbled captions on a Deaf-first platform destroy credibility with the exact community this serves.
- The caption review screen cannot be skipped when a video exists
- Publishing is blocked until `transcript_edited = true`
- No "edit later" escape hatch

**3. Employers cannot browse candidates.**
`candidate_profile` is readable by an employer *only* for candidates who applied to one of their postings. This platform is not a database of Deaf people to be catalogued. Any future sourcing feature must be opt-in per candidate.

**4. Accessibility is the product, not a checklist item.**
- Semantic HTML, real labels, keyboard navigable, visible focus states
- Every video has captions; every audio cue has a visual equivalent
- **Never rely on sound for any state change, notification, or feedback.** No audio-only alerts, ever
- Test with keyboard only before calling a screen done
- Target WCAG 2.2 AA

**5. Salary range is required on every posting.** Not a nudge, not optional. It's a trust signal on a platform built around employer good faith.

## Data model

Full schema in `/docs/PRD.md` §7. Core entities:

`user` · `candidate_profile` · `employer_profile` · `employer_commitment` · `job_posting` · `application` · `accommodation_resource`

Notes that are easy to get wrong:
- `employer_commitment` is its own versioned row, not columns on `employer_profile` — a commitment signed by someone who has since left shouldn't render as current
- `job_posting.deaf_exclusive_until` is nullable and currently always null (= gated forever). It exists so a time-limited exclusivity window stays possible without a migration
- `application` is unique on (`job_posting_id`, `candidate_id`)
- `application.status` is visible to the candidate. Never hide it

## RLS policies — the six tests

Any change touching access control must keep these passing:

1. Logged-out visitor → zero rows from `job_posting`
2. Employer → zero rows from other employers' postings
3. Candidate with `deaf_attestation = false` → zero published postings
4. Candidate with `deaf_attestation = true` → all published postings
5. Employer reading `candidate_profile` → only candidates who applied to *their* postings
6. Candidate reading `application` → only their own

## Conventions

- TypeScript strict. No `any` without a comment explaining why
- Server Components by default; `"use client"` only when there's interactivity
- Supabase clients: `lib/supabase/client.ts` (browser), `server.ts` (RSC/actions), `admin.ts` (service role — server-only, never imported into a client path)
- Mutations go through Server Actions, not API routes, unless there's a reason
- Migrations in `/supabase/migrations`, never hand-edit the remote schema
- Conventional commits

## Tone in UI copy

The product exists because Deaf people are routinely condescended to. The writing shouldn't do the same thing.

- Plain, direct, adult. No inspirational framing
- Never "special needs," "hearing impaired," "suffers from," or "differently abled." Use "Deaf," "hard of hearing," "Deaf and HoH." Capital-D Deaf when referring to the cultural community
- Communication preferences are framed as *how someone works best* — not as needs, limitations, or accommodations required
- Don't thank employers for their bravery in considering a Deaf candidate. They're hiring someone who can do the job

## Working style for this repo

- This is a solo project. Prefer boring, maintainable choices over clever ones
- If a task is ambiguous, ask before building — a wrong build costs more than a question
- When you touch access control or captions, say so explicitly in your summary
- Don't add dependencies without flagging them
- Don't expand scope. `SPRINT.md` has a cut list; check it before building something that feels obviously missing — it was probably cut on purpose

<!-- ====== END CLAUDE.md ====== -->

---

## Part 2 — Starter prompts

One per sprint task. Paste, adjust, go.

### Task 2 — Repo + infrastructure

```
Set up the deafjobs-network project from scratch.

- Next.js with TypeScript and the App Router
- Tailwind + shadcn/ui initialized
- Supabase client factories in lib/supabase/: client.ts (browser),
  server.ts (RSC + server actions), admin.ts (service role, server-only)
- Email/password auth with a role field (candidate | employer | admin)
  set at signup
- Protected route groups: /candidate, /employer, /admin
- .env.example with every variable named
- Deployable to Vercel

Goal: I can deploy this today and log in on a real URL. Skip anything
that isn't needed for that.
```

### Task 3 — Schema + RLS

```
Write the initial Supabase migration for the schema in docs/PRD.md §7.

Include RLS policies in the same migration — every table, no exceptions.

Then write tests for the six RLS cases listed in CLAUDE.md. Use real
Supabase clients authenticated as different users, not mocks. These
tests are the product's integrity; they need to actually exercise the
database.

Also seed accommodation_resource with 10-15 real accessibility tools
and their real monthly prices. Flag any price you aren't confident
about rather than guessing — these numbers get shown to employers as
fact.
```

### Task 4 — Candidate profile builder

```
Build the candidate profile flow from docs/PAGES-GOALS.md — the six
steps under /candidate/profile/new, with progress saved between them.

The caption review step (step 3) is the important one:
- Auto-generate the transcript on video upload
- Editor alongside the playing video
- Explicit "these captions are accurate" confirmation that sets
  transcript_edited
- Publishing is blocked until that's true, and there is no skip

Video itself is optional — a candidate can go written-only. Make the
skip visible but not the default path.

Read the PAGES-GOALS notes on tone for step 5. Communication
preferences are framed as how someone works best, not as needs.
```

### Task 5 — Employer commitment + posting

```
Build the employer flow: /employer/commitment, /employer/company,
/employer/jobs/new. Specs in docs/PAGES-GOALS.md.

Two things to get right:

1. The commitment form gates posting. An employer who hasn't signed
   cannot reach the posting form.
2. In the accommodations checklist, show the real monthly cost beside
   each item, pulled from accommodation_resource. This is the highest-
   leverage content in the product — make it prominent, not a tooltip.

Salary range is a required field on the posting form.

Then build the commitment card component that renders on every posting.
```

### Task 6 — Browse + apply

```
Build /candidate/jobs, /candidate/jobs/[id], and the apply flow.

A list with two filters (remote/on-site, full-time/part-time). NOT
search — under 50 postings search returns nothing and feels broken.

On the job detail page the commitment card is prominent. It's the
reason this page differs from any other job listing.

Verify the access gating works via RLS by testing with a non-attested
candidate account — they should get zero rows from the database, not
a hidden UI.
```

### Task 7 — Application inbox

```
Build /employer/jobs/[id]/applications and
/employer/applications/[id], plus /candidate/applications.

On the application detail page, the captioned video player is first
and largest — above the resume. Reading along while seeing the
candidate is the core product insight; don't demote it.

Include the one-line contextual note about interviewing with an
interpreter, shown when moving status toward "interview."

Status changes must be visible on the candidate's applications page.
```

---

## Part 3 — Prompts worth reusing

**Before merging anything that touches access:**
```
Review this diff for access-control regressions. Check specifically:
service-role key on any user-facing path, client-side filtering
standing in for RLS, and whether all six RLS tests still pass.
```

**Accessibility pass on a screen:**
```
Audit this page for WCAG 2.2 AA. Check keyboard navigation end to end,
focus visibility, form labels, heading order, and any place where
state is communicated by sound or color alone. This is a Deaf-first
product — nothing may rely on audio.
```

**When a screen feels unfinished:**
```
Compare this implementation against the entry in docs/PAGES-GOALS.md.
What's specified there and missing here? Ignore anything on the cut
list in docs/SPRINT.md.
```

---

## A note on using Claude Code for this project

Two failure modes to watch for, since much of this project's value sits in decisions that are easy for a coding assistant to quietly optimize away:

**Scope creep.** Ask for a job board and you'll get search, saved jobs, alerts, and a dashboard — all reasonable, all cut on purpose. `SPRINT.md` has the cut list. Point at it.

**Security softening.** RLS policies are fiddly, and the path of least resistance when one is inconvenient is to reach for the service-role key. That single move converts the product's central promise into an illusion. If a policy is blocking something, fix the policy — don't route around it.
