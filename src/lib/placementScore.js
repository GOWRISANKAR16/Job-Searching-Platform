/**
 * Step 5 — Central Readiness Score (Placement Score).
 * Single metric 0–100, deterministic.
 * Formula: Job Match Quality 30% + JD Skill Alignment 25% + Resume ATS 25% + Application Progress 10% + Practice Completion 10%.
 */

import { computeAtsScore } from "./atsScore";

const WEIGHTS = {
  jobMatchQuality: 0.3,
  jdSkillAlignment: 0.25,
  resumeAts: 0.25,
  applicationProgress: 0.1,
  practiceCompletion: 0.1,
};

/**
 * @param {Object} options
 * @param {number} [options.jobMatchQuality] 0–100 (e.g. avg match of top jobs)
 * @param {number} [options.jdSkillAlignment] 0–100 (current JD vs resume alignment)
 * @param {Object} [options.resume] resume object for ATS
 * @param {number} [options.applicationProgress] 0–100 (pipeline momentum)
 * @param {number} [options.practiceCompletion] 0–100
 * @returns {{ score: number, breakdown: Object }}
 */
export function getPlacementScore(options = {}) {
  const jobMatch = Math.min(100, Math.max(0, Number(options.jobMatchQuality) ?? 0));
  const jdAlignment = Math.min(100, Math.max(0, Number(options.jdSkillAlignment) ?? 0));
  let resumeAts = 0;
  if (options.resume) {
    const result = computeAtsScore(options.resume);
    resumeAts = Math.min(100, Math.max(0, result.score));
  }
  const appProgress = Math.min(100, Math.max(0, Number(options.applicationProgress) ?? 0));
  const practice = Math.min(100, Math.max(0, Number(options.practiceCompletion) ?? 0));

  const score =
    WEIGHTS.jobMatchQuality * jobMatch +
    WEIGHTS.jdSkillAlignment * jdAlignment +
    WEIGHTS.resumeAts * resumeAts +
    WEIGHTS.applicationProgress * appProgress +
    WEIGHTS.practiceCompletion * practice;

  const rounded = Math.round(Math.min(100, Math.max(0, score)));

  return {
    score: rounded,
    breakdown: {
      jobMatchQuality: Math.round(jobMatch),
      jdSkillAlignment: Math.round(jdAlignment),
      resumeAts: Math.round(resumeAts),
      applicationProgress: Math.round(appProgress),
      practiceCompletion: Math.round(practice),
    },
  };
}
