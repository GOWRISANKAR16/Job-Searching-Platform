function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50">Profile</h1>
        <p className="mt-2 text-sm text-slate-300">
          Placeholder for candidate details, target roles, and preferences.
        </p>
      </header>
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-6 text-sm text-slate-300">
        Capture the essentials for your placement journey: graduation details,
        preferred domains, and companies you are preparing for.
      </div>
    </div>
  );
}

export default ProfilePage;

