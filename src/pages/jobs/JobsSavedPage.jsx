import { useState, useMemo } from "react";
import { JOBS_DATA } from "../../data/jobsData";
import { getSavedIds, removeSavedId, getJobStatus, setJobStatus, getPreferences, PIPELINE_STAGES } from "../../lib/jobsStorage";
import { computeMatchScore } from "../../lib/jobScoring";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/card";

function JobCard({ job, onRefresh }) {
  const currentStatus = getJobStatus(job.id);
  const matchScore = getPreferences() ? computeMatchScore(job, getPreferences()) : null;

  const handleStatusChange = (e) => {
    const status = e.target.value;
    if (PIPELINE_STAGES.includes(status)) {
      setJobStatus(job.id, status, job);
      onRefresh?.();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{job.title}</CardTitle>
        <p className="text-sm text-slate-400">{job.company}</p>
      </CardHeader>
      <CardContent className="text-xs text-slate-300 space-y-1">
        <p>{job.location} · {job.mode} · {job.experience}</p>
        <p>{job.salaryRange}</p>
        <div className="flex items-center gap-2">
          <label className="text-slate-400">Status</label>
          <select
            value={currentStatus}
            onChange={handleStatusChange}
            className="rounded border border-slate-700 bg-slate-900/80 px-2 py-1 text-slate-200 text-xs"
          >
            {PIPELINE_STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {matchScore !== null && (
            <span className="text-slate-400">{matchScore}% match</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => window.open(job.applyUrl, "_blank")}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={() => {
            removeSavedId(job.id);
            onRefresh?.();
          }}
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
        >
          Remove
        </button>
      </CardFooter>
    </Card>
  );
}

export default function JobsSavedPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const savedIds = useMemo(() => getSavedIds(), [refreshKey]);
  const savedJobs = useMemo(
    () => JOBS_DATA.filter((j) => savedIds.includes(j.id)),
    [savedIds]
  );

  if (savedJobs.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-50">Saved Jobs</h1>
        <p className="mt-2 text-sm text-slate-300">
          Jobs you save from the dashboard will appear here.
        </p>
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-8 text-center text-slate-400">
          No saved jobs yet. Save ones you want to revisit from the Jobs dashboard.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50">Saved Jobs</h1>
        <p className="text-sm text-slate-300">
          {savedJobs.length} job{savedJobs.length !== 1 ? "s" : ""} saved.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {savedJobs.map((job) => (
          <JobCard key={job.id} job={job} onRefresh={() => setRefreshKey((k) => k + 1)} />
        ))}
      </div>
    </div>
  );
}
