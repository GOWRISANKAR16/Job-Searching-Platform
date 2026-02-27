import { useMemo, useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import {
  loadHistory,
  normalizeEntry,
  toInternalExtractedSkills,
  computeAdjustedReadinessScore,
  updateHistoryEntry,
  buildCompanyIntel,
  buildRoundMapping,
} from "../lib/analysis";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function groupSkillsByCategory(extractedSkills) {
  const groups = [];
  const keyToLabel = {
    coreCS: "Core CS",
    languages: "Languages",
    web: "Web",
    data: "Data",
    cloud: "Cloud / DevOps",
    testing: "Testing",
    other: "Other",
  };
  Object.entries(extractedSkills || {}).forEach(([key, skills]) => {
    if (Array.isArray(skills) && skills.length) {
      groups.push({
        label: keyToLabel[key] ?? key,
        skills,
      });
    }
  });
  return groups;
}

function formatPlanAsText(plan7Days) {
  if (!plan7Days || !plan7Days.length) return "";
  return plan7Days
    .map(
      (day) =>
        `${day.day} – ${day.focus}\n${(day.tasks || []).map((i) => `  • ${i}`).join("\n")}`
    )
    .join("\n\n");
}

function formatChecklistAsText(checklist) {
  if (!checklist || !checklist.length) return "";
  return checklist
    .map(
      (round) =>
        `${round.roundTitle || round.title || ""}\n${(round.items || []).map((i) => `  • ${i}`).join("\n")}`
    )
    .join("\n\n");
}

function formatQuestionsAsText(questions) {
  if (!questions || !questions.length) return "";
  return questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
}

function ResultsPage() {
  const query = useQuery();
  const targetId = query.get("id");
  const { entries: historyEntries } = loadHistory();

  const initialEntry = useMemo(() => {
    if (!historyEntries.length) return null;
    if (targetId) {
      const found = historyEntries.find((e) => e.id === targetId);
      return found ? { ...found } : { ...historyEntries[0] };
    }
    return { ...historyEntries[0] };
  }, [targetId, historyEntries]);

  const [entry, setEntry] = useState(initialEntry);

  useEffect(() => {
    const { entries } = loadHistory();
    if (!entries.length) return;
    const found = targetId
      ? entries.find((e) => e.id === targetId) || entries[0]
      : entries[0];
    if (!found) return;
    let resolved = normalizeEntry(found);
    if (!resolved.companyIntel && (resolved.company || resolved.jdText)) {
      const companyIntel = buildCompanyIntel(resolved.company, resolved.jdText);
      const internalSkills = toInternalExtractedSkills(resolved.extractedSkills);
      const roundMappingRaw = buildRoundMapping(companyIntel, internalSkills);
      resolved = { ...resolved, companyIntel, roundMapping: roundMappingRaw };
      updateHistoryEntry(resolved);
    }
    if (!resolved.roundMapping?.length && resolved.extractedSkills) {
      const internalSkills = toInternalExtractedSkills(resolved.extractedSkills);
      const roundMappingRaw = buildRoundMapping(resolved.companyIntel, internalSkills);
      resolved = { ...resolved, roundMapping: roundMappingRaw };
      updateHistoryEntry(resolved);
    }
    setEntry(resolved);
  }, [targetId]);

  const skillGroups = useMemo(
    () => groupSkillsByCategory(entry?.extractedSkills || {}),
    [entry?.extractedSkills]
  );
  const allSkills = useMemo(
    () => skillGroups.flatMap((g) => g.skills),
    [skillGroups]
  );

  const adjustedScore = useMemo(
    () =>
      entry
        ? computeAdjustedReadinessScore(
            entry.baseScore ?? 0,
            entry.skillConfidenceMap,
            allSkills
          )
        : 0
  );

  const handleSkillConfidence = useCallback(
    (skill, value) => {
      if (!entry) return;
      const nextMap = { ...(entry.skillConfidenceMap || {}), [skill]: value };
      const nextFinal = computeAdjustedReadinessScore(
        entry.baseScore ?? 0,
        nextMap,
        allSkills
      );
      const nextEntry = {
        ...entry,
        skillConfidenceMap: nextMap,
        finalScore: nextFinal,
        updatedAt: new Date().toISOString(),
      };
      setEntry(nextEntry);
      updateHistoryEntry(nextEntry);
    },
    [entry, allSkills]
  );

  const weakSkills = useMemo(() => {
    return allSkills
      .filter((s) => (entry?.skillConfidenceMap?.[s] ?? "practice") === "practice")
      .slice(0, 3);
  }, [allSkills, entry?.skillConfidenceMap]);

  const copyToClipboard = useCallback((text, label) => {
    navigator.clipboard.writeText(text).then(
      () => {},
      () => {}
    );
  }, []);

  const handleCopyPlan = useCallback(() => {
    copyToClipboard(formatPlanAsText(entry?.plan7Days), "7-day plan");
  }, [entry?.plan7Days, copyToClipboard]);

  const handleCopyChecklist = useCallback(() => {
    copyToClipboard(formatChecklistAsText(entry?.checklist), "Round checklist");
  }, [entry?.checklist, copyToClipboard]);

  const handleCopyQuestions = useCallback(() => {
    copyToClipboard(formatQuestionsAsText(entry?.questions), "10 questions");
  }, [entry?.questions, copyToClipboard]);

  const handleDownloadTxt = useCallback(() => {
    if (!entry) return;
    const sections = [
      "=== OVERVIEW ===",
      `Company: ${entry.company || "—"}`,
      `Role: ${entry.role || "—"}`,
      `Readiness score: ${adjustedScore} / 100`,
      "",
      "=== KEY SKILLS EXTRACTED ===",
      ...skillGroups.flatMap((g) => [
        g.label + ":",
        ...g.skills.map((s) => `  • ${s}`),
      ]),
      "",
      "=== ROUND-WISE CHECKLIST ===",
      formatChecklistAsText(entry.checklist),
      "",
      "=== 7-DAY PLAN ===",
      formatPlanAsText(entry.plan7Days),
      "",
      "=== LIKELY INTERVIEW QUESTIONS ===",
      formatQuestionsAsText(entry.questions),
    ];
    const blob = new Blob([sections.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `placement-readiness-${entry.company || "analysis"}-${entry.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [entry, adjustedScore, skillGroups]);

  if (!entry) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold text-slate-50">
          Results not available
        </h1>
        <p className="text-sm text-slate-300">
          There is no stored analysis yet. Run a JD analysis from the Assessments
          section to see detailed results here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-50">Analysis results</h1>
        <p className="text-sm text-slate-300 max-w-2xl">
          Generated from the analyzed job description. Toggle skill confidence to
          update your readiness score; changes are saved automatically.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Company, role, and your readiness score (updates with skill self-assessment).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-200">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs text-slate-400">Company</div>
                <div className="mt-1 text-sm text-slate-50">
                  {entry.company || "Not specified"}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Role</div>
                <div className="mt-1 text-sm text-slate-50">
                  {entry.role || "Not specified"}
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Readiness score</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-primary">
                  {adjustedScore}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key skills extracted</CardTitle>
            <CardDescription>
              Mark each skill: I know this, or Need practice. Score updates in real time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {skillGroups.length === 0 && (
              <div className="text-slate-400">
                No specific skills detected. Treated as general fresher stack.
              </div>
            )}
            {skillGroups.map((group) => (
              <div key={group.label} className="space-y-1.5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  {group.label}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => {
                    const status = entry.skillConfidenceMap?.[skill] ?? "practice";
                    return (
                      <div
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950/60 pl-2 pr-1 py-0.5"
                      >
                        <span className="text-[11px] text-slate-100">{skill}</span>
                        <select
                          value={status}
                          onChange={(e) =>
                            handleSkillConfidence(skill, e.target.value)
                          }
                          className="bg-slate-900/80 border-0 rounded text-[10px] text-slate-200 focus:ring-1 focus:ring-primary cursor-pointer"
                        >
                          <option value="practice">Need practice</option>
                          <option value="know">I know this</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {entry.company?.trim() && (
        <Card>
          <CardHeader>
            <CardTitle>Company intel</CardTitle>
            <CardDescription>
              Inferred from company name and JD. Used to tailor round mapping below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-200">
            {entry.companyIntel ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-xs text-slate-400">Company</div>
                    <div className="mt-1 font-medium text-slate-50">
                      {entry.companyIntel.companyName}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Industry</div>
                    <div className="mt-1">{entry.companyIntel.industry}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Estimated size</div>
                    <div className="mt-1">{entry.companyIntel.sizeCategory}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Typical hiring focus</div>
                  <p className="text-slate-200 leading-relaxed">
                    {entry.companyIntel.typicalHiringFocus}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-slate-400">No intel generated for this company.</p>
            )}
          </CardContent>
          <p className="px-4 pb-4 text-[11px] text-slate-500">
            Demo Mode: Company intel generated heuristically.
          </p>
        </Card>
      )}

      {(entry.roundMapping?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Round mapping</CardTitle>
            <CardDescription>
              Expected interview flow based on company size and detected skills.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative flex flex-col gap-0">
              {entry.roundMapping.map((round, idx) => (
                <div key={round.roundNumber} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary bg-slate-950 text-xs font-medium text-primary">
                      {round.roundNumber}
                    </div>
                    {idx < entry.roundMapping.length - 1 && (
                      <div className="w-px flex-1 min-h-[24px] bg-slate-700 mt-1" />
                    )}
                  </div>
                  <div className="pb-6 flex-1">
                    <div className="text-sm font-medium text-slate-50">
                      {round.roundTitle ?? round.title}
                    </div>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                      Why this round matters: {round.whyItMatters}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <p className="px-4 pb-4 text-[11px] text-slate-500">
            Demo Mode: Company intel generated heuristically.
          </p>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Round-wise preparation checklist</CardTitle>
            <CardDescription>
              Focus per interview round based on the detected stack.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-slate-200">
            {(entry.checklist || []).map((round) => (
              <div key={round.roundTitle ?? round.title} className="space-y-2">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  {round.roundTitle ?? round.title}
                </div>
                <ul className="space-y-1.5 list-disc list-inside">
                  {(round.items || []).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7-day plan</CardTitle>
            <CardDescription>
              Short, focused blocks that cover core CS, DSA, and your stack.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-200">
            {(entry.plan7Days || entry.plan || []).map((day) => (
              <div key={day.day} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    {day.day}
                  </span>
                  <span className="text-[11px] text-slate-300">{day.focus}</span>
                </div>
                <ul className="space-y-1 list-disc list-inside">
                  {(day.tasks || day.items || []).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Likely interview questions</CardTitle>
          <CardDescription>
            Ten questions grounded in the stack and topics mentioned in the JD.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-slate-200">
          {(entry.questions || []).map((q, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-slate-500">{idx + 1}.</span>
              <p>{q}</p>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopyPlan}
            className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Copy 7-day plan
          </button>
          <button
            type="button"
            onClick={handleCopyChecklist}
            className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Copy round checklist
          </button>
          <button
            type="button"
            onClick={handleCopyQuestions}
            className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Copy 10 questions
          </button>
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="inline-flex items-center justify-center rounded-md bg-primary/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary transition-colors"
          >
            Download as TXT
          </button>
        </CardFooter>
      </Card>

      <Card className="border-primary/30 bg-slate-950/90">
        <CardHeader>
          <CardTitle>Action next</CardTitle>
          <CardDescription>
            Top areas to focus on and a clear next step.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {weakSkills.length > 0 && (
            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-1.5">
                Top weak skills (need practice)
              </div>
              <div className="flex flex-wrap gap-2">
                {weakSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800/60 px-2.5 py-0.5 text-xs text-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          <p className="text-sm text-slate-200">
            Start Day 1 plan now.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResultsPage;
