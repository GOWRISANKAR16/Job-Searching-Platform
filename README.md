# Job-Searching-Platform — Placement Suite

A **full-stack placement operating system** that combines job discovery, resume building, JD analysis, and application tracking in one app. Built as a single-page application (SPA) with a unified dashboard, central placement score, and no backend — all data lives in the browser (localStorage).

---

## What it is

**Job-Searching-Platform** (also referred to as **Placement Suite**) is not just a job tracker or a resume builder. It is an integrated platform that:

- **Unifies** job matching, resume ATS scoring, JD analysis, and application pipeline in one place  
- Uses **one global state** (single localStorage key) so all modules stay in sync  
- Exposes a **single Placement Score (0–100)** from: Job Match Quality, JD Skill Alignment, Resume ATS, Application Progress, and Practice Completion  
- Surfaces **notification-style nudges** (e.g. resume score below 70, weak skill alerts)  
- Provides a **Proof page** that shows all modules working together: Job Tracker, JD Analyzer, Resume Builder, Unified Dashboard, Application Pipeline, and Placement Score

---

## Features

| Module | Description |
|--------|-------------|
| **Unified Dashboard** | Control center: Placement Score circle, Resume ATS score, Daily Job Matches (top 5), Application Pipeline (Saved / Applied / Interview / Offer / Rejected), Weak Resume Alert, Next Action recommendation |
| **Job Tracker** | Browse jobs, filter by location/mode/experience, match score based on preferences, save jobs |
| **Saved Jobs & Pipeline** | Move saved jobs through stages: Saved → Applied → Interview Scheduled → Interview Completed → Offer / Rejected; pipeline counts feed into Placement Score |
| **Resume Builder** | Template selection (Classic, Modern, Minimal), color themes, live preview, ATS score with deterministic scoring and suggestions |
| **Resume Proof** | Step 8 proof page: checklist of working modules, Placement Score visible, deployment and GitHub links |
| **JD Analyzer** | Paste job description; extract skills and get analysis (Assessments page); supports alignment with resume |
| **Practice, Resources, Profile** | Placeholder sections for practice tracking, resources, and profile |

---

## Tech stack

- **React 18** + **Vite 7**  
- **React Router 7**  
- **Tailwind CSS**  
- **Recharts** (dashboard radar chart)  
- **Lucide React** (icons)  
- No backend; state in **localStorage** (`placementSuiteState`)

---

## Run locally

**Requires:** [Node.js](https://nodejs.org/) (LTS recommended).

```bash
npm install
npm run dev
```

Open **http://localhost:5173** (or the port Vite prints).

- **Preview production build:** `npm run build` then `npm run preview`

---

## Deploy (production)

1. **Build:** `npm run build` — output is in `dist/`.
2. **Optional env (for Proof page links):**
   - `VITE_DEPLOYMENT_URL` — live app URL  
   - `VITE_GITHUB_URL` — repository URL  
   Set these in your CI/host’s build environment if you want correct links on the Proof page.
3. **Publish:** Deploy the `dist/` folder to any static host.  
   **SPA routing:** Every path must serve `index.html` (e.g. Netlify/Vercel handle this by default).

The app is **ready to deploy** with no server required.

---

## Main routes

| Path | Purpose |
|------|--------|
| `/` | Redirects to `/app/dashboard` |
| `/app/dashboard` | Unified Dashboard (home) |
| `/app/jobs` | Job list + filters |
| `/app/jobs/sapped` | Saved jobs & pipeline stages |
| `/app/jobs/digest` | Daily digest |
| `/app/jobs/settings` | Job preferences (role, location, skills, min match) |
| `/app/assessments` | JD Analyzer (paste JD, get skills & analysis) |
| `/app/practice` | Practice |
| `/app/resources` | Resources |
| `/app/profile` | Profile |
| `/app/history` | History |
| `/app/results` | Results |
| `/builder` | Resume Builder |
| `/preview` | Resume Preview |
| `/proof` | Platform Proof (Step 8) |
| `/placement` | Landing page |

---

## Architecture (summary)

- **Single global state:** One key `placementSuiteState` holds preferences, resume data, last activity; resume and preferences migrate from legacy keys on first load.  
- **Placement Score:** Deterministic 0–100 formula: 30% Job Match + 25% JD Alignment + 25% Resume ATS + 10% Application Progress + 10% Practice.  
- **Application pipeline:** Six stages (Saved, Applied, Interview Scheduled, Interview Completed, Offer, Rejected); status stored per job and used for dashboard and placement score.  
- **Resume ATS:** Rule-based scoring (no AI); suggestions for improving score.  
- **Design:** Dark theme across Dashboard and Resume sections; Home button shown only when not on dashboard.

---

## License & repository

- **Package name:** `job-searching-platform`  
- Data is stored only in the browser; no backend or database required.

