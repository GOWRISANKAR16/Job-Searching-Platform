import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ResumeProvider } from "./context/ResumeContext";

// Lazy-loaded layouts and pages for better mobile performance
const ResumeLayout = lazy(() => import("./layouts/ResumeLayout"));
const ResumeHomePage = lazy(() => import("./pages/resume/ResumeHomePage"));
const BuilderPage = lazy(() => import("./pages/resume/BuilderPage"));
const PreviewPage = lazy(() => import("./pages/resume/PreviewPage"));
const ResumeProofPage = lazy(() => import("./pages/resume/ResumeProofPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const PracticePage = lazy(() => import("./pages/PracticePage"));
const AssessmentsPage = lazy(() => import("./pages/AssessmentsPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const ResultsPage = lazy(() => import("./pages/ResultsPage"));
const JobsDashboardPage = lazy(() => import("./pages/jobs/JobsDashboardPage"));
const JobsSavedPage = lazy(() => import("./pages/jobs/JobsSavedPage"));
const JobsDigestPage = lazy(() => import("./pages/jobs/JobsDigestPage"));
const JobsSettingsPage = lazy(() => import("./pages/jobs/JobsSettingsPage"));
const TestChecklistPage = lazy(() => import("./pages/TestChecklistPage"));
const ShipPage = lazy(() => import("./pages/ShipPage"));
const JtTestChecklistPage = lazy(() => import("./pages/JtTestChecklistPage"));
const JtShipPage = lazy(() => import("./pages/JtShipPage"));

function App() {
  return (
    <ResumeProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
            Loading…
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<ResumeLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="builder" element={<BuilderPage />} />
            <Route path="preview" element={<PreviewPage />} />
            <Route path="proof" element={<ResumeProofPage />} />
          </Route>
          <Route path="/placement" element={<LandingPage />} />
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="practice" element={<PracticePage />} />
            <Route path="assessments" element={<AssessmentsPage />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="jobs" element={<JobsDashboardPage />} />
            <Route path="jobs/saved" element={<JobsSavedPage />} />
            <Route path="jobs/digest" element={<JobsDigestPage />} />
            <Route path="jobs/settings" element={<JobsSettingsPage />} />
          </Route>
          <Route path="/prp/07-test" element={<TestChecklistPage />} />
          <Route path="/prp/08-ship" element={<ShipPage />} />
          <Route path="/jt/07-test" element={<JtTestChecklistPage />} />
          <Route path="/jt/08-ship" element={<JtShipPage />} />
          <Route path="/rb/*" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </Suspense>
    </ResumeProvider>
  );
}

export default App;
