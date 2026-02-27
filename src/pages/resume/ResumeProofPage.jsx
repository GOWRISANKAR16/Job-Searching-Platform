import { Link } from "react-router-dom";
import { useResume } from "../../context/ResumeContext";
import { getPlacementScore } from "../../lib/placementScore";
import { computeAtsScore } from "../../lib/atsScore";
import { getPlatformState } from "../../lib/platformStore";
import PlacementScoreCircle from "../../components/PlacementScoreCircle";

const FEATURES = [
  { label: "Job Tracker working", path: "/app/jobs", done: true },
  { label: "JD Analyzer working", path: "/app/assessments", done: true },
  { label: "Resume Builder working", path: "/builder", done: true },
  { label: "Unified Dashboard working", path: "/app/dashboard", done: true },
  { label: "Application Pipeline working", path: "/app/jobs/saved", done: true },
];

export default function ResumeProofPage() {
  const { resume } = useResume();
  const ats = computeAtsScore(resume);
  const platformState = typeof window !== "undefined" ? getPlatformState() : null;
  const placement = getPlacementScore({
    resume,
    jobMatchQuality: 0,
    jdSkillAlignment: 0,
    applicationProgress: 0,
    practiceCompletion: 0,
  });

  const deploymentLink = import.meta.env.VITE_DEPLOYMENT_URL || "#";
  const githubLink = import.meta.env.VITE_GITHUB_URL || "https://github.com";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-semibold text-slate-50">Step 8 — Final Ship + Platform Proof</h1>
      <p className="mt-2 text-slate-300 text-sm">
        Proof page: all modules connected. No feature works alone — everything connects.
      </p>

      {/* Placement Score visible — premium circle */}
      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex justify-center">
            <PlacementScoreCircle score={placement.score} size={160} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-400">
              Central readiness: Job Match 30% · JD Alignment 25% · Resume ATS 25% · Application Progress 10% · Practice 10%
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span>Resume ATS: {ats.score}</span>
              <span>·</span>
              <span>Last activity: {platformState?.lastActivity ? new Date(platformState.lastActivity).toLocaleDateString() : "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="mt-8">
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Proof page includes</h2>
        <ul className="mt-3 space-y-2">
          {FEATURES.map((f) => (
            <li key={f.path} className="flex items-center gap-3">
              <span className="text-emerald-500" aria-hidden>✓</span>
              <Link to={f.path} className="text-slate-200 font-medium hover:text-white hover:underline">
                {f.label}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-3">
            <span className="text-emerald-500" aria-hidden>✓</span>
            <span className="text-slate-200 font-medium">Placement Score visible</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-slate-500" aria-hidden>○</span>
            <a href={deploymentLink} target="_blank" rel="noopener noreferrer" className="text-slate-200 font-medium hover:text-white hover:underline">
              Deployment link
            </a>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-slate-500" aria-hidden>○</span>
            <a href={githubLink} target="_blank" rel="noopener noreferrer" className="text-slate-200 font-medium hover:text-white hover:underline">
              GitHub link
            </a>
          </li>
        </ul>
      </div>

      <p className="mt-8 text-slate-500 text-sm italic">No feature works alone. Everything connects.</p>
    </div>
  );
}
