# Resume Builder — Test Checklist

Use this checklist to verify all features.

## 10-item test checklist

- [ ] **All form sections save to localStorage** — Fill Personal info, Summary, Education, Experience, Projects, Skills, Links; refresh; confirm all data is still there.
- [ ] **Live preview updates in real-time** — On Builder, type in any field and see the right-hand preview update as you type.
- [ ] **Template switching preserves data** — Switch between Classic / Modern / Minimal; content stays the same, only layout changes.
- [ ] **Color theme persists after refresh** — Select a theme (e.g. Navy); refresh; theme is still Navy.
- [ ] **ATS score calculates correctly** — Confirm: +10 name, +10 email, +10 summary >50 chars, +15 experience with bullets, +10 education, +10 skills ≥5, +10 project ≥1, +5 phone, +5 LinkedIn, +5 GitHub, +10 action verbs in summary (max 100).
- [ ] **Score updates live on edit** — Change name/summary/skills etc.; score and band update immediately without refresh.
- [ ] **Export buttons work (copy/download)** — Copy Resume as Text copies plain text; Download PDF shows toast "PDF export ready! Check your downloads."
- [ ] **Empty states handled gracefully** — With no or minimal data, preview shows placeholders; ATS shows low score and suggestions; no crashes.
- [ ] **Mobile responsive layout works** — Resize to narrow width; layout stacks or scrolls; no horizontal overflow.
- [ ] **No console errors on any page** — Open /, /builder, /preview, /proof and check browser console for errors.

## ATS details (reference)

- **Circular progress on /preview:** 0–40 = Red "Needs Work", 41–70 = Amber "Getting There", 71–100 = Green "Strong Resume".
- **Improvement suggestions:** Missing items listed below score with text like "Add a professional summary (+10 points)".
