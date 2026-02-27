import { useState, useEffect } from "react";
import {
  hasRbArtifact,
  getProofLinks,
  setProofLinks,
  RB_STEP_NAMES,
} from "../../lib/rbArtifacts";

export default function RbProofPage() {
  const [links, setLinks] = useState(getProofLinks());

  useEffect(() => {
    setLinks(getProofLinks());
  }, []);

  const updateLink = (key, value) => {
    const next = { ...links, [key]: value };
    setLinks(next);
    setProofLinks(next);
  };

  const stepStatus = [];
  for (let i = 1; i <= 8; i++) {
    stepStatus.push({
      step: i,
      name: RB_STEP_NAMES[i],
      done: hasRbArtifact(i),
    });
  }

  const buildSubmission = () => {
    const lines = [
      "Project 3: AI Resume Builder — Build Track",
      "Proof & Final Submission",
      "",
      "Step status:",
      ...stepStatus.map((s) => `  Step ${s.step} (${s.name}): ${s.done ? "Done" : "Pending"}`),
      "",
      "Lovable link: " + (links.lovable || "(not set)"),
      "GitHub link: " + (links.github || "(not set)"),
      "Deploy link: " + (links.deploy || "(not set)"),
    ];
    return lines.join("\n");
  };

  const handleCopyFinal = () => {
    navigator.clipboard?.writeText(buildSubmission()).catch(() => {});
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
        <h2 className="text-base font-semibold text-slate-100 mb-4">8-step status</h2>
        <ul className="space-y-2 text-sm">
          {stepStatus.map((s) => (
            <li key={s.step} className="flex items-center gap-3">
              <span
                className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-medium ${
                  s.done ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-400"
                }`}
              >
                {s.step}
              </span>
              <span className="text-slate-300">{s.name}</span>
              <span className={s.done ? "text-emerald-400 text-xs" : "text-slate-500 text-xs"}>
                {s.done ? "Done" : "Pending"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-100">Submission links</h2>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Lovable link</label>
          <input
            type="url"
            value={links.lovable}
            onChange={(e) => updateLink("lovable", e.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">GitHub link</label>
          <input
            type="url"
            value={links.github}
            onChange={(e) => updateLink("github", e.target.value)}
            placeholder="https://github.com/..."
            className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Deploy link</label>
          <input
            type="url"
            value={links.deploy}
            onChange={(e) => updateLink("deploy", e.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
          />
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={handleCopyFinal}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Copy Final Submission
        </button>
      </div>
    </div>
  );
}
