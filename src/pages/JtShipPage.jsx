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
import { getJtTestPassedCount } from "../lib/jobTrackerTestChecklist";

export default function JtShipPage() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    setCompleted(getJtTestPassedCount());
  }, []);

  const allPassed = completed === 10;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <main className="flex-1 px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-50">
              Ship Job Notification Tracker
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Final gate before shipping. This view is locked until the test
              checklist is fully passed on this device.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Test status</CardTitle>
              <CardDescription>Tests Passed: {completed} / 10</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-200">
              {!allPassed && (
                <p className="text-amber-500">
                  Shipping is locked until all 10 checklist items are marked as
                  passed. Review the test checklist before proceeding.
                </p>
              )}
              {allPassed && (
                <p className="text-emerald-400">
                  All checklist items are marked as passed on this device. You
                  can proceed with your chosen deployment process.
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <button
                type="button"
                onClick={() => navigate("/jt/07-test")}
                className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Open test checklist
              </button>
              <button
                type="button"
                disabled={!allPassed}
                className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                Ship (external process)
              </button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
