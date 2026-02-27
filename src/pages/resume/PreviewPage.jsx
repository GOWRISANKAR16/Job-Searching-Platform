import { useCallback, useState } from "react";
import { useResume, THEME_COLORS } from "../../context/ResumeContext";
import { TemplatePicker, ColorThemePicker } from "../../components/resume/TemplatePicker";
import { computeAtsScore, getAtsBand } from "../../lib/atsScore";

function buildResumePlainText(resume) {
  const { personalInfo, summary, education, experience, projects, skills, links } = resume;
  const lines = [];

  lines.push(personalInfo?.name?.trim() || "Your Name");
  const contact = [personalInfo?.email, personalInfo?.phone, personalInfo?.location].filter(Boolean).join(" | ");
  if (contact) lines.push(contact);
  lines.push("");

  if (summary?.trim()) {
    lines.push("Summary");
    lines.push(summary.trim());
    lines.push("");
  }

  if (education?.length) {
    lines.push("Education");
    education.forEach((e) => {
      lines.push(`${e.institution || "Institution"} — ${e.degree || ""}${e.dates ? ` (${e.dates})` : ""}`);
      if (e.details?.trim()) lines.push(e.details.trim());
    });
    lines.push("");
  }

  if (experience?.length) {
    lines.push("Experience");
    experience.forEach((ex) => {
      lines.push(`${ex.role || "Role"} at ${ex.company || ""}${ex.dates ? ` · ${ex.dates}` : ""}`);
      if (ex.details?.trim()) lines.push(ex.details.trim());
    });
    lines.push("");
  }

  if (projects?.length) {
    lines.push("Projects");
    projects.forEach((p) => {
      lines.push(p.name || "Project");
      if (p.description?.trim()) lines.push(p.description.trim());
      if (Array.isArray(p.techStack) && p.techStack.length) lines.push("Tech: " + p.techStack.join(", "));
      if (p.liveUrl?.trim()) lines.push(p.liveUrl.trim());
      if (p.githubUrl?.trim()) lines.push(p.githubUrl.trim());
    });
    lines.push("");
  }

  const skillsObj = skills && typeof skills === "object" ? skills : null;
  if (skillsObj && ((skillsObj.technical?.length || 0) + (skillsObj.soft?.length || 0) + (skillsObj.tools?.length || 0) > 0)) {
    lines.push("Skills");
    if (skillsObj.technical?.length) lines.push("Technical: " + skillsObj.technical.join(", "));
    if (skillsObj.soft?.length) lines.push("Soft: " + skillsObj.soft.join(", "));
    if (skillsObj.tools?.length) lines.push("Tools: " + skillsObj.tools.join(", "));
    lines.push("");
  } else if (typeof skills === "string" && skills.trim()) {
    lines.push("Skills");
    lines.push(skills.trim());
    lines.push("");
  }

  if (links?.github?.trim() || links?.linkedin?.trim()) {
    lines.push("Links");
    lines.push([links.github, links.linkedin].filter(Boolean).join(" | "));
  }

  return lines.join("\n").trim() || "Add content in the Builder to see your resume here.";
}

function AtsCircularScore({ resume }) {
  const { score, suggestions } = computeAtsScore(resume);
  const band = getAtsBand(score);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const strokeColor =
    band.color === "red" ? "rgb(239, 68, 68)" : band.color === "amber" ? "rgb(245, 158, 11)" : "rgb(34, 197, 94)";
  const textColor =
    band.color === "red" ? "text-red-400" : band.color === "amber" ? "text-amber-400" : "text-green-400";

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 no-print">
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
        ATS Resume Score
      </div>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0" style={{ width: 100, height: 100 }}>
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="rgb(51, 65, 85)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
            <span className="text-xl font-bold tabular-nums text-white">{score}</span>
            <span className="text-[10px] text-slate-500">/ 100</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${textColor}`}>{band.label}</p>
          {suggestions.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-slate-400">
              {suggestions.slice(0, 5).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  const { resume, template, setTemplate, themeColor, setThemeColor } = useResume();
  const { personalInfo, summary, education, experience, projects, skills, links } = resume;
  const skillsObj = skills && typeof skills === "object" ? skills : { technical: [], soft: [], tools: [] };
  const hasSkills =
    (skillsObj.technical?.length || 0) + (skillsObj.soft?.length || 0) + (skillsObj.tools?.length || 0) > 0;
  const [copyStatus, setCopyStatus] = useState("");
  const [pdfToast, setPdfToast] = useState(false);

  const accentHsl = THEME_COLORS.find((c) => c.id === (themeColor || "teal"))?.hsl || "hsl(168, 60%, 40%)";

  const isIncomplete =
    !(personalInfo?.name || "").trim() ||
    ((!projects || projects.length === 0) && (!experience || experience.length === 0));

  const handlePrint = useCallback(() => {
    setPdfToast(true);
    setTimeout(() => setPdfToast(false), 3000);
  }, []);

  const handleCopyText = useCallback(async () => {
    const text = buildResumePlainText(resume);
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copied to clipboard.");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopyStatus("Copied to clipboard.");
      } catch {
        setCopyStatus("Copy failed.");
      }
      document.body.removeChild(ta);
      setTimeout(() => setCopyStatus(""), 2000);
    }
  }, [resume]);

  const t = template || "Classic";
  const articleClass =
    t === "Modern"
      ? "text-black leading-relaxed font-sans"
      : t === "Minimal"
      ? "text-black leading-relaxed tracking-wide"
      : "text-black leading-relaxed";
  const articleStyle =
    t === "Classic" || t === "Minimal"
      ? { fontFamily: t === "Minimal" ? "system-ui, -apple-system, sans-serif" : "Georgia, 'Times New Roman', serif" }
      : { fontFamily: "system-ui, -apple-system, sans-serif" };
  const accentStyle = { color: accentHsl };
  const borderAccentStyle = { borderColor: accentHsl };
  const bgAccentStyle = { backgroundColor: accentHsl };

  return (
    <div className="bg-slate-950 min-h-screen">
      <div className="max-w-2xl mx-auto px-8 py-12 print:px-0 print:py-0">
        <div className="no-print flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Template</div>
              <TemplatePicker
                value={t}
                onChange={setTemplate}
                accentHsl={accentHsl}
              />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Color</div>
              <ColorThemePicker value={themeColor || "teal"} onChange={setThemeColor} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isIncomplete && (
              <p className="text-sm text-slate-400">Your resume may look incomplete.</p>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
            >
              Download PDF
            </button>
            {pdfToast && (
              <div className="fixed bottom-4 right-4 rounded-lg bg-slate-800 text-white px-4 py-2 text-sm shadow-lg z-50">
                PDF export ready! Check your downloads.
              </div>
            )}
            <button
              type="button"
              onClick={handleCopyText}
              className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
            >
              Copy Resume as Text
            </button>
            {copyStatus && <span className="text-xs text-slate-400">{copyStatus}</span>}
          </div>
        </div>
        <div className="no-print mb-6">
          <AtsCircularScore resume={resume} />
        </div>
        <article
          id="resume-print-area"
          className={`print-area ${articleClass} overflow-hidden`}
          style={articleStyle}
        >
          {t === "Modern" ? (
            <div className="flex min-h-[400px]">
              <aside className="w-[28%] shrink-0 text-white p-6 flex flex-col" style={bgAccentStyle}>
                <h1 className="text-xl font-semibold tracking-tight">
                  {personalInfo?.name || "Your Name"}
                </h1>
                <div className="text-sm text-white/90 mt-2 space-y-1">
                  {personalInfo?.email && <div>{personalInfo.email}</div>}
                  {personalInfo?.phone && <div>{personalInfo.phone}</div>}
                  {personalInfo?.location && <div>{personalInfo.location}</div>}
                </div>
                {hasSkills && (
                  <div className="mt-6">
                    <h2 className="text-xs font-semibold uppercase tracking-widest opacity-95 mb-2">Skills</h2>
                    <div className="flex flex-wrap gap-1">
                      {[...(skillsObj?.technical || []), ...(skillsObj?.soft || []), ...(skillsObj?.tools || [])].map((s, i) => (
                        <span key={i} className="inline-flex rounded-full bg-white/20 px-2 py-0.5 text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
              <div className="flex-1 pl-8 py-6">
                {summary && (
                  <section className="mb-6">
                    <h2 className="text-xs font-semibold uppercase tracking-widest mb-2" style={accentStyle}>Summary</h2>
                    <p className="text-black/90 leading-relaxed break-words">{summary}</p>
                  </section>
                )}
                {education?.length > 0 && (
                  <section className="mb-6">
                    <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={accentStyle}>Education</h2>
                    <ul className="space-y-3">
                      {education.map((e) => (
                        <li key={e.id} className="print-keep-together">
                          <div className="font-semibold text-black">{e.institution || "Institution"}</div>
                          <div className="text-sm text-black/80">
                            {e.degree}
                            {e.dates && ` · ${e.dates}`}
                          </div>
                          {e.details && <p className="text-sm text-black/70 mt-1 break-words">{e.details}</p>}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {experience?.length > 0 && (
                  <section className="mb-6">
                    <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={accentStyle}>Experience</h2>
                    <ul className="space-y-4">
                      {experience.map((ex) => (
                        <li key={ex.id} className="print-keep-together">
                          <div className="font-semibold text-black">{ex.role || "Role"}</div>
                          <div className="text-sm text-black/80">
                            {ex.company}
                            {ex.dates && ` · ${ex.dates}`}
                          </div>
                          {ex.details && (
                            <p className="text-sm text-black/70 mt-2 whitespace-pre-line break-words">{ex.details}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {projects?.length > 0 && (
                  <section className="mb-6">
                    <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={accentStyle}>Projects</h2>
                    <ul className="space-y-3">
                      {projects.map((p) => (
                        <li key={p.id} className="print-keep-together">
                          <div className="font-semibold text-black break-words">{p.name || "Project"}</div>
                          {p.description && <p className="text-sm text-black/70 mt-0.5 break-words">{p.description}</p>}
                          {Array.isArray(p.techStack) && p.techStack.length > 0 && (
                            <p className="text-sm text-black/60 mt-0.5">{p.techStack.join(" · ")}</p>
                          )}
                          {(p.liveUrl || p.githubUrl) && (
                            <p className="text-sm text-black/60 mt-0.5 break-all">
                              {[p.liveUrl, p.githubUrl].filter(Boolean).join(" · ")}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {(links?.github || links?.linkedin) && (
                  <section>
                    <h2 className="text-xs font-semibold uppercase tracking-widest mb-2" style={accentStyle}>Links</h2>
                    <p className="text-sm text-black/80 break-all">
                      {[links.github, links.linkedin].filter(Boolean).join(" · ")}
                    </p>
                  </section>
                )}
                {!summary && !education?.length && !experience?.length && !projects?.length && !(links?.github || links?.linkedin) && (
                  <p className="text-black/50 italic">Add content in the Builder to see your resume here.</p>
                )}
              </div>
            </div>
          ) : (
            <>
          {/* Name & contact */}
          <header
            className={`border-b pb-3 mb-6 ${t === "Minimal" ? "border-slate-300" : ""}`}
            style={t === "Classic" ? borderAccentStyle : undefined}
          >
            <h1 className="text-2xl font-semibold tracking-tight text-black" style={t === "Minimal" ? accentStyle : undefined}>
              {personalInfo?.name || "Your Name"}
            </h1>
            <div className="text-sm text-black/80 mt-1 space-x-3">
              {personalInfo?.email && <span>{personalInfo.email}</span>}
              {personalInfo?.phone && <span>{personalInfo.phone}</span>}
              {personalInfo?.location && <span>{personalInfo.location}</span>}
            </div>
          </header>

          {summary && (
            <section className={`mb-6 ${t === "Classic" ? "border-b pb-6" : ""}`} style={t === "Classic" ? borderAccentStyle : undefined}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-black mb-2" style={accentStyle}>Summary</h2>
              <p className="text-black/90 leading-relaxed break-words">{summary}</p>
            </section>
          )}

          {education?.length > 0 && (
            <section className={`mb-6 ${t === "Classic" ? "border-b pb-6" : ""}`} style={t === "Classic" ? borderAccentStyle : undefined}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-black mb-3" style={accentStyle}>Education</h2>
              <ul className="space-y-3">
                {education.map((e) => (
                  <li key={e.id} className="print-keep-together">
                    <div className="font-semibold text-black">{e.institution || "Institution"}</div>
                    <div className="text-sm text-black/80">
                      {e.degree}
                      {e.dates && ` · ${e.dates}`}
                    </div>
                    {e.details && <p className="text-sm text-black/70 mt-1 break-words">{e.details}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {experience?.length > 0 && (
            <section className={`mb-6 ${t === "Classic" ? "border-b pb-6" : ""}`} style={t === "Classic" ? borderAccentStyle : undefined}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-black mb-3" style={accentStyle}>Experience</h2>
              <ul className="space-y-4">
                {experience.map((ex) => (
                  <li key={ex.id} className="print-keep-together">
                    <div className="font-semibold text-black">{ex.role || "Role"}</div>
                    <div className="text-sm text-black/80">
                      {ex.company}
                      {ex.dates && ` · ${ex.dates}`}
                    </div>
                    {ex.details && (
                      <p className="text-sm text-black/70 mt-2 whitespace-pre-line break-words">{ex.details}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {projects?.length > 0 && (
            <section className={`mb-6 ${t === "Classic" ? "border-b pb-6" : ""}`} style={t === "Classic" ? borderAccentStyle : undefined}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-black mb-3" style={accentStyle}>Projects</h2>
              <ul className="space-y-3">
                {projects.map((p) => (
                  <li key={p.id} className="print-keep-together">
                    <div className="font-semibold text-black break-words">{p.name || "Project"}</div>
                    {p.description && (
                      <p className="text-sm text-black/70 mt-0.5 break-words">{p.description}</p>
                    )}
                    {Array.isArray(p.techStack) && p.techStack.length > 0 && (
                      <p className="text-sm text-black/60 mt-0.5">
                        {p.techStack.join(" · ")}
                      </p>
                    )}
                    {(p.liveUrl || p.githubUrl) && (
                      <p className="text-sm text-black/60 mt-0.5 break-all">
                        {[p.liveUrl, p.githubUrl].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasSkills && (
            <section className={`mb-6 ${t === "Classic" ? "border-b pb-6" : ""}`} style={t === "Classic" ? borderAccentStyle : undefined}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-black mb-2" style={accentStyle}>Skills</h2>
              <div className="space-y-2">
                {skillsObj?.technical?.length > 0 && (
                  <p className="text-black/80"><strong>Technical:</strong> {(skillsObj.technical || []).join(", ")}</p>
                )}
                {skillsObj?.soft?.length > 0 && (
                  <p className="text-black/80"><strong>Soft:</strong> {(skillsObj.soft || []).join(", ")}</p>
                )}
                {skillsObj?.tools?.length > 0 && (
                  <p className="text-black/80"><strong>Tools:</strong> {(skillsObj.tools || []).join(", ")}</p>
                )}
              </div>
            </section>
          )}

          {(links?.github || links?.linkedin) && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-black mb-2" style={accentStyle}>Links</h2>
              <p className="text-sm text-black/80 break-all">
                {[links.github, links.linkedin].filter(Boolean).join(" · ")}
              </p>
            </section>
          )}

          {!personalInfo?.name && !summary && !education?.length && !experience?.length && !projects?.length && !hasSkills && (
            <p className="text-black/50 italic">Add content in the Builder to see your resume here.</p>
          )}
            </>
          )}
        </article>
      </div>
    </div>
  );
}
