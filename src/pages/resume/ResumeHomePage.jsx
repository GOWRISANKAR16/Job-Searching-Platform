import { useNavigate } from "react-router-dom";

export default function ResumeHomePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-3xl sm:text-4xl font-semibold text-slate-50 tracking-tight">
        Build a Resume That Gets Read.
      </h1>
      <p className="mt-4 text-slate-300 text-lg">
        Create a clear, structured resume. Fill in your details, see a live preview, and keep everything in one place.
      </p>
      <div className="mt-8">
        <button
          type="button"
          onClick={() => navigate("/builder")}
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-colors"
        >
          Start Building
        </button>
      </div>
    </div>
  );
}
