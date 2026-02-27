import { useState, useEffect } from "react";
import {
  getPreferencesRaw,
  savePreferencesRaw,
} from "../../lib/jobsStorage";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";

const LOCATIONS = ["Bangalore", "Hyderabad", "Chennai", "Pune", "Mumbai", "Noida", "Gurgaon"];

export default function JobsSettingsPage() {
  const [roleKeywords, setRoleKeywords] = useState("");
  const [preferredLocations, setPreferredLocations] = useState([]);
  const [preferredMode, setPreferredMode] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [skills, setSkills] = useState("");
  const [minMatchScore, setMinMatchScore] = useState(40);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = getPreferencesRaw();
    if (raw) {
      setRoleKeywords(Array.isArray(raw.roleKeywords) ? raw.roleKeywords.join(", ") : raw.roleKeywords || "");
      setPreferredLocations(Array.isArray(raw.preferredLocations) ? raw.preferredLocations : []);
      setPreferredMode(Array.isArray(raw.preferredMode) ? raw.preferredMode : []);
      setExperienceLevel(raw.experienceLevel || "");
      setSkills(Array.isArray(raw.skills) ? raw.skills.join(", ") : raw.skills || "");
      const min = typeof raw.minMatchScore === "number" ? raw.minMatchScore : 40;
      setMinMatchScore(Math.max(0, Math.min(100, min)));
    }
  }, []);

  const handleLocationToggle = (loc) => {
    setPreferredLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  const handleModeToggle = (mode) => {
    setPreferredMode((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const handleSave = () => {
    const prefs = {
      roleKeywords: roleKeywords.trim() ? roleKeywords.trim().split(/\s*,\s*/).map((s) => s.trim()) : [],
      preferredLocations,
      preferredMode,
      experienceLevel,
      skills: skills.trim() ? skills.trim().split(/\s*,\s*/).map((s) => s.trim()) : [],
      minMatchScore: Math.max(0, Math.min(100, minMatchScore)),
    };
    savePreferencesRaw(prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50">Job preferences</h1>
        <p className="text-sm text-slate-300">
          Set your preferences to activate match scoring. Stored in this browser only.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Role keywords, locations, mode, experience, skills, and minimum match threshold.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Role keywords (comma-separated)</label>
            <input
              type="text"
              value={roleKeywords}
              onChange={(e) => setRoleKeywords(e.target.value)}
              placeholder="e.g. SDE, Backend, Java"
              className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Preferred locations</label>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((loc) => (
                <label key={loc} className="flex items-center gap-1.5 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={preferredLocations.includes(loc)}
                    onChange={() => handleLocationToggle(loc)}
                    className="rounded border-slate-700"
                  />
                  {loc}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Mode</label>
            <div className="flex gap-4">
              {["Remote", "Hybrid", "Onsite"].map((mode) => (
                <label key={mode} className="flex items-center gap-1.5 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={preferredMode.includes(mode)}
                    onChange={() => handleModeToggle(mode)}
                    className="rounded border-slate-700"
                  />
                  {mode}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Experience level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">Any</option>
              <option value="Fresher">Fresher</option>
              <option value="0-1">0-1</option>
              <option value="1-3">1-3</option>
              <option value="3-5">3-5</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Skills (comma-separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, TypeScript, SQL"
              className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Minimum match score: {minMatchScore}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            {saved ? "Saved" : "Save preferences"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
