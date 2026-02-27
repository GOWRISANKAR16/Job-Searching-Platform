import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { loadHistory } from "../lib/analysis";

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

function HistoryPage() {
  const navigate = useNavigate();
  const { entries, skippedCount } = useMemo(() => loadHistory(), []);

  const hasEntries = entries && entries.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-50">Analysis History</h1>
        <p className="text-sm text-slate-300 max-w-2xl">
          Your recent JD analyses on this device. Selecting a row opens the
          detailed results view.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Saved runs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {skippedCount > 0 && (
            <p className="text-sm text-amber-600/90">
              One saved entry couldn&apos;t be loaded. Create a new analysis.
            </p>
          )}
          {!hasEntries && (
            <div className="text-sm text-slate-400">
              No analyses saved yet. Run your first JD analysis from the
              Assessments section.
            </div>
          )}
          {hasEntries && (
            <div className="divide-y divide-slate-800">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => navigate(`/app/results?id=${entry.id}`)}
                  className="w-full text-left px-2 py-3 hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-slate-50">
                        {entry.company || "Unknown company"} –{" "}
                        <span className="text-slate-300">
                          {entry.role || "Role not specified"}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        {formatDate(entry.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Readiness</div>
                      <div className="text-base font-semibold text-primary">
                        {entry.finalScore ?? entry.baseScore ?? 0}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default HistoryPage;

