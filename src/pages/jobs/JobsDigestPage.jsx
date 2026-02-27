import { useState, useCallback } from "react";
import {
  getTodayDateString,
  getDigestForDate,
  saveDigestForDate,
  getPreferencesRaw,
  getStatusUpdates,
  formatDigestPlainText,
  getDigestMailtoBody,
} from "../../lib/jobsStorage";
import { JOBS_DATA } from "../../data/jobsData";
import { generateDigestForDate, computeMatchScore } from "../../lib/jobScoring";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

export default function JobsDigestPage() {
  const today = getTodayDateString();
  const prefs = getPreferencesRaw();
  const [digest, setDigest] = useState(() => getDigestForDate(today));
  const [generating, setGenerating] = useState(false);
  const updates = getStatusUpdates();

  const handleGenerate = useCallback(() => {
    if (!prefs) return;
    setGenerating(true);
    const result = generateDigestForDate(
      today,
      JOBS_DATA,
      computeMatchScore,
      getDigestForDate,
      saveDigestForDate
    );
    setDigest(result);
    setGenerating(false);
  }, [today, prefs]);

  const handleCopy = useCallback(() => {
    if (!digest) return;
    const text = formatDigestPlainText(digest);
    navigator.clipboard?.writeText(text).catch(() => {});
  }, [digest]);

  const handleEmail = useCallback(() => {
    if (!digest) return;
    const body = getDigestMailtoBody(digest);
    const subject = "My 9AM Job Digest";
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [digest]);

  if (!prefs) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-50">Daily Digest</h1>
        <p className="mt-2 text-sm text-slate-300">
          Set preferences in Settings to generate a personalized top-10 digest.
        </p>
        <Card className="mt-6">
          <CardContent className="py-8 text-slate-400">
            Go to Jobs → Settings to set your role, location, and match criteria.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50">Daily Digest</h1>
        <p className="text-sm text-slate-300">
          Top 10 jobs for you — 9AM digest. Demo: trigger generated manually.
        </p>
      </header>

      {!digest?.jobs?.length && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {generating ? "Generating…" : "Generate today's digest"}
          </button>
        </div>
      )}

      {digest?.jobs?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
          >
            Copy to clipboard
          </button>
          <button
            type="button"
            onClick={handleEmail}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
          >
            Create email draft
          </button>
        </div>
      )}

      {digest?.jobs?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Jobs For You — 9AM Digest</CardTitle>
            <p className="text-xs text-slate-400">{digest.date}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {digest.jobs.map((j, i) => (
              <div key={j.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 last:border-0">
                <div>
                  <span className="text-slate-500 text-sm">{i + 1}. </span>
                  <span className="font-medium text-slate-50">{j.title}</span>
                  <span className="text-slate-400"> · {j.company}</span>
                </div>
                <div className="text-xs text-slate-400">
                  {j.location} · {j.experience}
                  {typeof j.matchScore === "number" && ` · ${j.matchScore}% match`}
                </div>
                {j.applyUrl && (
                  <a
                    href={j.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-primary px-2 py-1 text-xs text-white hover:bg-primary/90"
                  >
                    Apply
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Status Updates</CardTitle>
        </CardHeader>
        <CardContent>
          {updates.length === 0 ? (
            <p className="text-sm text-slate-400">No status updates yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {updates.slice(0, 10).map((u, i) => (
                <li key={i} className="flex flex-wrap gap-2 text-slate-300">
                  <span className="font-medium text-slate-50">{u.title}</span>
                  <span>{u.company}</span>
                  <span className="text-primary">{u.status}</span>
                  <span className="text-slate-500 text-xs">
                    {new Date(u.dateChanged).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
