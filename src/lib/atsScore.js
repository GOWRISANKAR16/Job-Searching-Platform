/**
 * ATS Resume Score — deterministic, 0–100.
 * +10 name, +10 email, +5 phone
 * +10 summary > 50 chars
 * +10 summary contains action verbs
 * +15 at least 1 experience with bullets
 * +10 at least 1 education
 * +10 at least 5 skills
 * +10 at least 1 project
 * +5 LinkedIn, +5 GitHub
 * Max 100.
 */

function skillsCount(skillsInput) {
  if (skillsInput && typeof skillsInput === "object" && !Array.isArray(skillsInput)) {
    const s = skillsInput;
    return (s.technical || []).length + (s.soft || []).length + (s.tools || []).length;
  }
  if (typeof skillsInput === "string") {
    return skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean).length;
  }
  return 0;
}

const ACTION_VERBS = [
  "built", "led", "designed", "improved", "created", "implemented", "developed",
  "delivered", "managed", "achieved", "established", "optimized", "automated",
  "launched", "reduced", "increased", "coordinated", "mentored", "streamlined",
];

function summaryHasActionVerbs(summary) {
  if (!summary || typeof summary !== "string") return false;
  const lower = summary.toLowerCase();
  return ACTION_VERBS.some((verb) => lower.includes(verb));
}

function hasExperienceWithBullets(experience) {
  if (!Array.isArray(experience) || experience.length === 0) return false;
  return experience.some((e) => (e.details || "").trim().length > 0);
}

export function computeAtsScore(resume) {
  let score = 0;
  const suggestions = [];

  const name = (resume.personalInfo?.name || "").trim();
  if (name) {
    score += 10;
  } else {
    suggestions.push("Add your name (+10 points)");
  }

  const email = (resume.personalInfo?.email || "").trim();
  if (email) {
    score += 10;
  } else {
    suggestions.push("Add your email (+10 points)");
  }

  const phone = (resume.personalInfo?.phone || "").trim();
  if (phone) {
    score += 5;
  } else {
    suggestions.push("Add your phone (+5 points)");
  }

  const summary = (resume.summary || "").trim();
  if (summary.length > 50) {
    score += 10;
  } else {
    suggestions.push("Add a professional summary longer than 50 characters (+10 points)");
  }

  if (summaryHasActionVerbs(summary)) {
    score += 10;
  } else if (summary.length > 0) {
    suggestions.push("Use action verbs in your summary (e.g. built, led, designed) (+10 points)");
  }

  const experience = resume.experience || [];
  if (hasExperienceWithBullets(experience)) {
    score += 15;
  } else {
    suggestions.push("Add at least one experience entry with bullet points (+15 points)");
  }

  const education = resume.education || [];
  if (education.length >= 1) {
    score += 10;
  } else {
    suggestions.push("Add at least one education entry (+10 points)");
  }

  const skillCount = skillsCount(resume.skills);
  if (skillCount >= 5) {
    score += 10;
  } else {
    suggestions.push("Add at least 5 skills (+10 points)");
  }

  const projectCount = (resume.projects || []).length;
  if (projectCount >= 1) {
    score += 10;
  } else {
    suggestions.push("Add at least one project (+10 points)");
  }

  const linkedin = (resume.links?.linkedin || "").trim();
  if (linkedin) {
    score += 5;
  } else {
    suggestions.push("Add your LinkedIn URL (+5 points)");
  }

  const github = (resume.links?.github || "").trim();
  if (github) {
    score += 5;
  } else {
    suggestions.push("Add your GitHub URL (+5 points)");
  }

  score = Math.min(100, Math.max(0, score));

  return {
    score,
    suggestions,
  };
}

/**
 * Band for display: 0-40 Needs Work (red), 41-70 Getting There (amber), 71-100 Strong Resume (green)
 */
export function getAtsBand(score) {
  if (score <= 40) return { label: "Needs Work", color: "red" };
  if (score <= 70) return { label: "Getting There", color: "amber" };
  return { label: "Strong Resume", color: "green" };
}
