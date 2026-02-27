import { useState } from "react";
import { useResume, TEMPLATES, THEME_COLORS } from "../../context/ResumeContext";
import { TemplatePicker, ColorThemePicker } from "../../components/resume/TemplatePicker";
import { computeAtsScore, getAtsBand } from "../../lib/atsScore";
import { getBulletLinesWithSuggestions } from "../../lib/bulletGuidance";

function Field({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-400 mb-1">
        {label}
      </label>
      <input
        id={id}
        className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        {...props}
      />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="border-b border-slate-800 pb-6 mb-6 last:border-0 last:mb-0">
      <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function TemplateTabs({ value, onChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-lg border border-slate-700 bg-slate-800/80 inline-flex">
      {TEMPLATES.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            value === t
              ? "bg-slate-600 text-slate-50 border border-slate-500"
              : "text-slate-400 hover:text-slate-100"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function BulletGuidance({ block }) {
  const items = getBulletLinesWithSuggestions(block);
  if (items.length === 0) return null;
  const withTips = items.filter((i) => i.suggestions.length > 0);
  if (withTips.length === 0) return null;
  return (
    <div className="mt-1.5 space-y-1">
      {withTips.map(({ index, suggestions }) => (
        <p key={index} className="text-[11px] text-amber-700/90">
          Bullet {index}: {suggestions.join(" ")}
        </p>
      ))}
    </div>
  );
}

const SKILL_CATEGORIES = [
  { key: "technical", label: "Technical Skills" },
  { key: "soft", label: "Soft Skills" },
  { key: "tools", label: "Tools & Technologies" },
];

function SkillTagInput({ items, onAdd, onRemove, placeholder }) {
  const [value, setValue] = useState("");
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const v = value.trim();
      if (v) {
        onAdd(v);
        setValue("");
      }
    }
  };
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {items.map((skill, i) => (
        <span
          key={`${skill}-${i}`}
          className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-800"
        >
          {skill}
          <button type="button" onClick={() => onRemove(i)} className="hover:text-slate-300 leading-none" aria-label="Remove">
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 min-w-[120px] rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

function ProjectTechStack({ index, techStack, updateProject }) {
  const [value, setValue] = useState("");
  const list = Array.isArray(techStack) ? techStack : [];
  const handleAdd = (v) => {
    const t = (v || "").trim();
    if (!t || list.includes(t)) return;
    updateProject(index, "techStack", [...list, t]);
    setValue("");
  };
  const handleRemove = (i) => {
    updateProject(index, "techStack", list.filter((_, j) => j !== i));
  };
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {list.map((skill, i) => (
        <span
          key={`${skill}-${i}`}
          className="inline-flex items-center gap-1 rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-200"
        >
          {skill}
          <button type="button" onClick={() => handleRemove(i)} className="hover:text-slate-300 leading-none" aria-label="Remove">
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(value); } }}
        placeholder="Type and press Enter"
        className="flex-1 min-w-[100px] rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

function ProjectsAccordion({ projects, updateProject, removeProject }) {
  const [openIndex, setOpenIndex] = useState(0);
  if (!projects.length) return null;
  return (
    <div className="space-y-2">
      {projects.map((entry, index) => {
        const title = (entry.name || "").trim() || "Untitled Project";
        const isOpen = openIndex === index;
        return (
          <div key={entry.id} className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-100 hover:bg-slate-800/80"
            >
              <span className="truncate">{title}</span>
              <span className="text-slate-400 shrink-0 ml-2">{isOpen ? "▼" : "▶"}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-0 border-t border-slate-700 space-y-3">
                <Field
                  label="Project Title"
                  value={entry.name}
                  onChange={(e) => updateProject(index, "name", e.target.value)}
                  placeholder="Project name"
                />
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Description <span className="text-slate-400">{(entry.description || "").length}/200</span>
                  </label>
                  <textarea
                    value={entry.description || ""}
                    onChange={(e) => updateProject(index, "description", e.target.value.slice(0, 200))}
                    placeholder="Brief description."
                    maxLength={200}
                    rows={2}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                  />
                  <BulletGuidance block={entry.description} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Tech Stack</label>
                  <ProjectTechStack index={index} techStack={entry.techStack || []} updateProject={updateProject} />
                </div>
                <Field
                  label="Live URL (optional)"
                  value={entry.liveUrl || ""}
                  onChange={(e) => updateProject(index, "liveUrl", e.target.value)}
                  placeholder="https://..."
                />
                <Field
                  label="GitHub URL (optional)"
                  value={entry.githubUrl || ""}
                  onChange={(e) => updateProject(index, "githubUrl", e.target.value)}
                  placeholder="https://github.com/..."
                />
                <button
                  type="button"
                  onClick={() => removeProject(index)}
                  className="text-xs text-slate-400 hover:text-red-400"
                >
                  Delete project
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function BuilderPage() {
  const {
    resume,
    template,
    setTemplate,
    themeColor,
    setThemeColor,
    updatePersonal,
    updateSummary,
    education,
    addEducation,
    removeEducation,
    updateEducation,
    experience,
    addExperience,
    removeExperience,
    updateExperience,
    projects,
    addProject,
    removeProject,
    updateProject,
    addSkillToCategory,
    removeSkillFromCategory,
    suggestSkills,
    updateSkills,
    updateLink,
    loadSampleData,
  } = useResume();

  const { personalInfo, summary, skills, links } = resume;
  const skillsObj = skills && typeof skills === "object" ? skills : { technical: [], soft: [], tools: [] };
  const [suggestSkillsLoading, setSuggestSkillsLoading] = useState(false);

  const handleSuggestSkills = () => {
    setSuggestSkillsLoading(true);
    suggestSkills();
    setTimeout(() => setSuggestSkillsLoading(false), 1000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 bg-slate-950">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Form */}
        <div className="w-full lg:w-[55%] max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-semibold text-slate-50">Resume details</h1>
            <button
              type="button"
              onClick={loadSampleData}
              className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
            >
              Load Sample Data
            </button>
          </div>

          <Section title="Personal info">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Name"
                id="name"
                value={personalInfo.name}
                onChange={(e) => updatePersonal("name", e.target.value)}
                placeholder="Full name"
              />
              <Field
                label="Email"
                id="email"
                type="email"
                value={personalInfo.email}
                onChange={(e) => updatePersonal("email", e.target.value)}
                placeholder="you@example.com"
              />
              <Field
                label="Phone"
                id="phone"
                value={personalInfo.phone}
                onChange={(e) => updatePersonal("phone", e.target.value)}
                placeholder="+1 234 567 8900"
              />
              <Field
                label="Location"
                id="location"
                value={personalInfo.location}
                onChange={(e) => updatePersonal("location", e.target.value)}
                placeholder="City, Country"
              />
            </div>
          </Section>

          <Section title="Summary">
            <div>
              <label htmlFor="summary" className="block text-xs font-medium text-slate-400 mb-1">
                Professional summary
              </label>
              <textarea
                id="summary"
                value={summary}
                onChange={(e) => updateSummary(e.target.value)}
                placeholder="2–3 sentences about your experience and focus."
                rows={4}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y"
              />
            </div>
          </Section>

          <Section title="Education">
            {education.map((entry, index) => (
              <div key={entry.id} className="mb-4 p-4 rounded-lg border border-slate-800 bg-slate-900/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field
                    label="Institution"
                    value={entry.institution}
                    onChange={(e) => updateEducation(index, "institution", e.target.value)}
                    placeholder="University name"
                  />
                  <Field
                    label="Degree"
                    value={entry.degree}
                    onChange={(e) => updateEducation(index, "degree", e.target.value)}
                    placeholder="B.S. Computer Science"
                  />
                  <Field
                    label="Dates"
                    value={entry.dates}
                    onChange={(e) => updateEducation(index, "dates", e.target.value)}
                    placeholder="2016 – 2020"
                  />
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Details</label>
                  <textarea
                    value={entry.details}
                    onChange={(e) => updateEducation(index, "details", e.target.value)}
                    placeholder="Relevant coursework, achievements."
                    rows={2}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="mt-2 text-xs text-slate-400 hover:text-slate-300"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addEducation}
              className="rounded-md border border-dashed border-slate-600 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800"
            >
              + Add education
            </button>
          </Section>

          <Section title="Experience">
            {experience.map((entry, index) => (
              <div key={entry.id} className="mb-4 p-4 rounded-lg border border-slate-800 bg-slate-900/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field
                    label="Company"
                    value={entry.company}
                    onChange={(e) => updateExperience(index, "company", e.target.value)}
                    placeholder="Company name"
                  />
                  <Field
                    label="Role"
                    value={entry.role}
                    onChange={(e) => updateExperience(index, "role", e.target.value)}
                    placeholder="Job title"
                  />
                  <Field
                    label="Dates"
                    value={entry.dates}
                    onChange={(e) => updateExperience(index, "dates", e.target.value)}
                    placeholder="2020 – 2022"
                  />
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Details</label>
                  <textarea
                    value={entry.details}
                    onChange={(e) => updateExperience(index, "details", e.target.value)}
                    placeholder="Key responsibilities and achievements."
                    rows={3}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                  />
                  <BulletGuidance block={entry.details} />
                </div>
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="mt-2 text-xs text-slate-400 hover:text-slate-300"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addExperience}
              className="rounded-md border border-dashed border-slate-600 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800"
            >
              + Add experience
            </button>
          </Section>

          <Section title="Projects">
            <ProjectsAccordion projects={projects} updateProject={updateProject} removeProject={removeProject} />
            <button
              type="button"
              onClick={addProject}
              className="mt-3 rounded-md border border-dashed border-slate-600 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800"
            >
              + Add project
            </button>
          </Section>

          <Section title="Skills">
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleSuggestSkills}
                disabled={suggestSkillsLoading}
                className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-60"
              >
                {suggestSkillsLoading ? "Adding…" : "✨ Suggest Skills"}
              </button>
              {SKILL_CATEGORIES.map(({ key, label }) => {
                const items = skillsObj[key] || [];
                return (
                  <div key={key}>
                    <h3 className="text-xs font-medium text-slate-300 mb-2">
                      {label} ({items.length})
                    </h3>
                    <SkillTagInput
                      items={items}
                      onAdd={(skill) => addSkillToCategory(key, skill)}
                      onRemove={(i) => removeSkillFromCategory(key, i)}
                      placeholder="Type skill and press Enter"
                    />
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="Links">
            <div className="space-y-3">
              <Field
                label="GitHub"
                value={links.github}
                onChange={(e) => updateLink("github", e.target.value)}
                placeholder="https://github.com/..."
              />
              <Field
                label="LinkedIn"
                value={links.linkedin}
                onChange={(e) => updateLink("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </Section>
        </div>

        {/* Right: ATS score + Live preview */}
        <div className="w-full lg:w-[45%] shrink-0 mt-8 lg:mt-0">
          <div className="sticky top-8 space-y-4">
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Template</div>
              <TemplatePicker
                value={template}
                onChange={setTemplate}
                accentHsl={THEME_COLORS.find((c) => c.id === themeColor)?.hsl || "hsl(168, 60%, 40%)"}
              />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Color theme</div>
              <ColorThemePicker value={themeColor} onChange={setThemeColor} />
            </div>
            {/* ATS Score v1 */}
            <AtsScoreBlock resume={resume} />
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Live preview
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-100 p-6 min-h-[420px] shadow-inner">
              <LivePreview
                resume={resume}
                template={template}
                accentHsl={THEME_COLORS.find((c) => c.id === themeColor)?.hsl || "hsl(168, 60%, 40%)"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AtsScoreBlock({ resume }) {
  const { score, suggestions } = computeAtsScore(resume);
  const band = getAtsBand(score);
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4">
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
        ATS Resume Score
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-semibold text-white tabular-nums">{score}</span>
        <span className="text-sm text-slate-500">/ 100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${score}%`,
            backgroundColor:
              band.color === "red" ? "rgb(239, 68, 68)" : band.color === "amber" ? "rgb(245, 158, 11)" : "rgb(34, 197, 94)",
          }}
        />
      </div>
      <p className="mt-1.5 text-xs font-medium" style={{ color: band.color === "red" ? "rgb(248, 113, 113)" : band.color === "amber" ? "rgb(252, 211, 77)" : "rgb(134, 239, 172)" }}>
        {band.label}
      </p>
      {suggestions.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
          {suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-slate-400 mt-0.5">·</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LivePreview({ resume, template = "Classic", accentHsl = "hsl(168, 60%, 40%)" }) {
  const { personalInfo, summary, education, experience, projects, skills, links } = resume;
  const skillsObj = skills && typeof skills === "object" ? skills : { technical: [], soft: [], tools: [] };
  const hasSummary = (summary || "").trim() !== "";
  const hasEducation = Array.isArray(education) && education.length > 0;
  const hasExperience = Array.isArray(experience) && experience.length > 0;
  const hasProjects = Array.isArray(projects) && projects.length > 0;
  const hasSkills =
    (skillsObj.technical?.length || 0) + (skillsObj.soft?.length || 0) + (skillsObj.tools?.length || 0) > 0;
  const hasLinks = ((links?.github || "").trim() || (links?.linkedin || "").trim()) !== "";

  const PREVIEW_SKILL_LABELS = [
    { key: "technical", label: "Technical Skills" },
    { key: "soft", label: "Soft Skills" },
    { key: "tools", label: "Tools & Technologies" },
  ];

  const accentStyle = { color: accentHsl };
  const borderAccentStyle = { borderColor: accentHsl };
  const bgAccentStyle = { backgroundColor: accentHsl };

  const SectionHeading = ({ children }) => (
    <h3
      className="text-[11px] font-semibold uppercase tracking-widest mb-1"
      style={accentStyle}
    >
      {children}
    </h3>
  );

  if (template === "Modern") {
    return (
      <div
        className="text-sm leading-relaxed flex min-h-[380px]"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        <aside
          className="w-[32%] shrink-0 flex flex-col text-white p-3"
          style={bgAccentStyle}
        >
          <div className="font-semibold text-sm tracking-tight">
            {personalInfo?.name || "Your name"}
          </div>
          <div className="text-[10px] text-white/90 mt-1 space-y-0.5">
            {personalInfo?.email && <div>{personalInfo.email}</div>}
            {personalInfo?.phone && <div>{personalInfo.phone}</div>}
            {personalInfo?.location && <div>{personalInfo.location}</div>}
          </div>
          {hasSkills && (
            <div className="mt-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider opacity-95 mb-1">Skills</div>
              <div className="flex flex-wrap gap-1">
                {[...(skillsObj.technical || []), ...(skillsObj.soft || []), ...(skillsObj.tools || [])].map((s, i) => (
                  <span key={i} className="inline-flex rounded-full bg-white/20 px-1.5 py-0.5 text-[9px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
        <div className="flex-1 pl-4 text-slate-800 space-y-3">
          {hasSummary && (
            <section>
              <SectionHeading>Summary</SectionHeading>
              <p className="text-slate-700 text-xs leading-snug">{summary}</p>
            </section>
          )}
          {hasEducation && (
            <section>
              <SectionHeading>Education</SectionHeading>
              {education.map((e) => (
                <div key={e.id} className="mb-1.5">
                  <span className="font-medium text-slate-900 text-xs">{e.institution || "Institution"}</span>
                  {e.degree && <span className="text-slate-700 text-xs"> — {e.degree}</span>}
                  {e.dates && <span className="text-slate-500 text-[10px]"> ({e.dates})</span>}
                  {e.details && <p className="text-slate-600 text-[10px] mt-0.5">{e.details}</p>}
                </div>
              ))}
            </section>
          )}
          {hasExperience && (
            <section>
              <SectionHeading>Experience</SectionHeading>
              {experience.map((ex) => (
                <div key={ex.id} className="mb-1.5">
                  <span className="font-medium text-slate-900 text-xs">{ex.role || "Role"}</span>
                  {ex.company && <span className="text-slate-700 text-xs"> at {ex.company}</span>}
                  {ex.dates && <span className="text-slate-500 text-[10px]"> ({ex.dates})</span>}
                  {ex.details && <p className="text-slate-600 text-[10px] mt-0.5 whitespace-pre-line">{ex.details}</p>}
                </div>
              ))}
            </section>
          )}
          {hasProjects && (
            <section>
              <SectionHeading>Projects</SectionHeading>
              {projects.map((p) => (
                <div key={p.id} className="mb-2">
                  <div className="font-medium text-slate-900 text-xs">{p.name || "Project"}</div>
                  {p.description && <p className="text-slate-600 text-[10px] mt-0.5">{p.description}</p>}
                  {Array.isArray(p.techStack) && p.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.techStack.map((t, i) => (
                        <span key={i} className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] text-slate-700">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
          {hasLinks && (
            <section>
              <SectionHeading>Links</SectionHeading>
              <p className="text-slate-600 text-[10px]">{[links?.github, links?.linkedin].filter(Boolean).join(" · ")}</p>
            </section>
          )}
          {!hasSummary && !hasEducation && !hasExperience && !hasProjects && !hasLinks && (
            <p className="text-slate-400 italic text-xs">Add content to see it here.</p>
          )}
        </div>
      </div>
    );
  }

  const isMinimal = template === "Minimal";
  const headerBorder = isMinimal ? undefined : borderAccentStyle;

  return (
    <div
      className={`text-sm leading-relaxed ${isMinimal ? "space-y-6" : ""}`}
      style={{
        fontFamily: isMinimal ? "system-ui, -apple-system, sans-serif" : "Georgia, 'Times New Roman', serif",
      }}
    >
      <header
        className={isMinimal ? "pb-2 mb-4" : "border-b pb-2 mb-4"}
        style={headerBorder}
      >
        <h2 className="text-base font-semibold text-slate-900 tracking-tight" style={isMinimal ? accentStyle : undefined}>
          {personalInfo?.name || "Your name"}
        </h2>
        <div className="text-xs text-slate-500 mt-0.5 space-x-2">
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && <span>·</span>}
          {personalInfo?.phone && <span>{personalInfo.phone}</span>}
          {personalInfo?.location && <span>·</span>}
          {personalInfo?.location && <span>{personalInfo.location}</span>}
        </div>
      </header>

      {hasSummary && (
        <section className={isMinimal ? "" : "mb-4 border-b pb-4"} style={!isMinimal ? borderAccentStyle : undefined}>
          <SectionHeading>Summary</SectionHeading>
          <p className="text-slate-700 leading-snug">{summary}</p>
        </section>
      )}

      {hasEducation && (
        <section className={isMinimal ? "" : "mb-4 border-b pb-4"} style={!isMinimal ? borderAccentStyle : undefined}>
          <SectionHeading>Education</SectionHeading>
          {education.map((e) => (
            <div key={e.id} className="mb-2">
              <span className="font-medium text-slate-900">{e.institution || "Institution"}</span>
              {e.degree && <span className="text-slate-700"> — {e.degree}</span>}
              {e.dates && <span className="text-slate-500 text-xs"> ({e.dates})</span>}
              {e.details && <p className="text-slate-600 text-xs mt-0.5">{e.details}</p>}
            </div>
          ))}
        </section>
      )}

      {hasExperience && (
        <section className={isMinimal ? "" : "mb-4 border-b pb-4"} style={!isMinimal ? borderAccentStyle : undefined}>
          <SectionHeading>Experience</SectionHeading>
          {experience.map((ex) => (
            <div key={ex.id} className="mb-2">
              <span className="font-medium text-slate-900">{ex.role || "Role"}</span>
              {ex.company && <span className="text-slate-700"> at {ex.company}</span>}
              {ex.dates && <span className="text-slate-500 text-xs"> ({ex.dates})</span>}
              {ex.details && <p className="text-slate-600 text-xs mt-0.5 whitespace-pre-line">{ex.details}</p>}
            </div>
          ))}
        </section>
      )}

      {hasProjects && (
        <section className={isMinimal ? "" : "mb-4 border-b pb-4"} style={!isMinimal ? borderAccentStyle : undefined}>
          <SectionHeading>Projects</SectionHeading>
          {projects.map((p) => (
            <div key={p.id} className="mb-3 p-3 rounded-lg border border-slate-200 bg-slate-50/30">
              <div className="font-medium text-slate-900">{p.name || "Project"}</div>
              {p.description && <p className="text-slate-600 text-xs mt-0.5 leading-snug">{p.description}</p>}
              {Array.isArray(p.techStack) && p.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.techStack.map((t, i) => (
                    <span key={i} className="inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {(p.liveUrl || p.githubUrl) && (
                <div className="flex flex-wrap gap-2 mt-2 text-[10px]">
                  {p.liveUrl && (
                    <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
                      <span aria-hidden>↗</span> Live
                    </a>
                  )}
                  {p.githubUrl && (
                    <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
                      <span aria-hidden>⌘</span> GitHub
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {hasSkills && (
        <section className={isMinimal ? "" : "mb-4 border-b pb-4"} style={!isMinimal ? borderAccentStyle : undefined}>
          <SectionHeading>Skills</SectionHeading>
          <div className="space-y-2">
            {PREVIEW_SKILL_LABELS.map(({ key, label }) => {
              const items = (skillsObj && skillsObj[key]) || [];
              if (items.length === 0) return null;
              return (
                <div key={key}>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {items.map((s, i) => (
                      <span key={i} className="inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {hasLinks && (
        <section>
          <SectionHeading>Links</SectionHeading>
          <p className="text-slate-600 text-xs">{[links?.github, links?.linkedin].filter(Boolean).join(" · ")}</p>
        </section>
      )}

      {!personalInfo?.name && !hasSummary && !hasEducation && !hasExperience && !hasProjects && !hasSkills && !hasLinks && (
        <p className="text-slate-400 italic text-sm">Your resume will appear here as you fill the form.</p>
      )}
    </div>
  );
}
