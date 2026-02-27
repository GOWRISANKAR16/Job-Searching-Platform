/**
 * Step 2 — Unified Data Model.
 * One global state. No isolated localStorage keys.
 */

const PLATFORM_STATE_KEY = "placementSuiteState";

const LEGACY_KEYS = {
  resume: "resumeBuilderData",
  template: "resumeBuilderTemplate",
  theme: "resumeBuilderTheme",
};

function getDefaultState() {
  return {
    preferences: { template: "Classic", themeColor: "teal" },
    resumeData: null,
    jobMatches: [],
    applications: {},
    jdAnalyses: [],
    lastActivity: new Date().toISOString(),
  };
}

function loadPlatformState() {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = localStorage.getItem(PLATFORM_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...getDefaultState(), ...parsed, lastActivity: parsed.lastActivity || new Date().toISOString() };
    }
    return migrateFromLegacy();
  } catch {
    return getDefaultState();
  }
}

function migrateFromLegacy() {
  const state = getDefaultState();
  try {
    const resumeRaw = localStorage.getItem(LEGACY_KEYS.resume);
    if (resumeRaw) state.resumeData = JSON.parse(resumeRaw);
    const t = localStorage.getItem(LEGACY_KEYS.template);
    if (t && ["Classic", "Modern", "Minimal"].includes(t)) state.preferences.template = t;
    const theme = localStorage.getItem(LEGACY_KEYS.theme);
    if (theme && ["teal", "navy", "burgundy", "forest", "charcoal"].includes(theme)) state.preferences.themeColor = theme;
    savePlatformState(state);
  } catch {}
  return state;
}

export function savePlatformState(state) {
  if (typeof window === "undefined") return;
  try {
    const toSave = { ...state, lastActivity: new Date().toISOString() };
    localStorage.setItem(PLATFORM_STATE_KEY, JSON.stringify(toSave));
  } catch {}
}

export function getPlatformState() {
  return loadPlatformState();
}

export { PLATFORM_STATE_KEY };
