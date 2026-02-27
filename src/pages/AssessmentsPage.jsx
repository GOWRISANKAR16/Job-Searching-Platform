import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import {
  extractSkills,
  computeReadinessScore,
  buildChecklist,
  buildSevenDayPlan,
  buildLikelyQuestions,
  buildCompanyIntel,
  buildRoundMapping,
  createStandardEntry,
  addHistoryEntry,
} from "../lib/analysis";

function AssessmentsPage() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jdText, setJdText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = () => {
    if (!jdText.trim()) return;

    setIsAnalyzing(true);
    const extractedSkills = extractSkills(jdText);
    const readinessScore = computeReadinessScore({
      jdText,
      company,
      role,
      extractedSkills,
    });

    const checklist = buildChecklist(extractedSkills);
    const plan = buildSevenDayPlan(extractedSkills);
    const questions = buildLikelyQuestions(extractedSkills);
    const companyIntel = buildCompanyIntel(company.trim(), jdText);
    const roundMappingRaw = buildRoundMapping(companyIntel, extractedSkills);

    const entry = createStandardEntry({
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      company: company.trim(),
      role: role.trim(),
      jdText,
      extractedSkillsInternal: extractedSkills,
      checklist,
      plan,
      questions,
      baseScore: readinessScore,
      companyIntel,
      roundMappingRaw,
    });

    addHistoryEntry(entry);
    setIsAnalyzing(false);
    navigate("/app/results");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-50">JD Analysis</h1>
        <p className="text-sm text-slate-300 max-w-2xl">
          Paste a job description and we&apos;ll extract skills, build a round-wise
          checklist, 7-day plan, and likely interview questions. Everything runs
          locally and persists on this device.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Job description input</CardTitle>
            <CardDescription>
              Add company, role, and paste the JD text. No external calls are made.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Company</label>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g., Acme Corp"
                  className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Role</label>
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., SDE Intern"
                  className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">
                Job description <span className="text-slate-500">(required)</span>
              </label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={12}
                placeholder="Paste the full JD text here..."
                className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary resize-vertical"
                required
              />
              {jdText.length > 0 && jdText.length < 200 && (
                <p className="text-xs text-amber-600/90">
                  This JD is too short to analyze deeply. Paste full JD for better output.
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <button
              onClick={handleAnalyze}
              disabled={!jdText.trim() || isAnalyzing}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze JD"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/history")}
              className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              View past analyses
            </button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How this works</CardTitle>
            <CardDescription>
              Simple heuristics, clear outputs, fully offline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-slate-300">
            <ul className="space-y-2 list-disc list-inside">
              <li>Detects skills from the JD text across predefined categories.</li>
              <li>Generates a readiness score based on context richness.</li>
              <li>Builds a round-wise checklist and 7-day plan.</li>
              <li>Creates 10 likely interview questions from the detected stack.</li>
              <li>Saves every run to local history, stored in your browser.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AssessmentsPage;

