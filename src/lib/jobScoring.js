import { getPreferences } from "./jobsStorage";

export function computeMatchScore(job, prefs) {
  if (!prefs) return 0;
  let score = 0;
  const title = (job.title || "").toLowerCase();
  const description = (job.description || "").toLowerCase();

  if (prefs.roleKeywords?.length) {
    const titleHit = prefs.roleKeywords.some((kw) => kw && title.includes(kw));
    if (titleHit) score += 25;
    const descHit = prefs.roleKeywords.some((kw) => kw && description.includes(kw));
    if (descHit) score += 15;
  }

  if (prefs.preferredLocations?.length && job.location) {
    if (prefs.preferredLocations.includes(job.location)) score += 15;
  }

  if (prefs.preferredMode?.length && job.mode) {
    if (prefs.preferredMode.includes(job.mode)) score += 10;
  }

  if (prefs.experienceLevel && job.experience === prefs.experienceLevel) {
    score += 10;
  }

  if (prefs.skills?.length && Array.isArray(job.skills)) {
    const jobSkillsLower = job.skills.map((s) => String(s).toLowerCase());
    if (prefs.skills.some((s) => jobSkillsLower.includes(s))) score += 15;
  }

  if (typeof job.postedDaysAgo === "number" && job.postedDaysAgo <= 2) {
    score += 5;
  }

  if (job.source === "LinkedIn") {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

export function parseSalaryNumber(salaryRange) {
  if (!salaryRange) return 0;
  const matches = String(salaryRange).match(/\d+/g);
  if (!matches?.length) return 0;
  const nums = matches.map((n) => parseInt(n, 10) || 0).filter((n) => n > 0);
  if (!nums.length) return 0;
  if (nums.length === 1) return nums[0];
  return (nums[0] + nums[1]) / 2;
}

export function filterAndSortJobs(jobs, state, getJobStatus) {
  const prefs = getPreferences();
  const hasPrefs = !!prefs;

  let list = jobs.filter((j) => {
    if (state.keyword) {
      const t = (j.title + " " + j.company).toLowerCase();
      if (!t.includes(state.keyword)) return false;
    }
    if (state.location && j.location !== state.location) return false;
    if (state.mode && j.mode !== state.mode) return false;
    if (state.experience && j.experience !== state.experience) return false;
    if (state.source && j.source !== state.source) return false;
    if (state.status && getJobStatus(j.id) !== state.status) return false;
    return true;
  });

  list = list.map((j) => ({
    ...j,
    matchScore: hasPrefs ? computeMatchScore(j, prefs) : null,
  }));

  if (state.showOnlyMatches && hasPrefs) {
    list = list.filter(
      (j) =>
        typeof j.matchScore === "number" && j.matchScore >= prefs.minMatchScore
    );
  }

  if (state.sort === "match" && hasPrefs) {
    list.sort((a, b) => {
      const am = typeof a.matchScore === "number" ? a.matchScore : -1;
      const bm = typeof b.matchScore === "number" ? b.matchScore : -1;
      return bm - am;
    });
  } else if (state.sort === "salary") {
    list.sort((a, b) => parseSalaryNumber(b.salaryRange) - parseSalaryNumber(a.salaryRange));
  } else {
    list.sort((a, b) => (a.postedDaysAgo || 0) - (b.postedDaysAgo || 0));
  }

  return list;
}

export function generateDigestForDate(dateStr, jobs, computeScore, getDigestForDate, saveDigestForDate) {
  const existing = getDigestForDate(dateStr);
  if (existing?.jobs?.length && existing.date === dateStr) return existing;
  const prefs = getPreferences();
  if (!prefs) return null;
  const withScores = jobs.map((j) => ({
    ...j,
    matchScore: computeScore(j, prefs),
  }));
  withScores.sort((a, b) => {
    const am = typeof a.matchScore === "number" ? a.matchScore : -1;
    const bm = typeof b.matchScore === "number" ? b.matchScore : -1;
    if (bm !== am) return bm - am;
    return (a.postedDaysAgo || 0) - (b.postedDaysAgo || 0);
  });
  const top10 = withScores.slice(0, 10).map((j) => ({
    id: j.id,
    title: j.title,
    company: j.company,
    location: j.location,
    experience: j.experience,
    matchScore: j.matchScore,
    applyUrl: j.applyUrl,
  }));
  const payload = { date: dateStr, jobs: top10 };
  saveDigestForDate(dateStr, payload);
  return payload;
}
