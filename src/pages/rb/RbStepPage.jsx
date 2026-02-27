import { useParams, Navigate } from "react-router-dom";
import { RB_STEP_NAMES } from "../../lib/rbArtifacts";

const SLUGS = ["01-problem", "02-market", "03-architecture", "04-hld", "05-lld", "06-build", "07-test", "08-ship"];

function slugToNum(slug) {
  const idx = SLUGS.indexOf(slug);
  return idx >= 0 ? idx + 1 : 0;
}

export default function RbStepPage() {
  const { stepSlug } = useParams();
  const stepNum = slugToNum(stepSlug || "");
  if (stepNum < 1 || stepNum > 8) return <Navigate to="/rb/01-problem" replace />;

  const title = RB_STEP_NAMES[stepNum] || `Step ${stepNum}`;

  return (
    <div className="p-6 max-w-3xl">
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        <p className="mt-2 text-sm text-slate-400">
          Step {stepNum} of 8. Use the build panel on the right to copy your prompt into Lovable, build, and upload your artifact (It Worked / Error / Add Screenshot). Next is disabled until an artifact is uploaded.
        </p>
        <p className="mt-4 text-xs text-slate-500">
          Resume features will be added later. This is the route rail and gating system only.
        </p>
      </div>
    </div>
  );
}
