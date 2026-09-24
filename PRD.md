# DEAFJOBS — Product Requirements Document

**Status:** v2 — open questions resolved
**Last updated:** August 2026

---

## 1. Overview

**Mission:** For too long, Deaf and hard-of-hearing people have been boxed in by a "can't do it" system — one where the communication barrier gets mistaken for a competency barrier, and managers assume a Deaf person simply isn't functional for a role rather than recognizing they can do — or train for — any job they want. DEAFJOBS exists to flip that into a "can do it" system: a platform that gives Deaf candidates a real shot, and gives employers the understanding they need to say yes.

**Problem:** Deaf job seekers face structural barriers in hiring rooted in communication, not capability. Employers hesitate or reject candidates because they misjudge what a Deaf employee can do, and default to assumptions about accommodation cost and unfamiliarity with how Deaf employees function on the job. Existing job platforms treat Deaf candidates as an afterthought, competing for the same postings as hearing applicants with no signal of employer intent and no bridge across that communication gap.

**Solution:** DEAFJOBS is a job platform built specifically for the Deaf community, where:

- Deaf candidates get first access to postings — not open to hearing applicants competing for the same roles.
- Deaf and hard-of-hearing candidates are supported in applying to and training for any job they want — not steered toward a narrow set of "acceptable" roles.
- Employers who post are signaling genuine intent to hire Deaf talent — not performative inclusion.
- The platform actively works to change employer minds, helping managers understand the Deaf point of view and surfacing the unspoken resistance hearing companies have toward hiring Deaf people — giving candidates a real chance to prove they can do the job.

**Core belief driving the product:** Most employer hesitation comes from unfamiliarity and cost assumptions — not malice, and not a real gap in ability. DEAFJOBS should close that gap directly, rather than just listing jobs.

---

## 2. Goals

- Give Deaf candidates a job search space that isn't competing with the hearing majority.
- Lower the perceived cost/friction of hiring Deaf employees for companies.
- Build employer trust and understanding of Deaf employees' work capability — not just compliance, genuine confidence.
- Create switching costs / loyalty for employers by embedding accessibility tools directly in the platform.

> **Note on Goal 4:** captioning is **bundled into the posting** (§6.7) rather than being a tool the employer goes and buys. That delivers the goal in the window that matters: while a role is open, the captioning lives inside DEAFJOBS, and leaving means losing it. It lapses when the posting closes, so the lock-in is real but time-boxed. Longer-term embedding across the employment relationship stays in the backlog (§8).

---

## 3. Non-Goals (for now)

- Not a general-purpose job board.
- Not an interpreter-booking or staffing agency.
- Not (yet) solving accommodation needs outside hiring/employment (e.g., not a broader accessibility suite).
- Not a candidate-sourcing database. Employers cannot browse candidates in v1 — they see only people who applied to their postings.

---

## 4. Target Users

**Candidate side:** Deaf job seekers across skill levels and industries looking for employers who will genuinely hire and support them.

**Employer side:** Companies (or hiring managers) who state real intent to hire Deaf workers — self-selected by completing a structured commitment, not vetted by us.

---

## 5. Core Features (v1 Scope)

### Candidate Side

- **Profile creation:** video introduction with captions, paired with a traditional written resume — lets hiring managers "read along" while seeing the candidate directly. Video is strongly encouraged and prominently placed, but a written-only profile is permitted (see §6.6).
- **Job browsing:** postings visible only to attested Deaf candidates.
- **Application flow:** apply directly through captioned video + resume.
- **Application status:** candidates see where every application stands.

### Employer Side

- **Job posting:** post roles with a structured commitment to hiring Deaf talent. Salary range required.
- **Captioning, included:** live captioning is bundled with a posting and active for as long as that posting is open (§6.7). The employer never sources or purchases a tool separately.
- **Accommodation catalogue:** real costs for everything captioning doesn't cover (interpreters, meeting norms), shown at the point of decision rather than in a resources tab.
- **Understanding component:** in-context content that helps employers understand how Deaf employees function day-to-day, countering the instinct to default to rejection or termination.
- **Application inbox:** review applicants, move them through statuses.

### Platform-wide

- **Access gating:** enforce Deaf-candidate-first access to postings, at the database layer.
- **Trust/intent signaling:** a commitment card on every posting so candidates can gauge which employers are serious.

---

## 6. Decisions

These were the open questions in v1 of this document. Each is now resolved, with the reasoning kept so the decision can be revisited deliberately rather than accidentally.

### 6.1 How is "Deaf candidate" access verified at signup?

**Decision: self-attestation with meaningful friction. No documentation, no gatekeepers.**

At signup a candidate checks a box: *"I am Deaf or hard of hearing."* No audiogram, no letter, no community vouching.

Reasoning:

- Requiring medical proof is invasive and makes us custodian of sensitive health data we don't want to hold.
- Any verification standard wrongly excludes someone — late-deafened people, hard-of-hearing people who don't sign, people who identify culturally Deaf without meeting an audiological threshold. This product's entire thesis is that Deaf people get boxed out by other people's definitions of what they are. A gate that does the same thing undercuts it.
- **Fraud incentive is near zero.** A hearing job seeker has every other job board on the internet. Nobody fakes a disability to access a *smaller* pool of jobs.

The friction that matters isn't the checkbox — it's the profile. Recording a video introduction and specifying communication preferences self-selects far better than any verification step.

**Backstop:** a report link on every profile, reviewed by hand. At v1 volume, a few minutes a week.

**Lever held open:** postings are permanently gated in v1, but the schema carries a `deaf_exclusive_until` field on each posting. Setting it to a date rather than "forever" creates a *Deaf-exclusive window* (e.g., 14 days, then open). That makes employers far more willing to post, because they aren't surrendering their whole funnel to try us. It also weakens the core promise. Not adopted for v1 — but not foreclosed in the database either.

> **Legal:** before launch, have someone who knows employment law review the access-gating model and how disability status is stored. It's sensitive personal data under GDPR/CCPA, and postings that only some people can see touch employment-discrimination law. Check early, not late.

### 6.2 How is employer "genuine intent" verified or signaled?

**Decision: a structured commitment form. Not free text, no vetting step, no reviews yet.**

Free text produces boilerplate — every employer writes "proud to be an equal opportunity employer" and candidates learn to skip the field. Replace it with questions specific enough to be costly to fake:

1. Have you employed a Deaf or hard-of-hearing person before? *(Yes / No / Not sure — all acceptable)*
2. Which of these are you prepared to provide? *(checkboxes, real monthly cost shown beside each)*
   - Live captioning *(included with your posting — no cost to you)*
   - Interpreter for interviews
   - Interpreter for recurring team meetings
   - Written-first meeting norms (agendas + notes)
   - Async-friendly communication by default
3. Which interview formats can you offer? *(captioned video / written / in-person with interpreter / candidate's choice)*
4. **Who at your company has agreed to this?** *(name + role)*

Question 4 does the heaviest lifting — naming a specific human converts a vague corporate gesture into individual accountability, and is uncomfortable to fill in dishonestly.

This renders as a **commitment card** on every posting. We don't judge intent; we make intent legible and let candidates judge.

Reviews and ratings need volume we don't have, and an empty review section reads worse than none. Manual vetting doesn't scale past one calendar and makes us the arbiter of who counts as a good employer — a role we don't want.

### 6.3 Both sides fully functional, or a thin end-to-end slice?

**Decision: thin end-to-end slice, with the two sides built to deliberately different levels of polish.**

- **Candidate side: build properly.** This is the product. A candidate's experience of being taken seriously *is* the value proposition.
- **Employer side: minimum viable, concierge the rest.** Posting form, commitment form, application inbox. No dashboard, analytics, team seats, or ATS integration.

For the first handful of employers, **we post the jobs on their behalf.** Get on a call, fill in the commitment form together, publish for them. This isn't an embarrassing hack — it's the fastest way to learn what employers hesitate over, learned from their face rather than a funnel drop-off chart.

### 6.4 What's the MVP tech stack — web only, or web + app?

**Decision: web only, mobile-responsive, from day one.** See `README.md` for the full stack table.

Native apps are the wrong first move solo: two extra codebases, app store review on every update, and browsers already handle video recording. A responsive web app installable to the home screen covers most of what "app" means here. Revisit only when there's a retention problem the web app is causing.

**Supabase is chosen specifically for row-level security.** Access gating is the central promise; RLS enforces it at the database so a UI bug can't leak the job board.

**On captions — two authoring paths, not one.** An early version of this document said "auto-generate the transcript, then let the candidate edit it." That is wrong for the candidates most likely to use this platform: **a signed video has no audio, so speech-to-text returns nothing.** There is no draft to edit.

- **Signing candidate:** authors the caption directly. They type what they signed, in their own English. No machine in the loop.
- **Speaking candidate:** gets an auto-generated draft and **must review and correct it before publishing.** Not optional — auto-captions are wrong 5–15% of the time, and garbled captions on a Deaf-first platform cost credibility with exactly the community we serve.

Either way the candidate confirms the captions before the profile goes live, and publishing is blocked until they do.

Beyond accuracy, this matters for representation. Signed language does not map word-for-word to English; whoever writes the caption is choosing how the candidate reads to a hiring manager. That should be the candidate, not a transcription model. And it completes the reciprocity the product argues for: the candidate does the work of being understood, the employer provides captioning at work.

### 6.5 Does the understanding component ship as static content or interactive?

**Decision: static in v1 — embedded at the moment of decision, not parked in a "Learn" tab.**

Nobody clicks "Deaf Awareness Training." A hiring manager under time pressure will not read a module however good it is, and content in a separate section reaches only the already-convinced.

Place it where hesitation actually happens:

- **In the accommodation checkboxes:** captioning marked *included*, and a real monthly cost beside everything else. A manager who assumes accommodations cost thousands, seeing the biggest one already covered and the rest priced in tens of dollars, is the highest-leverage content in the product. One line, placed correctly, beats a curriculum.
- **On the candidate video player:** one line on how this candidate prefers to communicate and what that looks like day-to-day.
- **On the application review screen:** a short line on interviewing with an interpreter, right where they're scheduling.

The full interactive module stays in the backlog (§8).

### 6.6 Is the video introduction mandatory?

**Decision: strongly encouraged and prominently placed, but not required.**

The reasoning for video is good — it lets a hiring manager see the person, which is the whole "read along" insight. But mandating it excludes people: those who don't want their face and disability status permanently linked online, people with intersecting disabilities, people with poor bandwidth, and people who are simply private.

A platform built against being boxed in shouldn't require one particular way of presenting yourself. Written-only profiles are permitted; the UI makes clear that video profiles get more employer attention.

### 6.7 How is captioning paid for?

**Decision: captioning is included with a posting, and stays active while that posting is open.**

Employers already pay to post on LinkedIn and Indeed, so a posting fee is a familiar, apples-to-apples purchase. Bundling captioning into it removes the moment where a hesitant manager has to make a *separate* purchase decision — often meaning asking finance to approve an accessibility line item, which is both a friction point and something people are reluctant to file.

**Scope:** active while the posting is live. When the role is filled and the posting closes, captioning ends. Post again later and it comes back with the new posting.

Why this bound rather than a longer one: a posting fee is one-time, a captioning subscription is open-ended and scales with meeting volume. Tying entitlement to posting status keeps the cost predictable and the rule easy to explain in one sentence.

**It also functions as a trial.** By the time the posting closes, the manager has run captioned interviews and seen it work. Converting them to a paid ~$20/mo continuation after that is a far easier sell than asking up front — and it's the natural recurring-revenue line for the business.

> **Implementation risk:** if captioning is free while a posting is open, employers have an incentive to never close postings. Enforce a maximum posting duration (60 days suggested) with auto-close, and require an explicit reopen. Without that, the entitlement leaks.

---

## 7. Data Model (v1)

### Entities

**`user`** — `id`, `email`, `role` (candidate | employer | admin), `created_at`

**`candidate_profile`** — `user_id`, `display_name`, `location`, `open_to_remote`, `headline`, `deaf_attestation` (bool), `attested_at`, `communication_prefs[]` (ASL / written / lipreading / captions / interpreter-preferred), `video_url`, `transcript_text`, `transcript_edited` (bool), `resume_url`, `skills[]`, `years_experience`, `desired_roles[]`, `status` (draft | published)

**`employer_profile`** — `user_id`, `company_name`, `website`, `size`, `industry`, `logo_url`, `contact_name`, `contact_role`

**`employer_commitment`** — `employer_id`, `has_hired_deaf_before`, `detail_text`, `accommodations_offered[]`, `interview_formats_offered[]`, `signed_by_name`, `signed_by_role`, `signed_at`
→ Its own row, versioned. A commitment made two years ago by someone who has since left shouldn't display as current. Re-affirm annually.

**`job_posting`** — `id`, `employer_id`, `title`, `description`, `location`, `remote_type`, `employment_type`, `salary_min`, `salary_max`, `currency`, `required_skills[]`, `status` (draft | published | closed), `published_at`, `closes_at`, `deaf_exclusive_until` (nullable — the §6.1 lever)
→ `closes_at` is **required and capped** (60 days suggested). Captioning entitlement is derived from `status = published`, so an uncapped posting is an uncapped free subscription. Auto-close on expiry.
→ **Salary is required.** On a platform built around employer good faith, refusing to post a range is itself a signal. Costs nothing to require; candidates value it enormously.

**`application`** — `id`, `job_posting_id`, `candidate_id`, `cover_note`, `video_url` (nullable), `status` (submitted | viewed | in_review | interview | offer | rejected | withdrawn), `submitted_at`, `last_status_at`
→ Unique on (`job_posting_id`, `candidate_id`).
→ **Status is visible to the candidate.** Being ghosted is the default experience of job hunting and it's corrosive. Cheap to build, and exactly the kind of dignity this product is about.

**`accommodation_resource`** — `id`, `name`, `category`, `monthly_cost_estimate`, `url`, `description`
→ Powers the cost-anchoring content in §6.5. Seed with 10–15 real tools at real prices. Captioning is no longer one of these — it's bundled (§6.7) — but interpreters and everything else still are.

**`captioning_session`** — `id`, `employer_id`, `job_posting_id`, `started_at`, `ended_at`, `minutes_used`
→ Tracks usage against the entitlement so you can see real unit economics before deciding what a paid continuation should cost.

### Access rules (enforced as RLS policies)

| Table | Who can read |
|---|---|
| `job_posting` (published) | Candidates with `deaf_attestation = true`; the owning employer; admin |
| `application` | The candidate who submitted it; the employer who owns the posting |
| `candidate_profile` | The owner; **and an employer only for candidates who applied to one of their postings** |

That last rule is deliberate. Employers cannot browse the full candidate database in v1. It's a stronger privacy default, it stops the platform becoming a place Deaf people are catalogued, and it means a candidate chooses when to be seen. Any future sourcing feature must be opt-in per candidate.

---

## 8. Later (Backlog, not this sprint)

- Employer vetting/verification beyond self-attestation
- Employer reviews and ratings (needs volume first)
- Interactive Deaf-awareness training module for employers
- Analytics on posting-to-hire outcomes
- Paid continuation of captioning after a posting closes (the recurring-revenue line)
- Captioning embedded across the whole employment relationship, not just the hiring window
- Candidate sourcing (opt-in only)
- In-app messaging
- Native mobile apps

---

## 9. Success Metric

**One real hire.**

Profile counts and posting counts are easy to move and prove nothing. One Deaf person employed through this platform proves the entire thesis, and is the story that brings in the next twenty employers.

---

## 10. Known Risks

1. **Employer cold start.** Every feature here assumes postings exist. A Deaf-first job board with four jobs fails regardless of build quality. This is the biggest risk to the project and it is not a software problem.
2. **Data sensitivity.** We hold disability status, video of people's faces, and resumes, for a population with a real history of discrimination on exactly this basis. A short, plain-language privacy policy is needed early — and should be treated as a feature, since the trust it buys with this community is part of the product.
3. **Caption quality.** Covered by the mandatory edit step in §6.4, but worth naming: this is the failure mode most likely to lose community trust fast.
4. **Concierge doesn't scale.** The §6.3 approach is correct for the first ten employers and wrong for the first hundred. Know which phase you're in.
5. **Bundled captioning is an unmetered cost.** §6.7 ties it to posting status, which is predictable only if postings actually expire. Cap `closes_at`, auto-close, and watch `captioning_session.minutes_used` from day one — you cannot price the paid continuation without that data.
