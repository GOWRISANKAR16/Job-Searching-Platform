const TEST_CHECKLIST_KEY = "prp-test-checklist-v1";

export const MASTER_TESTS = [
  { id: "jd-required", label: "JD required validation works", hint: "On Assessments, JD must be required and Analyze should be disabled when empty." },
  { id: "short-jd-warning", label: "Short JD warning shows for <200 chars", hint: "Use a very small JD and confirm the calm warning appears." },
  { id: "skills-grouping", label: "Skills extraction groups correctly", hint: "Include DSA, React, SQL, etc. in a JD and check they land in the right buckets." },
  { id: "round-mapping", label: "Round mapping changes based on company + skills", hint: "Compare a startup React JD vs an enterprise DSA-heavy JD." },
  { id: "score-deterministic", label: "Score calculation is deterministic", hint: "Re-run the same JD twice and confirm base score is identical." },
  { id: "toggles-live-score", label: "Skill toggles update score live", hint: "Flip several skills between \"Need practice\" and \"I know this\" and watch the score." },
  { id: "persistence-refresh", label: "Changes persist after refresh", hint: "Refresh Results and confirm skills + score stay aligned." },
  { id: "history-saves-loads", label: "History saves and loads correctly", hint: "Run multiple analyses and open them from History without errors." },
  { id: "exports-correct", label: "Export buttons copy the correct content", hint: "Use Copy/Download and verify content in a text editor." },
  { id: "no-console-errors", label: "No console errors on core pages", hint: "Inspect browser console while using Landing, Dashboard, Assessments, Results, History." },
];

function mergeWithMaster(savedState) {
  const byId = {};
  (savedState || []).forEach((item) => {
    if (item && typeof item.id === "string") byId[item.id] = !!item.checked;
  });
  return MASTER_TESTS.map((test) => ({ ...test, checked: byId[test.id] ?? false }));
}

export function loadTestChecklist() {
  if (typeof window === "undefined") return { tests: MASTER_TESTS.map((t) => ({ ...t, checked: false })), completed: 0 };
  try {
    const raw = window.localStorage.getItem(TEST_CHECKLIST_KEY);
    if (!raw) return { tests: MASTER_TESTS.map((t) => ({ ...t, checked: false })), completed: 0 };
    const tests = mergeWithMaster(JSON.parse(raw));
    return { tests, completed: tests.filter((t) => t.checked).length };
  } catch {
    return { tests: MASTER_TESTS.map((t) => ({ ...t, checked: false })), completed: 0 };
  }
}

export function saveTestChecklist(tests) {
  if (typeof window === "undefined") return;
  try {
    const minimal = (tests || []).map((t) => ({ id: t.id, checked: !!t.checked }));
    window.localStorage.setItem(TEST_CHECKLIST_KEY, JSON.stringify(minimal));
  } catch {}
}
