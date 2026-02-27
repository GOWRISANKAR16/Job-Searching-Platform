import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { useResume } from "../context/ResumeContext";
import { computeAtsScore } from "../lib/atsScore";
import { getPlacementScore } from "../lib/placementScore";
import { getPipelineCounts, getApplicationProgressScore, getJobStatus } from "../lib/jobsStorage";
import { filterAndSortJobs } from "../lib/jobScoring";
import { JOBS_DATA } from "../data/jobsData";
import PlacementScoreCircle from "../components/PlacementScoreCircle";

const radarData = [
  { subject: "DSA", score: 75 },
  { subject: "System Design", score: 60 },
  { subject: "Communication", score: 80 },
  { subject: "Resume", score: 85 },
  { subject: "Aptitude", score: 70 },
];

const practiceTotal = 10;
const practiceCompleted = 3;
const weeklyGoalTotal = 20;
const weeklyGoalCompleted = 12;

const weeklyDays = [
  { label: "Mon", active: true },
  { label: "Tue", active: true },
  { label: "Wed", active: false },
  { label: "Thu", active: true },
  { label: "Fri", active: true },
  { label: "Sat", active: false },
  { label: "Sun", active: false },
];

function ProgressBar({ value, max }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
      <div
        className="h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function DashboardPage() {
  const { resume } = useResume();
  const ats = useMemo(() => computeAtsScore(resume), [resume]);
  const appProgress = getApplicationProgressScore();
  const dailyJobMatchQuality = useMemo(() => {
    const sorted = filterAndSortJobs(JOBS_DATA, { sort: "match" }, getJobStatus);
    const withMatch = sorted.filter((j) => typeof j.matchScore === "number");
    if (!withMatch.length) return 0;
    const sum = withMatch.slice(0, 5).reduce((a, j) => a + (j.matchScore || 0), 0);
    return Math.round(sum / Math.min(5, withMatch.length));
  }, []);
  const dailyJobs = useMemo(() => filterAndSortJobs(JOBS_DATA, { sort: "match" }, getJobStatus).slice(0, 5), []);
  const placement = useMemo(
    () =>
      getPlacementScore({
        resume,
        jobMatchQuality: dailyJobMatchQuality,
        jdSkillAlignment: 0,
        applicationProgress: appProgress,
        practiceCompletion: practiceCompleted && practiceTotal ? Math.round((practiceCompleted / practiceTotal) * 100) : 0,
      }),
    [resume, appProgress, dailyJobMatchQuality]
  );
  const pipelineCounts = getPipelineCounts();
  const appliedCount = (pipelineCounts.Applied || 0) + (pipelineCounts["Interview Scheduled"] || 0) + (pipelineCounts["Interview Completed"] || 0);
  const offerCount = pipelineCounts.Offer || 0;

  const readinessScore = placement.score;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50">
          Unified Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-2xl">
          Control center: Placement Score, Resume ATS, Daily Job Matches, Application Pipeline, and next actions.
        </p>
      </header>

      {/* Step 7 — Notification: Resume score below 70 */}
      {ats.score < 70 && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-amber-200 text-sm">
          <strong>Weak resume alert:</strong> Your ATS score is {ats.score}. Improve it to 70+ for better visibility. Use the Resume Builder to add missing sections and keywords.
        </div>
      )}

      {/* Placement Score + Resume ATS + Next Action */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Placement Score</CardTitle>
            <CardDescription>Central readiness: Job Match 30% · JD Alignment 25% · Resume ATS 25% · Application 10% · Practice 10%.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-6">
            <PlacementScoreCircle score={readinessScore} size={176} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resume ATS Score</CardTitle>
            <CardDescription>Deterministic score from resume completeness and keywords.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="text-4xl font-bold text-slate-50">{ats.score}</div>
            <div className="mt-1 text-xs text-slate-400">out of 100</div>
            <Link to="/builder" className="mt-3 text-sm text-primary hover:underline">Improve in Builder</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Next Action</CardTitle>
            <CardDescription>Recommended next step based on your readiness.</CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <p className="text-sm text-slate-200">
              {ats.score < 70 ? "Improve your resume ATS score in the Builder (add summary, skills, projects)." : appliedCount === 0 && dailyJobs.length ? "Apply to a top match from Daily Job Matches to move forward." : appliedCount > 0 && offerCount === 0 ? "Track applications and prepare for interviews from Saved Jobs." : "Keep practicing and run a JD analysis to align resume with roles."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Job Matches (top 5) + Application Pipeline */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Job Matches (Top 5)</CardTitle>
            <CardDescription>Best matches based on your job preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyJobs.length === 0 ? (
              <p className="text-sm text-slate-400">Set preferences in Job Settings, then open Jobs to see matches.</p>
            ) : (
              <ul className="space-y-2">
                {dailyJobs.map((j) => (
                  <li key={j.id} className="flex items-center justify-between rounded-lg border border-slate-800/80 px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-slate-50">{j.title} · {j.company}</div>
                      <div className="text-xs text-slate-400">{j.location} {typeof j.matchScore === "number" && `· ${j.matchScore}% match`}</div>
                    </div>
                    <Link to="/app/jobs" className="text-xs text-primary hover:underline">View</Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Application Pipeline</CardTitle>
            <CardDescription>Applied / Interview / Offer — momentum for Placement Score.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 py-6">
            <div className="rounded-lg bg-slate-800/60 px-4 py-2">
              <div className="text-2xl font-semibold text-slate-50">{pipelineCounts.Saved || 0}</div>
              <div className="text-xs text-slate-400">Saved</div>
            </div>
            <div className="rounded-lg bg-slate-800/60 px-4 py-2">
              <div className="text-2xl font-semibold text-slate-50">{appliedCount}</div>
              <div className="text-xs text-slate-400">Applied / Interview</div>
            </div>
            <div className="rounded-lg bg-slate-800/60 px-4 py-2">
              <div className="text-2xl font-semibold text-slate-50">{offerCount}</div>
              <div className="text-xs text-slate-400">Offer</div>
            </div>
            <div className="rounded-lg bg-slate-800/60 px-4 py-2">
              <div className="text-2xl font-semibold text-slate-50">{pipelineCounts.Rejected || 0}</div>
              <div className="text-xs text-slate-400">Rejected</div>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/app/jobs/saved" className="text-sm text-primary hover:underline">Manage saved jobs →</Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Skill Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Breakdown</CardTitle>
            <CardDescription>
              Relative strength across core placement dimensions.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={radarData}
                outerRadius="70%"
              >
                <PolarGrid stroke="rgba(148, 163, 184, 0.4)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#e5e7eb", fontSize: 11 }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(245, 58%, 51%)"
                  fill="hsl(245, 58%, 51%)"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Continue Practice */}
        <Card>
          <CardHeader>
            <CardTitle>Continue Practice</CardTitle>
            <CardDescription>
              Pick up exactly where you left off.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs text-slate-400">Last topic</div>
              <div className="mt-1 text-sm font-medium text-slate-50">
                Dynamic Programming
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Round progress</span>
                <span className="text-slate-200">
                  {practiceCompleted}/{practiceTotal} completed
                </span>
              </div>
              <ProgressBar value={practiceCompleted} max={practiceTotal} />
            </div>
          </CardContent>
          <CardFooter>
            <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90 transition-colors">
              Continue
            </button>
            <span className="text-[11px] text-slate-400">
              Recommended: 2 more rounds today.
            </span>
          </CardFooter>
        </Card>

        {/* Weekly Goals + Upcoming Assessments */}
        <div className="space-y-6">
          {/* Weekly Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Goals</CardTitle>
              <CardDescription>
                Problems solved and daily momentum for this week.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Problems Solved</span>
                  <span className="text-slate-200">
                    {weeklyGoalCompleted}/{weeklyGoalTotal} this week
                  </span>
                </div>
                <ProgressBar value={weeklyGoalCompleted} max={weeklyGoalTotal} />
              </div>
              <div className="flex items-center justify-between">
                {weeklyDays.map((day) => (
                  <div
                    key={day.label}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={`w-7 h-7 rounded-full border text-[11px] flex items-center justify-center ${
                        day.active
                          ? "bg-primary/80 border-primary text-white"
                          : "border-slate-700 text-slate-400"
                      }`}
                    >
                      {day.label[0]}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Assessments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Assessments</CardTitle>
              <CardDescription>
                The next checkpoints in your preparation schedule.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  title: "DSA Mock Test",
                  time: "Tomorrow, 10:00 AM",
                },
                {
                  title: "System Design Review",
                  time: "Wed, 2:00 PM",
                },
                {
                  title: "HR Interview Prep",
                  time: "Friday, 11:00 AM",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/60 px-3 py-2.5"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-50">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {item.time}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-primary">
                    Scheduled
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

