const TEST_STORAGE_KEY = "jobTrackerTestStatus";

export const JT_TEST_ITEMS = [
  { id: "0", label: "Preferences persist after refresh", tooltip: "Save preferences, refresh page, confirm form is prefilled." },
  { id: "1", label: "Match score calculates correctly", tooltip: "Set preferences, open Dashboard, confirm job cards show match %." },
  { id: "2", label: '"Show only matches" toggle works', tooltip: "Enable toggle on Dashboard, confirm only jobs above threshold show." },
  { id: "3", label: "Save job persists after refresh", tooltip: "Save a job, refresh, open Saved; job still listed." },
  { id: "4", label: "Apply opens in new tab", tooltip: "Click Apply on a card; link opens in new tab." },
  { id: "5", label: "Status update persists after refresh", tooltip: "Change status to Applied, refresh; status still Applied." },
  { id: "6", label: "Status filter works correctly", tooltip: "Set Status filter to Applied; only Applied jobs show." },
  { id: "7", label: "Digest generates top 10 by score", tooltip: "Generate digest; confirm 10 jobs, ordered by match." },
  { id: "8", label: "Digest persists for the day", tooltip: "Generate digest, refresh page; digest still visible." },
  { id: "9", label: "No console errors on main pages", tooltip: "Open /, /app/jobs, /app/jobs/saved, /app/jobs/digest, /app/jobs/settings; check console." },
];

export function loadJtTestStatus() {
  if (typeof window === "undefined") {
    return JT_TEST_ITEMS.map((t, i) => ({ ...t, checked: false }));
  }
  try {
    const raw = localStorage.getItem(TEST_STORAGE_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    if (typeof obj !== "object" || obj === null) {
      return JT_TEST_ITEMS.map((t) => ({ ...t, checked: false }));
    }
    return JT_TEST_ITEMS.map((t, i) => ({
      ...t,
      checked: !!obj[String(i)],
    }));
  } catch {
    return JT_TEST_ITEMS.map((t) => ({ ...t, checked: false }));
  }
}

export function saveJtTestStatus(tests) {
  if (typeof window === "undefined") return;
  try {
    const obj = {};
    (tests || []).forEach((t, i) => {
      obj[String(i)] = !!t.checked;
    });
    localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify(obj));
  } catch {}
}

export function getJtTestPassedCount() {
  return loadJtTestStatus().filter((t) => t.checked).length;
}
