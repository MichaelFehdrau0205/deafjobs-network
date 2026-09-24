# DEAFJOBS — Pages & Goals

Every screen in v1: what it's for, what's on it, and when it's done.

This document replaces standalone wireframes. If a screen isn't listed here, it isn't in v1.

**Legend:** 🔓 public · 👤 candidate · 🏢 employer · ⚙️ admin

---

## Public

### 🔓 `/` — Landing

**Goal:** a Deaf visitor understands in five seconds that this place is for them, and a hiring manager understands what they're being asked to commit to.

**Primary action:** two entry points — "Find a job" and "Hire Deaf talent."

**On the page:**
- Headline stating the "can do it" premise directly
- The three things that make it different: postings gated to Deaf candidates, employers commit before posting, real accommodation costs shown up front
- Live count of open roles *(only once it's a number worth showing — hide below 10)*
- Captioned video on the page, because a Deaf-first product that leads with a wall of text is not making its own argument

**Done when:** someone unfamiliar can state what the product does after five seconds on the page.

---

### 🔓 `/signup` — Sign up

**Goal:** route the user to the right side of the platform without making the choice feel like a test.

**Primary action:** pick "I'm looking for work" or "I'm hiring."

**On the page:** email + password (or magic link), role selection, link to log in.

**Note:** role is chosen here and determines everything downstream. Make it a large, obvious two-card choice rather than a dropdown.

**Done when:** both paths create a user with the correct role and land on the right next screen.

---

### 🔓 `/login` — Log in

**Goal:** get people back in. Nothing more.

**Done when:** it works, and errors say what's actually wrong.

---

## Candidate

### 👤 `/candidate/attestation` — Attestation

**Goal:** gate access honestly and without making the candidate feel interrogated.

**Primary action:** check *"I am Deaf or hard of hearing"* and continue.

**On the page:**
- The single checkbox
- One short paragraph explaining *why* it's asked and that no proof is required — this is the moment to build trust, not extract data
- A line stating that this is stored privately and never shown to employers as a standalone flag

**Done when:** attestation sets `deaf_attestation` and `attested_at`, and postings become readable. A user who doesn't attest can reach their account but sees zero postings.

**Watch for:** the tone here matters more than the mechanics. Written coldly it reads as a disability checkpoint. Written well it reads as *we're taking your word for it.*

---

### 👤 `/candidate/profile/new` — Profile builder

The most important flow in the product. Six steps, each its own screen with saved progress.

#### Step 1 — Basics
Display name, location, open to remote, headline. Fast, familiar, no surprises.

#### Step 2 — Video introduction
**Goal:** let the candidate be seen as a person before being read as a resume.

- Record in-browser or upload
- Prompt suggestions ("What do you want to do? What are you good at?") — a blank record button is intimidating
- **Skip is available.** Video is optional (PRD §6.6). Place the skip link visibly but below the record button
- One line on why video helps, without pressure

#### Step 3 — Captions ⚠️
**Goal:** the captions are correct, and in the candidate's own words, before anyone else sees them.

**This screen cannot be skipped when a video exists.** Two paths, chosen by how the candidate recorded:

**If they signed** — there is no audio, so **there is nothing to auto-transcribe.** The candidate types the caption themselves: an editor beside the playing video, scrubbable, with timing they can set. This is the primary path on this platform and must not be built as the fallback.

**If they spoke** — auto-generate a draft, then require them to review and correct it. No "do this later" link.

Both paths end at the same explicit confirm: *"These captions are accurate"* — which sets `transcript_edited`.

**Done when:** publishing is blocked until confirmation, on both paths. A hard gate, not a nudge.

**Why it matters:** auto-captions are wrong 5–15% of the time, and on a signed video they return nothing at all — building this screen as edit-the-transcript would break it for the candidates most likely to use it. Beyond accuracy: signed language doesn't map word-for-word to English, so whoever writes the caption decides how the candidate reads to a hiring manager. That should be the candidate.

#### Step 4 — Resume
Upload PDF/DOCX. Parse text for later filtering. Show what was parsed so the candidate can correct it.

#### Step 5 — Skills & communication preferences
Skills, years of experience, desired roles. Communication preferences (ASL / written / lipreading / captions / interpreter-preferred) — multi-select, framed as *how you work best*, not as needs or limitations.

#### Step 6 — Review & publish
Full preview exactly as an employer will see it, then publish. `status: draft → published`.

**Done when:** a complete profile publishes and renders identically in preview and in the employer's view.

---

### 👤 `/candidate/jobs` — Browse

**Goal:** the candidate sees roles that are actually open to them, and feels the difference from a general job board immediately.

**Primary action:** open a posting.

**On the page:**
- List of published postings — **not search** (PRD/SPRINT: a list beats search under ~50 jobs)
- Two filters only: remote/on-site, full-time/part-time
- Each card: title, company, location, **salary range**, and a compact commitment indicator (e.g., "5 accommodations committed")
- Empty state that's honest and useful rather than apologetic

**Done when:** an attested candidate sees all published postings; a non-attested account sees none, enforced by RLS rather than by hiding the UI.

---

### 👤 `/candidate/jobs/[id]` — Job detail

**Goal:** the candidate can judge whether this employer is serious before spending effort applying.

**Primary action:** apply.

**On the page:**
- Role details, salary range, requirements
- **The commitment card, prominently** — accommodations checked, interview formats offered, whether they've hired Deaf employees before, and the name and role of the person who signed off
- Company basics

**Done when:** the commitment card is impossible to miss. It is the reason this page is different from every other job listing on the internet.

---

### 👤 `/candidate/jobs/[id]/apply` — Apply

**Goal:** applying is light. The profile already did the work.

**Primary action:** submit.

**On the page:** short cover note (optional), option to record a role-specific video (optional), confirmation of which profile is being sent.

**Done when:** application row created; duplicate applications prevented by the unique constraint with a clear message rather than an error.

---

### 👤 `/candidate/applications` — My applications

**Goal:** the candidate is never left wondering.

**On the page:** every application with its current status and when it last changed.

**Done when:** an employer status change is reflected here.

**Why this exists in v1:** being ghosted is the default experience of job hunting and it's corrosive. This is cheap to build and is exactly the dignity this product is supposed to be about.

---

### 👤 `/candidate/profile` — View / edit profile

**Goal:** keep it current. Re-editing video re-triggers the caption review gate.

---

## Employer

### 🏢 `/employer/commitment` — Commitment form

**Goal:** the employer thinks concretely about what supporting a Deaf hire means — *before* they get to post.

**This gates posting.** No commitment, no job posting. That's the product.

**Primary action:** sign and continue.

**On the page:**
1. Have you employed a Deaf or hard-of-hearing person before? (Yes / No / Not sure — all fine, and say so)
2. Which accommodations are you prepared to provide? Captioning shows as **included**; everything else shows its **real monthly cost**, pulled from `accommodation_resource`
3. Which interview formats can you offer?
4. **Who at your company has agreed to this?** Name + role

Captioning appears here as **included with your posting**, not as a cost to weigh. Everything else in the list still carries its real price.

**Done when:** commitment saved with `signed_at`, and it renders as the commitment card on every posting.

**Watch for:** item 2 is the single highest-leverage piece of content in the platform. A manager who assumes accommodations cost thousands, seeing the biggest one marked *included* and the rest priced in tens of dollars, is the whole persuasion strategy in one screen. Don't bury it in a tooltip.

Item 4 does the second-heaviest lifting — naming a specific person converts a corporate gesture into individual accountability.

---

### 🏢 `/employer/company` — Company profile

**Goal:** enough context for a candidate to know who they'd be working for.

Company name, website, size, industry, logo, contact name and role. Brief.

---

### 🏢 `/employer/jobs/new` — Post a job

**Goal:** a good posting, quickly.

**On the page:** title, description, location, remote type, employment type, **required salary range**, required skills, closing date.

**Captioning is included** — say so on this screen, plainly, next to the price: live captioning is active for as long as this posting is open. This is the best moment to say it, because the employer is already deciding to spend money, and it reframes the accessibility cost from *extra* to *included*.

**Done when:** posting publishes, appears in candidate browse, and captioning is active for that employer.

**Note:** the closing date is required and capped (60 days suggested), because captioning entitlement is derived from posting status. Without a cap, leaving a posting open forever is a free subscription.

**Note:** salary is a required field, not a nudge. On a platform built around employer good faith, refusing to post a range is itself a signal — and candidates value it enormously.

---

### 🏢 `/employer/jobs` — My postings

List of own postings with status and application count. Close or reopen.

---

### 🏢 `/employer/jobs/[id]/applications` — Application inbox

**Goal:** review applicants with the person, not just the paper, in front of you.

**Primary action:** open an application.

**On the page:** applicant list with name, headline, applied date, status.

**Done when:** only applications to this employer's postings are visible — enforced by RLS.

---

### 🏢 `/employer/applications/[id]` — Application detail

**Goal:** this is where the product's actual thesis gets tested — a hiring manager watches a captioned video and updates their assumption about what this person can do.

**Primary action:** change status.

**On the page:**
- **Captioned video player, first and largest.** Reading along while seeing the candidate is the core insight — don't demote it beneath the resume
- One line on this candidate's communication preferences and what that means day-to-day
- Resume
- Cover note
- Status dropdown
- A short contextual line about interviewing with an interpreter, placed where they're moving to "interview" — not in a help center

**Done when:** status change persists and is visible on the candidate's applications page.

**Watch for:** the layout here carries the argument. Video first says *this is a person*. Resume first says *this is a file*.

---

## Shared

### `/settings` — Account settings
Email, password, notification preferences, delete account. Deletion must actually delete — this population has real reason to care.

### `/resources` — Accommodation catalogue
The `accommodation_resource` list with real prices and links. Publicly readable. Doubles as the source for the inline cost content and as something an employer can be sent directly.

### `/privacy` — Privacy policy
Plain language. What's stored, who can see it, how to delete it. Treat it as a feature: the trust it buys with this community is part of the product.

---

## Admin

### ⚙️ `/admin/reports` — Reports queue
Reported profiles, review and act. Minimal — a table and two buttons. At v1 volume this is a few minutes a week.

---

## Page count

**19 screens.** Roughly: 3 public, 10 candidate (6 of them profile-builder steps), 6 employer, 3 shared, 1 admin.

If that feels like a lot for one sprint — the profile builder steps are one flow, and the shared and admin pages are near-trivial. The genuinely substantial screens are: caption review, commitment form, job detail, and application detail. **Those four carry the product.** Everything else is plumbing that has been built a thousand times.
