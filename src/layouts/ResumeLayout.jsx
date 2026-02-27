import { NavLink, Outlet } from "react-router-dom";
import { Home } from "lucide-react";

const navClass = ({ isActive }) =>
  [
    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
    isActive
      ? "bg-primary/15 text-primary"
      : "text-slate-300 hover:bg-slate-800 hover:text-slate-50",
  ].join(" ");

export default function ResumeLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="no-print border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <NavLink
                to="/app/dashboard"
                className="inline-flex items-center gap-2 text-base font-semibold text-slate-50 tracking-tight hover:text-white rounded-md px-2 py-1.5 -ml-2"
                title="Home"
              >
                <Home className="w-5 h-5 text-slate-400" />
                <span>Home</span>
              </NavLink>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400 text-sm font-medium">Resume</span>
            </div>
            <nav className="flex items-center gap-1">
              <NavLink to="/builder" className={navClass}>
                Builder
              </NavLink>
              <NavLink to="/preview" className={navClass}>
                Preview
              </NavLink>
              <NavLink to="/proof" className={navClass}>
                Proof
              </NavLink>
              <NavLink to="/app/dashboard" className="px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-50 rounded-md transition-colors">
                Dashboard
              </NavLink>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-slate-950">
        <Outlet />
      </main>
    </div>
  );
}
