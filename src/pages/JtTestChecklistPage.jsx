import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import {
  loadJtTestStatus,
  saveJtTestStatus,
  JT_TEST_ITEMS,
} from "../lib/jobTrackerTestChecklist";

export default function JtTestChecklistPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState(() =>
    JT_TEST_ITEMS.map((t, i) => ({ ...t, checked: false }))
  );
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    const loaded = loadJtTestStatus();
    setTests(loaded);
    setCompleted(loaded.filter((t) => t.checked).length);
  }, []);

  const updateTests = (nextTests) => {
    const count = nextTests.filter((t) => t.checked).length;
    setTests(nextTests);
    setCompleted(count);
    saveJtTestStatus(nextTests);
  };

  const handleToggle = (id) => {
    const next = tests.map((t) =>
      t.id === id ? { ...t, checked: !t.checked } : t
    );
    updateTests(next);
  };

  const handleReset = () => {
    const reset = tests.map((t) => ({ ...t, checked: false }));
    updateTests(reset);
  };

  const handleCheckAll = () => {
    updateTests(tests.map((t) => ({ ...t, checked: true })));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <main className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-50">
              Job Tracker — Test Checklist
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Internal checklist to validate the Job Notification Tracker before shipping.
              Results are stored locally on this device.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Tests Passed: {completed} / 10</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-200">
              {completed < 10 && (
                <p className="text-amber-500">Fix issues before shipping.</p>
              )}
              {completed === 10 && (
                <p className="text-emerald-400">
                  All tests are marked as passed on this device.
                </p>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCheckAll}
                  className="inline-flex items-center justify-center rounded-md bg-primary/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary transition-colors"
                >
                  Check all
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Reset checklist
                </button>
              </div>
              <button
                type="button"
                onClick={() => navigate("/jt/08-ship")}
                className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 transition-colors"
              >
                Go to ship view
              </button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test cases</CardTitle>
              <CardDescription>
                Mark each item once you&apos;ve manually verified the behavior.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-200">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5"
                >
                  <input
                    id={test.id}
                    type="checkbox"
                    checked={!!test.checked}
                    onChange={() => handleToggle(test.id)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary"
                  />
                  <div>
                    <label
                      htmlFor={test.id}
                      className="text-sm font-medium text-slate-50 cursor-pointer"
                    >
                      {test.label}
                    </label>
                    {test.tooltip && (
                      <p className="mt-1 text-xs text-slate-400">{test.tooltip}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
