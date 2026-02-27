import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Code2,
  ClipboardList,
  BookOpen,
  User,
  Briefcase,
  Bookmark,
  Mail,
  Settings,
  History,
  BarChart2,
  FileText,
  Home,
  Menu,
  X,
} from "lucide-react";

const placementNav = [
  { to: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/builder", label: "Resume", icon: FileText },
  { to: "practice", label: "Practice", icon: Code2 },
  { to: "assessments", label: "Assessments", icon: ClipboardList },
  { to: "resources", label: "Resources", icon: BookOpen },
  { to: "profile", label: "Profile", icon: User },
  { to: "history", label: "History", icon: History },
  { to: "results", label: "Results", icon: BarChart2 },
];

const jobsNav = [
  { to: "jobs", label: "Jobs", icon: Briefcase },
  { to: "jobs/saved", label: "Saved", icon: Bookmark },
  { to: "jobs/digest", label: "Digest", icon: Mail },
  { to: "jobs/settings", label: "Job settings", icon: Settings },
];

const navClass = ({ isActive }) =>
  [
    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
    isActive
      ? "bg-primary/15 text-primary"
      : "text-slate-300 hover:bg-slate-800 hover:text-slate-50",
  ].join(" ");

function DashboardLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/app/dashboard" || location.pathname === "/app";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex overflow-x-hidden">
      {/* Mobile sidebar (drawer) */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsSidebarOpen(false)}
        />
        <aside className="relative w-64 max-w-[80vw] h-full border-r border-slate-800 bg-slate-950/95 backdrop-blur shrink-0">
          <div className="px-4 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-0.5">
                Placement & Jobs
              </div>
              <div className="text-base font-semibold text-slate-50">
                Job Notification Tracker
              </div>
            </div>
            <button
              type="button"
              className="p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="px-3 py-4 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 px-3 mb-2">
              Placement
            </div>
            {placementNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={navClass}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <div className="text-[11px] uppercase tracking-wider text-slate-500 px-3 mt-4 mb-2">
              Jobs
            </div>
            {jobsNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={navClass}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur shrink-0">
        <div className="px-6 py-6 border-b border-slate-800">
          {isHomePage ? (
            <div className="flex items-center gap-2">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-0.5">
                  Placement & Jobs
                </div>
                <div className="text-lg font-semibold text-slate-50">
                  Job Notification Tracker
                </div>
              </div>
            </div>
          ) : (
            <NavLink
              to="/app/dashboard"
              className="flex items-center gap-2 group"
              title="Home"
            >
              <Home className="w-5 h-5 text-slate-500 group-hover:text-primary" />
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-0.5 group-hover:text-slate-300">
                  Placement & Jobs
                </div>
                <div className="text-lg font-semibold text-slate-50 group-hover:text-white">
                  Job Notification Tracker
                </div>
              </div>
            </NavLink>
          )}
        </div>
        <nav className="px-3 py-4 space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 px-3 mb-2">
            Placement
          </div>
          {placementNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={navClass}>
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <div className="text-[11px] uppercase tracking-wider text-slate-500 px-3 mt-4 mb-2">
            Jobs
          </div>
          {jobsNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={navClass}>
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 bg-slate-950/80 backdrop-blur shrink-0">
          {isHomePage ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Placement Prep & Job Tracker
                </div>
                <div className="text-sm text-slate-200">
                  Daily practice. Track jobs. One app.
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
              <NavLink to="/app/dashboard" className="flex items-center gap-2 hover:opacity-90" title="Home">
                <Home className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Placement Prep & Job Tracker
                  </div>
                  <div className="text-sm text-slate-200">
                    Daily practice. Track jobs. One app.
                  </div>
                </div>
              </NavLink>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-50">Candidate</div>
              <div className="text-xs text-slate-400">Ready to practice</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-sm font-semibold">
              JT
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 bg-slate-950 overflow-auto transition-opacity duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
