import { useNavigate } from "react-router-dom";
import { Code2, Video, LineChart, Briefcase } from "lucide-react";

const features = [
  {
    title: "Practice Problems",
    description: "Work through curated coding questions by difficulty and topic.",
    icon: Code2,
  },
  {
    title: "Mock Interviews",
    description: "Simulate real interview rounds with structured question sets.",
    icon: Video,
  },
  {
    title: "Track Progress",
    description: "See trends, strengths, and gaps across your preparation.",
    icon: LineChart,
  },
  {
    title: "Job Tracker",
    description: "60 Indian tech jobs, match score, saved jobs, and daily digest.",
    icon: Briefcase,
  },
];

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">JT</span>
          </div>
          <span className="text-sm font-medium text-slate-100">
            Job Notification Tracker
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center px-6">
        <section className="max-w-5xl mx-auto w-full grid gap-16 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-50">
              Placement Ready & Job Tracking
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-300 max-w-xl">
              Practice, assess, and track 60 Indian tech jobs in one app. Set
              preferences, get match scores, save jobs, and generate a daily digest.
            </p>
            <div className="mt-8 flex items-center gap-4 flex-wrap">
              <button
                onClick={() => navigate("/app/dashboard")}
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
              >
                Get Started (Placement)
              </button>
              <button
                onClick={() => navigate("/app/jobs")}
                className="inline-flex items-center justify-center rounded-md border border-slate-600 bg-slate-800/60 px-6 py-3 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Track Jobs
              </button>
              <span className="text-xs md:text-sm text-slate-400">
                No sign-up. All data stays in your browser.
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 md:p-8 shadow-[0_0_0_1px_rgba(15,23,42,0.4)]">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Snapshot
            </div>
            <div className="mt-3 text-sm text-slate-200">
              Placement readiness dashboard and job tracker in one place.
            </div>
            <div className="mt-6 space-y-4 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Placement</span>
                <span className="text-slate-100">Dashboard, Assessments, Results</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Jobs</span>
                <span className="text-slate-100">60 jobs, match score, digest</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 max-w-5xl mx-auto w-full">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-6"
                >
                  <div className="w-9 h-9 rounded-md bg-primary/15 flex items-center justify-center mb-4">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-50">
                    {feature.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-slate-500">
          © {new Date().getFullYear()} Job Notification Tracker. Placement &
          Jobs. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
