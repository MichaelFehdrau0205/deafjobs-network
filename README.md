# DEAFJOBS

A job platform built for Deaf and hard-of-hearing people — where candidates get first access to roles, and employers arrive having already committed to what supporting a Deaf hire actually requires.

---

## The short version

For too long, Deaf and hard-of-hearing people have been boxed in by a "can't do it" system — one where a communication barrier gets mistaken for a competency barrier. Managers assume a Deaf person isn't functional for a role rather than recognizing they can do, or train for, any job they want.

DEAFJOBS flips that into a "can do it" system: a platform that gives Deaf candidates a real shot, and gives employers the understanding they need to say yes.

The core bet: **most employer hesitation comes from unfamiliarity and cost assumptions — not malice, and not a real gap in ability.** So the product doesn't just list jobs. It closes that gap directly, at the moment the hesitation happens.

---

## What makes it different from a job board

| | Ordinary job board | DEAFJOBS |
|---|---|---|
| Who sees a posting | Everyone | Deaf and HoH candidates only |
| Employer intent | Unknown | A structured, signed commitment on every posting |
| Candidate profile | Resume | Captioned video introduction + resume |
| Accommodation cost | Employer guesses (badly) | Real prices shown at the moment of decision |
| Who the platform serves | Employers | Candidates |

---

## Documents in this folder

| File | What it's for |
|---|---|
| `README.md` | You are here — orientation and setup |
| `PRD.md` | What we're building and why. Product decisions live here |
| `SPRINT.md` | What's being built right now, in order |
| `PAGES-GOALS.md` | Every screen in v1, what it's for, and when it's done |
| `CLAUDE-CODE-STARTER-deafjobs-network.md` | Drop-in context + guardrails for building with Claude Code |

Read `PRD.md` first if you're new to the project. Read `SPRINT.md` if you're about to write code.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (React, App Router) | One codebase for server and client |
| Database / auth / storage | Supabase (Postgres) | Row-level security enforces access gating at the DB — see below |
| Hosting | Vercel | Free tier covers v1, deploys on push |
| UI | shadcn/ui + Tailwind | Accessible components without building a design system |
| Captions | Speech-to-text API (Whisper / Deepgram / AssemblyAI) | Auto-draft, then human-edited |

**Web only for v1.** Mobile-responsive, installable to home screen. No native apps — two extra codebases and app store review cycles are the wrong cost for a solo builder, and browsers handle video recording natively.

---

## Two rules that are not negotiable

These are worth stating in the README because they're the kind of thing that quietly erodes under deadline pressure.

**1. Access gating is enforced in the database, not the UI.**
"Postings are visible only to Deaf candidates" is the central promise of this product. It is implemented as Postgres row-level security so that a bug in a React component cannot leak the job board. Never fetch postings with a service-role key on a user-facing path.

**2. Auto-generated captions are always human-edited before publishing.**
Speech-to-text is wrong 5–15% of the time. Shipping garbled captions on a Deaf-first platform is an own-goal that costs credibility with exactly the community this is for. The transcript edit step is part of the publish flow — not an optional "you can fix this later" link.

---

## Setup

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env.local
# Fill in:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY   (server-only, never in client code)
#   TRANSCRIPTION_API_KEY

# 3. Database
supabase db push          # schema + RLS policies
supabase db seed          # accommodation resources, test users

# 4. Run
npm run dev
```

Deployed to Vercel on push to `main`. Preview deploys on every branch.

---

## Project structure

```
/app                    Next.js routes
  /(marketing)          Landing, about — public
  /(auth)               Sign up, log in, attestation
  /candidate            Profile builder, browse, apply, my applications
  /employer             Commitment form, post a job, application inbox
  /admin                Reports queue
/components             shadcn/ui + project components
/lib
  /supabase             Client factories (browser / server / admin)
  /transcription        Speech-to-text + caption handling
/supabase
  /migrations           Schema and RLS policies
  /seed                 Accommodation resource catalogue
/docs                   These five documents
```

---

## Status

**Pre-build.** Product decisions are locked (see `PRD.md` §6). Sprint 1 is scoped (see `SPRINT.md`). No code written yet.

**Definition of v1 success: one real hire.** Not profile counts, not posting counts — those are easy to move and prove nothing. One Deaf person employed through this platform proves the thesis and is the story that brings in the next twenty employers.

---

## The hardest problem, stated plainly

Every feature in these documents assumes job postings exist. A Deaf-first job board with four jobs on it fails no matter how well it's built.

Getting the first ten employers is the biggest risk to this project, and it is not a software problem. It won't be solved by anything in this repo. Budget real time for it alongside the build — not after.
