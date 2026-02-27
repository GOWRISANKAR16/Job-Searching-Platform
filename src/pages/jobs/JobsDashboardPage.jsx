import { useState, useMemo, useCallback } from "react";
import { JOBS_DATA } from "../../data/jobsData";
import {
  getSavedIds,
  addSavedId,
  removeSavedId,
  getJobStatus,
  setJobStatus,
  getPreferencesRaw,
  getPreferences,
} from "../../lib/jobsStorage";
import { filterAndSortJobs, computeMatchScore } from "../../lib/jobScoring";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/card";

const LOCATIONS = ["Bangalore", "Hyderabad", "Chennai", "Pune", "Mumbai", "Noida", "Gurgaon"];
const STATUS_OPTIONS = ["Not Applied", "Applied", "Rejected", "Selected"];

function postedLabel(days) {
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function JobCard({ job, showRemove = false, onRefresh }) {
  const savedIds = getSavedIds();
  const isSaved = savedIds.includes(job.id);
  const currentStatus = getJobStatus(job.id);

  const handleSave = useCallback(() => {
    if (isSaved) return;
    addSavedId(job.id);
    onRefresh?.();
  }, [job.id, isSaved, onRefresh]);

  const handleRemove = useCallback(() => {
    removeSavedId(job.id);
    onRefresh?.();
  }, [job.id, onRefresh]);

  const handleStatusChange = useCallback(
    (e) => {
      const status = e.target.value;
      if (!STATUS_OPTIONS.includes(status)) return;
      setJobStatus(job.id, status, job);
      onRefresh?.();
    },
    [job, onRefresh]
  );

  const matchClass =
    typeof job.matchScore === "number"
      ? job.matchScore >= 80
        ? "text-emerald-400"
        : job.matchScore >= 60
          ? "text-amber-400"
          : job.matchScore >= 40
            ? "text-slate-300"
            : "text-slate-500"
      : "";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{job.title}</CardTitle>
        <p className="text-sm text-slate-400">{job.company}</p>
      </CardHeader>
      <CardContent className="space-y-1 text-xs text-slate-300">
        <p>
          {job.location} · {job.mode} · {job.experience}
        </p>
        <p>{job.salaryRange}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-slate-400">Status</label>
          <select
            value={currentStatus}
            onChange={handleStatusChange}
            className="rounded border border-slate-700 bg-slate-900/80 px-2 py-1 text-slate-200 text-xs"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {typeof job.matchScore === "number" && (
            <span className={matchClass}>{job.matchScore}% match</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          onClick={() => window.open(job.applyUrl, "_blank")}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
        >
          Apply
        </button>
        {showRemove ? (
          <button
            type="button"
            onClick={handleRemove}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
          >
            Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaved}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-60"
          >
            {isSaved ? "Saved" : "Save"}
          </button>
        )}
        <span className="text-[11px] text-slate-500 ml-auto">
          {job.source} · {postedLabel(job.postedDaysAgo ?? 0)}
        </span>
      </CardFooter>
    </Card>
  );
}

export default function JobsDashboardPage() {
  const [filter, setFilter] = useState({
    keyword: "",
    location: "",
    mode: "",
    experience: "",
    source: "",
    sort: "latest",
    status: "",
    showOnlyMatches: false,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const prefs = getPreferencesRaw();
  const jobs = useMemo(() => {
    const list = filterAndSortJobs(
      JOBS_DATA.map((j) => ({
        ...j,
        matchScore: prefs ? computeMatchScore(j, getPreferences()) : null,
      })),
      filter,
      getJobStatus
    );
    return list;
  }, [filter, refreshKey, prefs]);

  const hasNoPrefs = !prefs;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50">Jobs Dashboard</h1>
        <p className="text-sm text-slate-300 max-w-2xl">
          Browse 60 Indian tech jobs. Set preferences in Settings to see match scores and filter by threshold.
        </p>
      </header>

      {hasNoPrefs && (
        <div className="rounded-lg border border-amber-800/50 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">
          Set your preferences in Settings to activate intelligent matching.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="Keyword (title or company)"
          value={filter.keyword}
          onChange={(e) => setFilter((f) => ({ ...f, keyword: e.target.value.toLowerCase() }))}
          className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
        />
        <select
          value={filter.location}
          onChange={(e) => setFilter((f) => ({ ...f, location: e.target.value }))}
          className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
        >
          <option value="">All locations</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
        <select
          value={filter.mode}
          onChange={(e) => setFilter((f) => ({ ...f, mode: e.target.value }))}
          className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
        >
          <option value="">All</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Onsite">Onsite</option>
        </select>
        <select
          value={filter.experience}
          onChange={(e) => setFilter((f) => ({ ...f, experience: e.target.value }))}
          className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
        >
          <option value="">All</option>
          <option value="Fresher">Fresher</option>
          <option value="0-1">0-1</option>
          <option value="1-3">1-3</option>
          <option value="3-5">3-5</option>
        </select>
        <select
          value={filter.source}
          onChange={(e) => setFilter((f) => ({ ...f, source: e.target.value }))}
          className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
        >
          <option value="">All</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Naukri">Naukri</option>
          <option value="Indeed">Indeed</option>
        </select>
        <select
          value={filter.sort}
          onChange={(e) => setFilter((f) => ({ ...f, sort: e.target.value }))}
          className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
        >
          <option value="latest">Latest</option>
          <option value="match">Match score</option>
          <option value="salary">Salary</option>
        </select>
        <select
          value={filter.status}
          onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
          className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
        >
          <option value="">All status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={filter.showOnlyMatches}
            onChange={(e) => setFilter((f) => ({ ...f, showOnlyMatches: e.target.checked }))}
            className="rounded border-slate-700"
          />
          Show only above threshold
        </label>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-slate-400">
            No jobs match your filters. Adjust filters or lower your match threshold in Settings.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onRefresh={() => setRefreshKey((k) => k + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
