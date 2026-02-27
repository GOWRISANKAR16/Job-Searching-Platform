const STORAGE_KEY = "job-notification-tracker-saved";
const PREFS_KEY = "jobTrackerPreferences";
const STATUS_KEY = "jobTrackerStatus";
const UPDATES_KEY = "jobTrackerStatusUpdates";
const DIGEST_KEY_PREFIX = "jobTrackerDigest_";

/** Step 6 — Application Pipeline stages */
export const PIPELINE_STAGES = ["Saved", "Applied", "Interview Scheduled", "Interview Completed", "Offer", "Rejected"];
export const STATUS_OPTIONS = PIPELINE_STAGES;

const LEGACY_STATUS_MAP = {
  "Not Applied": "Saved",
  Applied: "Applied",
  Rejected: "Rejected",
  Selected: "Offer",
};
const MAX_STATUS_UPDATES = 50;

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

export function getSavedIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setSavedIds(ids) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

export function addSavedId(id) {
  const ids = getSavedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    setSavedIds(ids);
  }
}

export function removeSavedId(id) {
  setSavedIds(getSavedIds().filter((x) => x !== id));
}

export function getStatusStore() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STATUS_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return typeof obj === "object" && obj !== null ? obj : {};
  } catch {
    return {};
  }
}

function setStatusStore(obj) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STATUS_KEY, JSON.stringify(obj));
  } catch {}
}

export function getJobStatus(jobId) {
  const store = getStatusStore();
  const s = store[jobId];
  if (PIPELINE_STAGES.includes(s)) return s;
  if (LEGACY_STATUS_MAP[s]) return LEGACY_STATUS_MAP[s];
  return "Saved";
}

export function setJobStatus(jobId, status, job) {
  if (!PIPELINE_STAGES.includes(status)) return;
  const store = getStatusStore();
  store[jobId] = status;
  setStatusStore(store);
  if (status !== "Saved" && job && typeof window !== "undefined") {
    const updates = getStatusUpdatesRaw();
    updates.unshift({
      jobId,
      title: job.title || "",
      company: job.company || "",
      status,
      dateChanged: new Date().toISOString(),
    });
    if (updates.length > MAX_STATUS_UPDATES) updates.length = MAX_STATUS_UPDATES;
    try {
      localStorage.setItem(UPDATES_KEY, JSON.stringify(updates));
    } catch {}
  }
}

function getStatusUpdatesRaw() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(UPDATES_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function getStatusUpdates() {
  return getStatusUpdatesRaw().slice(0, 20);
}

/** Step 6 — Counts per pipeline stage for dashboard / placement score */
export function getPipelineCounts() {
  const store = getStatusStore();
  const counts = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = 0;
    return acc;
  }, {});
  Object.values(store).forEach((s) => {
    const stage = PIPELINE_STAGES.includes(s) ? s : LEGACY_STATUS_MAP[s] || "Saved";
    counts[stage] = (counts[stage] || 0) + 1;
  });
  return counts;
}

/** 0–100 score for application progress (momentum): more advanced stages = higher */
export function getApplicationProgressScore() {
  const counts = getPipelineCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  const weighted =
    (counts.Applied || 0) * 20 +
    (counts["Interview Scheduled"] || 0) * 40 +
    (counts["Interview Completed"] || 0) * 60 +
    (counts.Offer || 0) * 100 +
    (counts.Rejected || 0) * 10;
  return Math.min(100, Math.round((weighted / Math.max(1, total * 50)) * 100));
}

export function getPreferencesRaw() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePreferencesRaw(prefs) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

export function getPreferences() {
  const raw = getPreferencesRaw();
  if (!raw) return null;
  const roleKeywords = normalizeList(raw.roleKeywords).map((s) => s.toLowerCase());
  const preferredLocations = normalizeList(raw.preferredLocations);
  const preferredMode = normalizeList(raw.preferredMode);
  const experienceLevel = raw.experienceLevel || "";
  const skills = normalizeList(raw.skills).map((s) => s.toLowerCase());
  let minMatchScore = typeof raw.minMatchScore === "number" ? raw.minMatchScore : 40;
  minMatchScore = Math.max(0, Math.min(100, minMatchScore));
  return {
    roleKeywords,
    preferredLocations,
    preferredMode,
    experienceLevel,
    skills,
    minMatchScore,
  };
}

export function getTodayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getDigestKey(dateStr) {
  return DIGEST_KEY_PREFIX + dateStr;
}

export function getDigestForDate(dateStr) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getDigestKey(dateStr));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDigestForDate(dateStr, payload) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getDigestKey(dateStr), JSON.stringify(payload));
  } catch {}
}

export function formatDigestPlainText(digest) {
  if (!digest?.jobs?.length) return "";
  const lines = ["Top 10 Jobs For You — 9AM Digest", digest.date, ""];
  digest.jobs.forEach((j, i) => {
    lines.push(`${i + 1}. ${j.title || ""} · ${j.company || ""}`);
    lines.push(`   Location: ${j.location || ""} | Experience: ${j.experience || ""}`);
    lines.push(`   Match: ${typeof j.matchScore === "number" ? j.matchScore + "%" : "—"}`);
    if (j.applyUrl) lines.push(`   Apply: ${j.applyUrl}`);
    lines.push("");
  });
  lines.push("This digest was generated based on your preferences.");
  return lines.join("\n");
}

export function getDigestMailtoBody(digest) {
  return formatDigestPlainText(digest);
}
