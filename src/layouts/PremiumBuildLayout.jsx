import { useState, useEffect } from "react";
import { Outlet, useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { RB_STEP_NAMES, hasRbArtifact, canProceedToStep, setRbArtifact, getRbArtifact } from "../lib/rbArtifacts";
import { Home } from "lucide-react";

const RB_STEP_SLUGS = [
  "01-problem",
  "02-market",
  "03-architecture",
  "04-hld",
  "05-lld",
  "06-build",
  "07-test",
  "08-ship",
];

function stepSlugToNum(slug) {
  const idx = RB_STEP_SLUGS.indexOf(slug);
  return idx >= 0 ? idx + 1 : 0;
}

function PremiumBuildLayout() {
  const { stepSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [artifactVersion, setArtifactVersion] = useState(0);

  useEffect(() => {
    const handler = () => setArtifactVersion((v) => v + 1);
    window.addEventListener("rb-artifact-update", handler);
    return () => window.removeEventListener("rb-artifact-update", handler);
  }, []);

  const stepNum = stepSlugToNum(stepSlug || "");
  const isProof = location.pathname === "/rb/proof";
  const stepTitle = RB_STEP_NAMES[stepNum] || "";
  const hasArtifact = stepNum >= 1 && stepNum <= 8 && hasRbArtifact(stepNum);
  const canNext = stepNum >= 1 && stepNum <= 8 && canProceedToStep(stepNum + 1);
  const nextStepSlug = stepNum < 8 ? RB_STEP_SLUGS[stepNum] : null;
  const prevStepSlug = stepNum > 1 ? RB_STEP_SLUGS[stepNum - 2] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/app/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100 hover:text-white rounded-md px-2 py-1 -ml-2"
            title="Home"
          >
            <Home className="w-5 h-5 text-slate-400" />
            <span>Home</span>
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-sm font-semibold text-slate-100">AI Resume Builder</span>
        </div>
        <div className="text-sm text-slate-300">
          {isProof ? "Project 3 — Proof" : stepNum ? `Project 3 — Step ${stepNum} of 8` : "Project 3"}
        </div>
        <div>
          {hasArtifact ? (
            <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              Artifact uploaded
            </span>
          ) : stepNum >= 1 && stepNum <= 8 ? (
            <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400">
              Pending
            </span>
          ) : null}
        </div>
      </header>

      {/* Context header */}
      <div className="border-b border-slate-800 px-6 py-3 bg-slate-950/80 shrink-0">
        <h1 className="text-lg font-semibold text-slate-50">
          {isProof ? "Proof & submission" : stepTitle ? `${stepNum}. ${stepTitle}` : "Build Track"}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {isProof
            ? "Add your Lovable, GitHub, and Deploy links. Copy final submission."
            : stepTitle
              ? "Complete the build panel on the right and upload artifact to proceed."
              : ""}
        </p>
      </div>

      {/* Main workspace (70%) + Build panel (30%) — only for step pages, not proof */}
      <div className="flex-1 flex min-h-0">
        <main className="flex-1 overflow-auto min-w-0" style={{ flex: "0 0 70%" }}>
          <Outlet />
        </main>
        {!isProof && stepNum >= 1 && stepNum <= 8 && (
          <aside
            className="border-l border-slate-800 bg-slate-900/50 overflow-auto shrink-0 flex flex-col"
            style={{ flex: "0 0 30%", minWidth: 280 }}
          >
            <BuildPanel
              stepNum={stepNum}
              stepTitle={stepTitle}
              onArtifactUploaded={() => {}}
            />
          </aside>
        )}
      </div>

      {/* Proof footer: Prev / Next / Proof */}
      <footer className="border-t border-slate-800 px-6 py-3 flex items-center justify-between bg-slate-950/80 shrink-0">
        <div className="flex items-center gap-2">
          {prevStepSlug && (
            <button
              type="button"
              onClick={() => navigate(`/rb/${prevStepSlug}`)}
              className="rounded-md border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
            >
              ← Previous
            </button>
          )}
          {stepNum === 0 && !isProof && (
            <button
              type="button"
              onClick={() => navigate("/rb/01-problem")}
              className="rounded-md border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
            >
              Start Step 1
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {nextStepSlug && (
            <button
              type="button"
              onClick={() => navigate(`/rb/${nextStepSlug}`)}
              disabled={!hasArtifact}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          )}
          {stepNum === 8 && (
            <button
              type="button"
              onClick={() => navigate("/rb/proof")}
              disabled={!hasArtifact}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proof →
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("/rb/proof")}
            className="rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            Proof
          </button>
        </div>
      </footer>
    </div>
  );
}

function BuildPanel({ stepNum, stepTitle, onArtifactUploaded }) {
  const [lovablePrompt, setLovablePrompt] = useState("");
  const [artifactStatus, setArtifactStatus] = useState(null);

  const handleCopy = () => {
    if (lovablePrompt.trim()) {
      navigator.clipboard?.writeText(lovablePrompt).catch(() => {});
    }
  };

  const handleWorked = () => {
    setRbArtifact(stepNum, { status: "worked" });
    setArtifactStatus("worked");
    onArtifactUploaded?.();
    window.dispatchEvent(new CustomEvent("rb-artifact-update", { detail: { stepNum } }));
  };

  const handleError = () => {
    setRbArtifact(stepNum, { status: "error" });
    setArtifactStatus("error");
    onArtifactUploaded?.();
    window.dispatchEvent(new CustomEvent("rb-artifact-update", { detail: { stepNum } }));
  };

  const handleScreenshot = () => {
    setRbArtifact(stepNum, { status: "screenshot" });
    setArtifactStatus("screenshot");
    onArtifactUploaded?.();
    window.dispatchEvent(new CustomEvent("rb-artifact-update", { detail: { stepNum } }));
  };

  useEffect(() => {
    const handler = () => {
      const a = getRbArtifact(stepNum);
      setArtifactStatus(a?.status ?? null);
    };
    window.addEventListener("rb-artifact-update", handler);
    handler();
    return () => window.removeEventListener("rb-artifact-update", handler);
  }, [stepNum]);

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">
          Copy this into Lovable
        </label>
        <textarea
          value={lovablePrompt}
          onChange={(e) => setLovablePrompt(e.target.value)}
          placeholder={`Step ${stepNum}: ${stepTitle} — paste or type prompt...`}
          rows={6}
          className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 resize-y"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
        >
          Copy
        </button>
        <a
          href="https://lovable.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-primary/50 bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/30"
        >
          Build in Lovable
        </a>
      </div>
      <div>
        <div className="text-xs font-medium text-slate-400 mb-2">Artifact</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleWorked}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              artifactStatus === "worked"
                ? "bg-emerald-600 text-white"
                : "border border-slate-600 text-slate-300 hover:bg-slate-800"
            }`}
          >
            It Worked
          </button>
          <button
            type="button"
            onClick={handleError}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              artifactStatus === "error"
                ? "bg-amber-600 text-white"
                : "border border-slate-600 text-slate-300 hover:bg-slate-800"
            }`}
          >
            Error
          </button>
          <button
            type="button"
            onClick={handleScreenshot}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              artifactStatus === "screenshot"
                ? "bg-blue-600 text-white"
                : "border border-slate-600 text-slate-300 hover:bg-slate-800"
            }`}
          >
            Add Screenshot
          </button>
        </div>
      </div>
    </div>
  );
}

export default PremiumBuildLayout;
