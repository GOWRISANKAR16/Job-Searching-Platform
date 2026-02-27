import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getPlatformState, savePlatformState } from "../lib/platformStore";

const TEMPLATES = ["Classic", "Modern", "Minimal"];
export { TEMPLATES };

export const THEME_COLORS = [
  { id: "teal", name: "Teal", hsl: "hsl(168, 60%, 40%)" },
  { id: "navy", name: "Navy", hsl: "hsl(220, 60%, 35%)" },
  { id: "burgundy", name: "Burgundy", hsl: "hsl(345, 60%, 35%)" },
  { id: "forest", name: "Forest", hsl: "hsl(150, 50%, 30%)" },
  { id: "charcoal", name: "Charcoal", hsl: "hsl(0, 0%, 25%)" },
];

function loadFromPlatform() {
  const state = getPlatformState();
  const prefs = state.preferences || {};
  const template = TEMPLATES.includes(prefs.template) ? prefs.template : "Classic";
  const themeId = THEME_COLORS.some((c) => c.id === prefs.themeColor) ? prefs.themeColor : "teal";
  return { template, themeId, resumeData: state.resumeData };
}

function saveResumeToPlatform(resumeData) {
  const state = getPlatformState();
  state.resumeData = resumeData;
  savePlatformState(state);
}

function savePreferencesToPlatform(template, themeColor) {
  const state = getPlatformState();
  state.preferences = { ...(state.preferences || {}), template, themeColor };
  savePlatformState(state);
}

function loadStored() {
  const { resumeData } = loadFromPlatform();
  return resumeData ?? null;
}
const defaultPersonal = { name: "", email: "", phone: "", location: "" };
const defaultLinks = { github: "", linkedin: "" };

const defaultSkills = { technical: [], soft: [], tools: [] };

export const SAMPLE_DATA = {
  personalInfo: {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "+1 234 567 8900",
    location: "San Francisco, CA",
  },
  summary:
    "Software engineer with 4+ years of experience building web applications. Strong focus on clean code, user experience, and collaborative delivery.",
  education: [
    {
      id: "ed1",
      institution: "State University",
      degree: "B.S. Computer Science",
      dates: "2016 – 2020",
      details: "Relevant coursework: Data Structures, Algorithms, Web Development.",
    },
  ],
  experience: [
    {
      id: "ex1",
      company: "Tech Corp",
      role: "Senior Software Engineer",
      dates: "2022 – Present",
      details: "Lead frontend initiatives. Improved performance by 40%. Mentored 3 junior developers.",
    },
    {
      id: "ex2",
      company: "Startup Inc",
      role: "Software Engineer",
      dates: "2020 – 2022",
      details: "Built customer-facing dashboards. Collaborated with design and product teams.",
    },
  ],
  projects: [
    {
      id: "pr1",
      name: "Open Source Library",
      description: "Maintainer of a React component library with 2k+ GitHub stars.",
      techStack: ["React", "TypeScript"],
      liveUrl: "",
      githubUrl: "https://github.com/example/lib",
    },
  ],
  skills: {
    technical: ["React", "TypeScript", "Node.js", "SQL"],
    soft: ["Communication", "Problem Solving"],
    tools: ["Git", "Docker"],
  },
  links: { github: "https://github.com/janedoe", linkedin: "https://linkedin.com/in/janedoe" },
};

const initialState = {
  personalInfo: { ...defaultPersonal },
  summary: "",
  education: [],
  experience: [],
  projects: [],
  skills: { ...defaultSkills },
  links: { ...defaultLinks },
};

const ResumeContext = createContext(null);

export function ResumeProvider({ children }) {
  const platform = typeof window !== "undefined" ? loadFromPlatform() : { template: "Classic", themeId: "teal", resumeData: null };
  const [template, setTemplateState] = useState(platform.template);
  const [themeColor, setThemeColorState] = useState(platform.themeId);
  const [resume, setResume] = useState(() => {
    const stored = loadStored();
    if (stored && typeof stored === "object") {
      const ensureId = (item, prefix) => (item && item.id ? item : { ...item, id: `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}` });
      const normalizeSkills = (s) => {
        if (s && typeof s === "object" && Array.isArray(s.technical)) return { technical: [...(s.technical || [])], soft: [...(s.soft || [])], tools: [...(s.tools || [])] };
        if (typeof s === "string" && s.trim()) return { technical: s.split(",").map((x) => x.trim()).filter(Boolean), soft: [], tools: [] };
        return { ...defaultSkills };
      };
      const normalizeProject = (p) => {
        const base = { id: p.id || `pr-${Date.now()}`, name: p.name || "", description: p.description || "", techStack: Array.isArray(p.techStack) ? p.techStack : [], liveUrl: p.liveUrl || "", githubUrl: p.githubUrl || p.url || "" };
        return base;
      };
      return {
        personalInfo: { ...defaultPersonal, ...(stored.personalInfo || {}) },
        summary: typeof stored.summary === "string" ? stored.summary : "",
        education: (Array.isArray(stored.education) ? stored.education : []).map((e, i) => ensureId(e, "ed")),
        experience: (Array.isArray(stored.experience) ? stored.experience : []).map((e, i) => ensureId(e, "ex")),
        projects: (Array.isArray(stored.projects) ? stored.projects : []).map(normalizeProject),
        skills: normalizeSkills(stored.skills),
        links: { ...defaultLinks, ...(stored.links || {}) },
      };
    }
    return initialState;
  });

  useEffect(() => {
    if (typeof window !== "undefined") saveResumeToPlatform(resume);
  }, [resume]);

  const setTemplate = useCallback((t) => {
    if (!TEMPLATES.includes(t)) return;
    setTemplateState(t);
    if (typeof window !== "undefined") savePreferencesToPlatform(t, themeColor);
  }, [themeColor]);

  const setThemeColor = useCallback((id) => {
    if (!THEME_COLORS.some((c) => c.id === id)) return;
    setThemeColorState(id);
    if (typeof window !== "undefined") savePreferencesToPlatform(template, id);
  }, [template]);

  const updatePersonal = useCallback((field, value) => {
    setResume((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  }, []);

  const updateSummary = useCallback((value) => {
    setResume((prev) => ({ ...prev, summary: value }));
  }, []);

  const updateEducation = useCallback((index, field, value) => {
    setResume((prev) => {
      const next = [...(prev.education || [])];
      if (!next[index]) next[index] = { id: `ed${Date.now()}`, institution: "", degree: "", dates: "", details: "" };
      next[index] = { ...next[index], [field]: value };
      return { ...prev, education: next };
    });
  }, []);

  const addEducation = useCallback(() => {
    setResume((prev) => ({
      ...prev,
      education: [
        ...(prev.education || []),
        { id: `ed${Date.now()}`, institution: "", degree: "", dates: "", details: "" },
      ],
    }));
  }, []);

  const removeEducation = useCallback((index) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }, []);

  const updateExperience = useCallback((index, field, value) => {
    setResume((prev) => {
      const next = [...(prev.experience || [])];
      if (!next[index]) next[index] = { id: `ex${Date.now()}`, company: "", role: "", dates: "", details: "" };
      next[index] = { ...next[index], [field]: value };
      return { ...prev, experience: next };
    });
  }, []);

  const addExperience = useCallback(() => {
    setResume((prev) => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
        { id: `ex${Date.now()}`, company: "", role: "", dates: "", details: "" },
      ],
    }));
  }, []);

  const removeExperience = useCallback((index) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }, []);

  const updateProject = useCallback((index, field, value) => {
    setResume((prev) => {
      const next = [...(prev.projects || [])];
      const current = next[index] || { id: `pr${Date.now()}`, name: "", description: "", techStack: [], liveUrl: "", githubUrl: "" };
      next[index] = { ...current, [field]: value };
      return { ...prev, projects: next };
    });
  }, []);

  const addProject = useCallback(() => {
    setResume((prev) => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        { id: `pr${Date.now()}`, name: "", description: "", techStack: [], liveUrl: "", githubUrl: "" },
      ],
    }));
  }, []);

  const removeProject = useCallback((index) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  }, []);

  const updateSkills = useCallback((value) => {
    setResume((prev) => ({ ...prev, skills: value }));
  }, []);

  const addSkillToCategory = useCallback((category, skill) => {
    const trimmed = (skill || "").trim();
    if (!trimmed) return;
    setResume((prev) => {
      const s = prev.skills && typeof prev.skills === "object" ? { ...prev.skills } : { ...defaultSkills };
      const list = s[category];
      if (!Array.isArray(list)) return prev;
      if (list.includes(trimmed)) return prev;
      return { ...prev, skills: { ...s, [category]: [...list, trimmed] } };
    });
  }, []);

  const removeSkillFromCategory = useCallback((category, index) => {
    setResume((prev) => {
      const s = prev.skills && typeof prev.skills === "object" ? { ...prev.skills } : { ...defaultSkills };
      const list = s[category];
      if (!Array.isArray(list)) return prev;
      const next = list.filter((_, i) => i !== index);
      return { ...prev, skills: { ...s, [category]: next } };
    });
  }, []);

  const SUGGESTED_SKILLS = {
    technical: ["TypeScript", "React", "Node.js", "PostgreSQL", "GraphQL"],
    soft: ["Team Leadership", "Problem Solving"],
    tools: ["Git", "Docker", "AWS"],
  };

  const suggestSkills = useCallback(() => {
    setResume((prev) => {
      const s = prev.skills && typeof prev.skills === "object" ? { ...prev.skills } : { ...defaultSkills };
      const merge = (key) => {
        const existing = s[key] || [];
        const toAdd = (SUGGESTED_SKILLS[key] || []).filter((x) => !existing.includes(x));
        return [...existing, ...toAdd];
      };
      return {
        ...prev,
        skills: { technical: merge("technical"), soft: merge("soft"), tools: merge("tools") },
      };
    });
  }, []);

  const updateLink = useCallback((key, value) => {
    setResume((prev) => ({
      ...prev,
      links: { ...prev.links, [key]: value },
    }));
  }, []);

  const loadSampleData = useCallback(() => {
    setResume({
      ...initialState,
      ...SAMPLE_DATA,
      education: SAMPLE_DATA.education.map((e, i) => ({ ...e, id: `ed${Date.now()}-${i}` })),
      experience: SAMPLE_DATA.experience.map((e, i) => ({ ...e, id: `ex${Date.now()}-${i}` })),
      projects: SAMPLE_DATA.projects.map((p, i) => ({ ...p, id: `pr${Date.now()}-${i}`, techStack: p.techStack || [], liveUrl: p.liveUrl || "", githubUrl: p.githubUrl || p.url || "" })),
      skills: { ...defaultSkills, ...SAMPLE_DATA.skills },
    });
  }, []);

  const value = {
    resume,
    template,
    setTemplate,
    themeColor,
    setThemeColor,
    updatePersonal,
    updateSummary,
    education: resume.education || [],
    experience: resume.experience || [],
    projects: resume.projects || [],
    updateEducation,
    addEducation,
    removeEducation,
    updateExperience,
    addExperience,
    removeExperience,
    updateProject,
    addProject,
    removeProject,
    updateSkills,
    addSkillToCategory,
    removeSkillFromCategory,
    suggestSkills,
    updateLink,
    loadSampleData,
  };

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResume must be used within ResumeProvider");
  return ctx;
}
