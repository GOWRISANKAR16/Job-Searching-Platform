/**
 * AI Resume Builder — Build Track. Artifacts per step (rb_step_X_artifact) and proof links.
 */

const PREFIX = "rb_step_";
const PROOF_KEY = "rb_proof_links";

export const RB_STEP_NAMES = {
  1: "Problem",
  2: "Market",
  3: "Architecture",
  4: "HLD",
  5: "LLD",
  6: "Build",
  7: "Test",
  8: "Ship",
};

function stepKey(stepNum) {
  return `${PREFIX}${stepNum}_artifact`;
}

export function getRbArtifact(stepNum) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(stepKey(stepNum));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setRbArtifact(stepNum, payload) {
  if (typeof window === "undefined") return;
  try {
    const value = {
      status: payload.status,
      screenshotData: payload.screenshotData ?? null,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(stepKey(stepNum), JSON.stringify(value));
  } catch {}
}

export function hasRbArtifact(stepNum) {
  const a = getRbArtifact(stepNum);
  return !!a && (a.status === "worked" || a.status === "error" || a.status === "screenshot");
}

export function canProceedToStep(stepNum) {
  if (stepNum <= 1) return true;
  return hasRbArtifact(stepNum - 1);
}

export function getProofLinks() {
  if (typeof window === "undefined") return { lovable: "", github: "", deploy: "" };
  try {
    const raw = localStorage.getItem(PROOF_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      lovable: parsed.lovable ?? "",
      github: parsed.github ?? "",
      deploy: parsed.deploy ?? "",
    };
  } catch {
    return { lovable: "", github: "", deploy: "" };
  }
}

export function setProofLinks(links) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROOF_KEY, JSON.stringify(links));
  } catch {}
}
