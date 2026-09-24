# DEAFJOBS — Job Application Demo Build

This is a **scoped-down build** for a specific purpose: a live, deployed
link for the Contract UI/UX Designer application (deadline Fri 9/25).

It is **not** Sprint 1 from `SPRINT.md`. It skips Supabase, auth, RLS,
and real speech-to-text entirely. Those are real product requirements —
just not requirements for proving UI/UX craft to a hiring reviewer this
week. Build Sprint 1 for real later, from the existing docs.

Read `PRD.md` and `PAGES-GOALS.md` in `/docs` for tone, content, and
detail on the two screens below — this file only scopes what's different
for the demo.

---

## Target

A deployed URL (Vercel) with:

1. **Landing page** — already built (`index.html` in this folder).
   Deploy as-is, or port into the Next.js app as the `/` route.
2. **Candidate profile builder — steps 1–3 only**, ending at the caption
   review/confirm screen. This is the screen PAGES-GOALS calls out as
   carrying the product's thesis, and it's the richest accessibility
   story to talk about in the submission.
3. *(stretch, only if time allows)* Employer commitment form
   (`/employer/commitment`) — the accommodation-cost checklist screen.

Stop there. Do not build auth, browse, apply, or the application inbox
for this demo — those are real Sprint 1 work, not this week's task.

---

## What's mocked vs. real

**Real:**
- All UI, layout, copy, and interaction exactly as specified in
  `PAGES-GOALS.md`
- Client-side state (React state / context — no database)
- Keyboard navigation, focus states, ARIA labels, semantic HTML
- The caption editor is a genuinely working text editor scrubbable
  against a video element

**Mocked:**
- No auth — profile builder is reachable directly, no login wall
- No Supabase — nothing persists on reload (fine for a demo link)
- No real speech-to-text — "auto-generate" is a canned placeholder
  transcript with a couple of deliberately wrong words, so the review/
  correct step has something real to demonstrate
- Video upload can be a plain file input; recording-in-browser is not
  required for this demo

---

## Stack for the demo

Keep it simple — this doesn't need the full production stack:
- Next.js (App Router) or even a single-page Vite/React app — whichever
  is faster to deploy tonight
- Tailwind for styling, matching the green/blue palette from the
  landing page (`--green:#00E87A`, `--blue:#1400E6`)
- Deploy to Vercel (free, deploys on push)

---

## Starter prompt for Claude Code

```
Build a scoped demo of DEAFJOBS for a job application deadline this
week. Full product context is in /docs (PRD.md, PAGES-GOALS.md,
SPRINT.md) — read PAGES-GOALS.md's candidate profile builder section
before starting.

Scope for THIS build only:
1. Port the existing index.html landing page into the app as the "/"
   route (or serve it as a static page — whichever is simpler)
2. Build /profile/new as a 3-step flow: basics, video, captions
   - No auth, no database — everything is client-side state
   - Video step: plain file upload, optional, visible skip link
   - Caption step: on "upload," show a canned draft transcript with a
     couple of deliberately wrong words. Build a real editor next to
     a playing <video> element where the text can be corrected.
     Require an explicit "These captions are accurate" checkbox/button
     before allowing "Continue" — this cannot be skipped if a video
     was uploaded.

Non-negotiables even in this scoped build:
- Full keyboard operability — every control reachable and operable
  without a mouse
- Visible focus states on every interactive element (not browser
  default — intentional, matching the landing page's focus-visible
  style)
- Real form labels, not placeholder-as-label
- Skip link, semantic headings, ARIA landmarks
- Contrast checked against WCAG 2.2 AA (4.5:1 body text minimum)
- Plain-language copy — no jargon, no "hearing impaired" language;
  see PRD.md and PAGES-GOALS.md for tone notes
- prefers-reduced-motion respected if there's any animation

Do not build auth, browse, apply, employer flows, or persistence —
those are out of scope for this build. Flag if you think something
here needs to expand scope rather than just doing it.

Deploy to Vercel when done and give me the URL.
```

---

## For the submission email

They explicitly ask you to name which WCAG 2.2 AA considerations you
designed for and how. Have one line ready for each, once built:

- **Contrast** — [confirm ratios once built, e.g. "green-on-blue and
  blue-on-green both exceed 4.5:1"]
- **Keyboard navigation** — entire caption-review flow (upload, review
  video, edit transcript, confirm) operable without a mouse
- **Screen reader support** — semantic landmarks, ARIA labels on nav
  regions, meaningful alt/aria-label on the SVG wordmark, skip link
- **Focus states** — custom visible focus rings on every interactive
  element, not reliance on browser default
- **Plain language** — attestation and caption-review copy written in
  plain, direct language; avoids clinical/inspirational framing (see
  PRD.md tone section)

---

## Design reference — colors and intro page (confirmed 9/21)

- **`DEAFJOBS.png`** (in the parent `DEAFJOBS` folder) is the reference
  image for the introduction/index page — use it alongside `index.html`
  as the source of truth when porting the landing page into the app.
- **Color mapping is exact, do not drift on it:**
  - `DEAF` wordmark = **blue** (`#1400E6`) ink, sits on the **green**
    (`#00E87A`) panel — this is the candidate-facing section
  - `JOBS` wordmark = **green** (`#00E87A`) ink, sits on the **blue**
    (`#1400E6`) panel — this is the employer/recruiter/hiring-manager
    section
- This mapping is already correctly implemented in the existing
  `index.html` (`.top` = candidates/green bg/blue text, `.bottom` =
  employers/blue bg/green text) — preserve it exactly when porting.
