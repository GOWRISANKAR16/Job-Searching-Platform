const SKILL_CATEGORIES = {
  coreCs: {
    label: "Core CS",
    items: ["DSA", "OOP", "DBMS", "OS", "Networks"],
  },
  languages: {
    label: "Languages",
    items: [
      "Java",
      "Python",
      "JavaScript",
      "TypeScript",
      "C",
      "C++",
      "C#",
      "Go",
    ],
  },
  web: {
    label: "Web",
    items: ["React", "Next.js", "Node.js", "Express", "REST", "GraphQL"],
  },
  data: {
    label: "Data",
    items: ["SQL", "MongoDB", "PostgreSQL", "MySQL", "Redis"],
  },
  cloudDevops: {
    label: "Cloud / DevOps",
    items: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Linux"],
  },
  testing: {
    label: "Testing",
    items: ["Selenium", "Cypress", "Playwright", "JUnit", "PyTest"],
  },
};

const HISTORY_KEY = "placement-readiness-history-v1";

const KNOWN_ENTERPRISE = [
  "amazon", "infosys", "tcs", "wipro", "accenture", "google", "microsoft",
  "meta", "apple", "capgemini", "cognizant", "hcl", "tech mahindra",
  "oracle", "ibm", "dell", "cisco", "salesforce", "adobe", "netflix",
  "goldman sachs", "jpmorgan", "morgan stanley", "deloitte", "ey", "kpmg", "pwc",
];

const INDUSTRY_KEYWORDS = [
  { keywords: ["fintech", "banking", "finance", "payment"], industry: "Financial Services" },
  { keywords: ["healthcare", "medical", "pharma", "clinical"], industry: "Healthcare" },
  { keywords: ["ecommerce", "retail", "marketplace", "shopping"], industry: "E‑commerce / Retail" },
  { keywords: ["saas", "cloud", "enterprise software"], industry: "Enterprise Software" },
  { keywords: ["edtech", "education", "learning"], industry: "Education Technology" },
  { keywords: ["automotive", "vehicle", "mobility"], industry: "Automotive / Mobility" },
];

function getCompanySize(companyName) {
  if (!companyName || !companyName.trim()) return "startup";
  const normalized = companyName.trim().toLowerCase();
  const isEnterprise = KNOWN_ENTERPRISE.some((name) => normalized.includes(name));
  if (isEnterprise) return "enterprise";
  return "startup";
}

function getIndustryGuess(jdText, companyName) {
  const combined = `${(jdText || "").toLowerCase()} ${(companyName || "").toLowerCase()}`;
  for (const { keywords, industry } of INDUSTRY_KEYWORDS) {
    if (keywords.some((k) => combined.includes(k))) return industry;
  }
  return "Technology Services";
}

function getTypicalHiringFocus(size) {
  if (size === "enterprise") {
    return "Structured DSA and core CS fundamentals; standardized online tests and technical rounds; emphasis on problem-solving patterns and system design basics.";
  }
  if (size === "mid") {
    return "Balance of fundamentals and hands-on skills; practical coding and system discussion; culture and ownership fit.";
  }
  return "Practical problem-solving and stack depth; ability to ship and iterate; strong fit with product and team.";
}

/**
 * Build company intel for display. Persist on entry.
 * Only meaningful when company name is provided.
 */
export function buildCompanyIntel(companyName, jdText) {
  if (!companyName || !companyName.trim()) {
    return null;
  }
  const size = getCompanySize(companyName);
  const industry = getIndustryGuess(jdText, companyName);
  const sizeLabel =
    size === "enterprise"
      ? "Enterprise (2000+)"
      : size === "mid"
        ? "Mid-size (200–2000)"
        : "Startup (<200)";
  return {
    companyName: companyName.trim(),
    industry,
    sizeCategory: sizeLabel,
    size,
    typicalHiringFocus: getTypicalHiringFocus(size),
  };
}

/**
 * Build round mapping from company intel + extracted skills. Each round has title + whyItMatters.
 */
export function buildRoundMapping(companyIntel, extractedSkills) {
  const size = companyIntel?.size ?? "startup";
  const hasDSA =
    extractedSkills?.coreCs?.includes("DSA") || extractedSkills?.coreCs?.includes("OOP");
  const hasWeb = (extractedSkills?.web?.length ?? 0) > 0;
  const hasReact = extractedSkills?.web?.includes("React");
  const hasNode =
    extractedSkills?.web?.includes("Node.js") || extractedSkills?.web?.includes("Express");

  if (size === "enterprise" && hasDSA) {
    return [
      {
        roundNumber: 1,
        title: "Online Test (DSA + Aptitude)",
        whyItMatters: "Screens for fundamentals and speed; strong performance here is often mandatory to advance.",
      },
      {
        roundNumber: 2,
        title: "Technical (DSA + Core CS)",
        whyItMatters: "Deep dive on data structures, algorithms, and core CS; interviewers expect clear reasoning and optimization.",
      },
      {
        roundNumber: 3,
        title: "Tech + Projects",
        whyItMatters: "Validates real-world application; be ready to walk through design choices and trade-offs.",
      },
      {
        roundNumber: 4,
        title: "HR",
        whyItMatters: "Final fit and expectations; clarity on goals and constraints helps both sides.",
      },
    ];
  }

  if (size === "enterprise") {
    return [
      {
        roundNumber: 1,
        title: "Aptitude / Screening",
        whyItMatters: "Initial filter for logical and quantitative ability; consistent practice pays off.",
      },
      {
        roundNumber: 2,
        title: "Technical (Core + Stack)",
        whyItMatters: "Assesses domain knowledge and problem-solving in your stack; structure your answers clearly.",
      },
      {
        roundNumber: 3,
        title: "Projects / System Discussion",
        whyItMatters: "Shows how you apply knowledge; prepare concise project stories and one system you could design.",
      },
      {
        roundNumber: 4,
        title: "HR / Managerial",
        whyItMatters: "Culture and communication fit; align your narrative with the role and company.",
      },
    ];
  }

  if ((hasReact || hasNode) && size === "startup") {
    return [
      {
        roundNumber: 1,
        title: "Practical coding",
        whyItMatters: "Demonstrates you can write and reason about code; focus on clarity and edge cases.",
      },
      {
        roundNumber: 2,
        title: "System discussion",
        whyItMatters: "Shows how you think about architecture and trade-offs; one solid example is enough.",
      },
      {
        roundNumber: 3,
        title: "Culture fit",
        whyItMatters: "Team wants to see how you collaborate and learn; be specific about past work and choices.",
      },
    ];
  }

  if (hasWeb && size === "startup") {
    return [
      {
        roundNumber: 1,
        title: "Coding + Stack",
        whyItMatters: "Combined technical screen; balance speed with correct, clean solutions.",
      },
      {
        roundNumber: 2,
        title: "Projects + Discussion",
        whyItMatters: "Depth on what you have built; prepare 1–2 projects you can explain end-to-end.",
      },
      {
        roundNumber: 3,
        title: "Team fit",
        whyItMatters: "Final alignment on role and expectations; ask thoughtful questions.",
      },
    ];
  }

  return [
    {
      roundNumber: 1,
      title: "Aptitude / Basics",
      whyItMatters: "Baseline filter; consistent practice improves both speed and accuracy.",
    },
    {
      roundNumber: 2,
      title: "Technical (DSA + Core)",
      whyItMatters: "Core of the process; structure your approach and communicate your reasoning.",
    },
    {
      roundNumber: 3,
      title: "Tech + Projects",
      whyItMatters: "Bridges theory and practice; one strong project narrative helps.",
    },
    {
      roundNumber: 4,
      title: "HR",
      whyItMatters: "Final check on fit and expectations; be clear and concise.",
    },
  ];
}

export function extractSkills(jdTextRaw) {
  const jdText = (jdTextRaw || "").toLowerCase();
  const extracted = {};
  let anyFound = false;

  Object.entries(SKILL_CATEGORIES).forEach(([key, value]) => {
    const foundInCategory = [];
    value.items.forEach((skill) => {
      const token = skill.toLowerCase();
      // simple word boundary-ish search
      if (jdText.includes(token)) {
        foundInCategory.push(skill);
      }
    });
    if (foundInCategory.length) {
      extracted[key] = foundInCategory;
      anyFound = true;
    }
  });

  if (!anyFound) {
    extracted.other = [
      "Communication",
      "Problem solving",
      "Basic coding",
      "Projects",
    ];
  }

  return extracted;
}

export function computeReadinessScore({
  jdText,
  company,
  role,
  extractedSkills,
}) {
  let score = 35;

  // +5 per detected category present (max 30)
  const categoriesPresent = Object.keys(extractedSkills).length;
  score += Math.min(categoriesPresent * 5, 30);

  if (company && company.trim().length > 0) {
    score += 10;
  }
  if (role && role.trim().length > 0) {
    score += 10;
  }
  if ((jdText || "").length > 800) {
    score += 10;
  }

  return Math.min(100, score);
}

export function buildChecklist(extractedSkills) {
  const hasDSA =
    extractedSkills.coreCs?.includes("DSA") ||
    extractedSkills.coreCs?.includes("OOP");
  const hasFrontend = extractedSkills.web?.includes("React");
  const hasBackend =
    extractedSkills.web?.some((s) => ["Node.js", "Express", "REST"].includes(s)) ||
    extractedSkills.data?.includes("SQL");

  const rounds = [
    {
      title: "Round 1: Aptitude / Basics",
      items: [
        "Brush up on quantitative aptitude and logical reasoning sets.",
        "Revise basic programming constructs (loops, conditionals, functions).",
        "Review Core CS definitions: DSA, OOP, DBMS, OS, Networks.",
        "Prepare concise introductions for yourself and your projects.",
        "Solve at least 2 timed mixed-topic aptitude tests.",
      ],
    },
    {
      title: "Round 2: DSA + Core CS",
      items: [
        "Revise arrays, strings, hash maps, and basic recursion problems.",
        "Practice time and space complexity analysis on recent questions.",
        "Review common data structures: stacks, queues, trees, graphs.",
        "Prepare short explanations for DBMS normalization and indexing.",
        "Revisit OS topics: processes vs threads, scheduling, deadlocks.",
      ],
    },
    {
      title: "Round 3: Tech interview (projects + stack)",
      items: [
        "Prepare 2–3 projects you can explain end-to-end in 5 minutes each.",
        hasFrontend
          ? "Revise React concepts: components, hooks, state management, routing."
          : "Be ready to map your primary programming language to real problems.",
        hasBackend
          ? "Review backend concepts: REST APIs, status codes, authentication."
          : "Practice explaining how you structure code and modules.",
        "Prepare 3 design decisions in your projects and why you made them.",
        "Have 2–3 questions ready to ask about the team and tech stack.",
      ].filter(Boolean),
    },
    {
      title: "Round 4: Managerial / HR",
      items: [
        "Prepare stories for teamwork, conflict, and ownership using STAR format.",
        "Reflect on failures or bugs and how you resolved them.",
        "Clarify your relocation, work preference, and joining timelines.",
        "Practice answering 'Why this company?' and 'Why this role?'",
        "Rehearse salary expectation and negotiation calmly and clearly.",
      ],
    },
  ];

  return rounds;
}

export function buildSevenDayPlan(extractedSkills) {
  const hasReact = extractedSkills.web?.includes("React");
  const hasSQL = extractedSkills.data?.includes("SQL");

  const plan = [
    {
      day: "Day 1",
      focus: "Basics & Core CS – part 1",
      items: [
        "Revise programming basics and language syntax you will use in interviews.",
        "Refresh Core CS summaries: DSA, OOP, DBMS, OS, Networks.",
        "Read through 1–2 high quality CS notes or your own condensed sheets.",
      ],
    },
    {
      day: "Day 2",
      focus: "Basics & Core CS – part 2",
      items: [
        "Solve 4–5 easy coding problems to warm up.",
        "Deep dive on 2 core CS topics that are weaker for you.",
        hasSQL
          ? "Review SQL joins, aggregations, and indexing examples."
          : "Practice explaining how you would store and query data in general.",
      ].filter(Boolean),
    },
    {
      day: "Day 3",
      focus: "DSA & Coding Practice – part 1",
      items: [
        "Focus on arrays, strings, and hashing questions under time constraints.",
        "Analyze your solutions for edge cases and complexity.",
        "Note 3 patterns you see recurring in questions.",
      ],
    },
    {
      day: "Day 4",
      focus: "DSA & Coding Practice – part 2",
      items: [
        "Work on recursion, DP, and graph/trees problems.",
        "Revisit at least 2 problems you previously found hard.",
        "Summarize key templates you will reuse in interviews.",
      ],
    },
    {
      day: "Day 5",
      focus: "Projects & Resume Alignment",
      items: [
        "Clean up your resume to reflect skills mentioned in the JD.",
        hasReact
          ? "Walk through your React projects and be ready to explain architecture and trade-offs."
          : "Prepare to explain one main project deeply (requirements, design, trade-offs).",
        "Ensure every line on your resume has a story and metric where possible.",
      ].filter(Boolean),
    },
    {
      day: "Day 6",
      focus: "Mock Interviews",
      items: [
        "Run at least one timed mock DSA round using past questions.",
        "Run a second mock focused on system / project explanation.",
        "Capture notes on where you hesitated or over-explained.",
      ],
    },
    {
      day: "Day 7",
      focus: "Revision & Weak Areas",
      items: [
        "Review your notes, flashcards, and tricky problems from earlier days.",
        "Revisit 2–3 weak topics from Core CS or your primary stack.",
        "Do a light mock HR/behavioral round with a friend or by recording yourself.",
      ],
    },
  ];

  return plan;
}

export function buildLikelyQuestions(extractedSkills) {
  const questions = [];

  const hasDSA =
    extractedSkills.coreCs?.includes("DSA") ||
    extractedSkills.coreCs?.includes("OOP");
  const hasSQL = extractedSkills.data?.includes("SQL");
  const hasReact = extractedSkills.web?.includes("React");
  const hasNode =
    extractedSkills.web?.includes("Node.js") ||
    extractedSkills.web?.includes("Express");
  const hasCloud = !!extractedSkills.cloudDevops;

  if (hasDSA) {
    questions.push(
      "How would you optimize search in a large, mostly sorted dataset?",
      "Explain the trade-offs between arrays, linked lists, and hash maps.",
      "Describe a time you used dynamic programming and how you identified overlapping subproblems."
    );
  }

  if (hasSQL) {
    questions.push(
      "Explain indexing in SQL and when it helps or hurts performance.",
      "How would you design a schema for tracking candidates and interviews?"
    );
  }

  if (hasReact) {
    questions.push(
      "Explain state management options in React and when you would lift state.",
      "How do you handle API loading, error, and empty states in a React UI?",
      "What are the trade-offs between client-side and server-side rendering for a React app?"
    );
  }

  if (hasNode) {
    questions.push(
      "How would you design a REST API for managing interview schedules?",
      "Explain how you would secure a Node.js/Express API for authenticated candidates."
    );
  }

  if (hasCloud) {
    questions.push(
      "How would you deploy a simple web service using your preferred cloud provider?",
      "Explain how you would set up CI/CD for a small placement prep application."
    );
  }

  // General questions to fill up to ~10
  while (questions.length < 10) {
    const remaining = 10 - questions.length;
    const generic = [
      "Walk me through one of your recent projects end-to-end.",
      "Tell me about a bug or failure you faced and how you resolved it.",
      "How do you approach learning a new technology under a tight deadline?",
      "Describe how you would prepare in the 24 hours before an important interview.",
    ];
    generic.slice(0, remaining).forEach((q) => questions.push(q));
    break;
  }

  return questions.slice(0, 10);
}

const STANDARD_SKILL_KEYS = [
  "coreCS",
  "languages",
  "web",
  "data",
  "cloud",
  "testing",
  "other",
];

const INTERNAL_TO_STANDARD_SKILL_KEYS = {
  coreCs: "coreCS",
  languages: "languages",
  web: "web",
  data: "data",
  cloudDevops: "cloud",
  testing: "testing",
  general: "other",
  other: "other",
};

function toStandardExtractedSkills(raw) {
  const out = {
    coreCS: [],
    languages: [],
    web: [],
    data: [],
    cloud: [],
    testing: [],
    other: [],
  };
  if (!raw || typeof raw !== "object") return out;
  Object.entries(raw).forEach(([key, val]) => {
    const standardKey = INTERNAL_TO_STANDARD_SKILL_KEYS[key] ?? (key === "other" ? "other" : null);
    if (standardKey && Array.isArray(val)) {
      out[standardKey] = val;
    }
  });
  return out;
}

const STANDARD_TO_INTERNAL_SKILL_KEYS = {
  coreCS: "coreCs",
  languages: "languages",
  web: "web",
  data: "data",
  cloud: "cloudDevops",
  testing: "testing",
  other: "other",
};

/** Convert standard extractedSkills back to internal shape for buildRoundMapping, buildChecklist, etc. */
export function toInternalExtractedSkills(standard) {
  const out = {};
  if (!standard || typeof standard !== "object") return out;
  Object.entries(standard).forEach(([key, val]) => {
    const internalKey = STANDARD_TO_INTERNAL_SKILL_KEYS[key] ?? key;
    if (Array.isArray(val) && val.length) {
      out[internalKey] = val;
    }
  });
  return out;
}

function toStandardRoundMapping(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => ({
    roundTitle: r.roundTitle ?? r.title ?? `Round ${r.roundNumber ?? 0}`,
    focusAreas: Array.isArray(r.focusAreas) ? r.focusAreas : [],
    whyItMatters: r.whyItMatters ?? "",
  }));
}

function toStandardChecklist(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => ({
    roundTitle: r.roundTitle ?? r.title ?? "",
    items: Array.isArray(r.items) ? r.items : [],
  }));
}

function toStandardPlan7Days(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => ({
    day: r.day ?? "",
    focus: r.focus ?? "",
    tasks: Array.isArray(r.tasks) ? r.tasks : Array.isArray(r.items) ? r.items : [],
  }));
}

function isEntryValid(entry) {
  try {
    if (!entry || typeof entry !== "object") return false;
    if (!entry.id || typeof entry.id !== "string") return false;
    if (typeof entry.jdText !== "string") return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize any entry (old or new) to standard shape for reading.
 * Readers can use plan7Days, checklist[].roundTitle/items, roundMapping[].roundTitle/whyItMatters,
 * baseScore, finalScore, extractedSkills (standard keys), etc.
 */
export function normalizeEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const rawSkills = entry.extractedSkills ?? {};
  const baseScore =
    typeof entry.baseScore === "number"
      ? entry.baseScore
      : typeof entry.readinessScore === "number"
        ? entry.readinessScore
        : 0;
  const finalScore =
    typeof entry.finalScore === "number"
      ? entry.finalScore
      : typeof entry.adjustedReadinessScore === "number"
        ? entry.adjustedReadinessScore
        : baseScore;
  const plan7Days =
    entry.plan7Days?.length > 0
      ? toStandardPlan7Days(entry.plan7Days)
      : entry.plan?.length > 0
        ? toStandardPlan7Days(entry.plan)
        : [];
  const checklist =
    entry.checklist?.length > 0
      ? toStandardChecklist(entry.checklist)
      : [];
  const roundMapping =
    entry.roundMapping?.length > 0
      ? toStandardRoundMapping(entry.roundMapping)
      : [];
  const questions = Array.isArray(entry.questions) ? entry.questions : [];
  const skillConfidenceMap =
    entry.skillConfidenceMap && typeof entry.skillConfidenceMap === "object"
      ? entry.skillConfidenceMap
      : {};
  return {
    ...entry,
    company: typeof entry.company === "string" ? entry.company : "",
    role: typeof entry.role === "string" ? entry.role : "",
    jdText: typeof entry.jdText === "string" ? entry.jdText : "",
    extractedSkills: toStandardExtractedSkills(rawSkills),
    roundMapping,
    checklist,
    plan7Days,
    questions,
    baseScore,
    finalScore,
    skillConfidenceMap,
    updatedAt:
      typeof entry.updatedAt === "string" ? entry.updatedAt : entry.createdAt ?? "",
  };
}

/**
 * Build a new history entry in standard schema. Used when creating from Analyze.
 */
export function createStandardEntry({
  id,
  createdAt,
  company,
  role,
  jdText,
  extractedSkillsInternal,
  checklist,
  plan,
  questions,
  baseScore,
  companyIntel,
  roundMappingRaw,
}) {
  const now = createdAt ?? new Date().toISOString();
  const standardRoundMapping = toStandardRoundMapping(roundMappingRaw ?? []);
  const standardChecklist = toStandardChecklist(checklist ?? []);
  const standardPlan7Days = toStandardPlan7Days(plan ?? []);
  const standardSkills = toStandardExtractedSkills(extractedSkillsInternal ?? {});
  return {
    id: String(id),
    createdAt: now,
    updatedAt: now,
    company: typeof company === "string" ? company : "",
    role: typeof role === "string" ? role : "",
    jdText: typeof jdText === "string" ? jdText : "",
    extractedSkills: standardSkills,
    roundMapping: standardRoundMapping,
    checklist: standardChecklist,
    plan7Days: standardPlan7Days,
    questions: Array.isArray(questions) ? questions : [],
    baseScore: typeof baseScore === "number" ? baseScore : 0,
    skillConfidenceMap: {},
    finalScore: typeof baseScore === "number" ? baseScore : 0,
    companyIntel: companyIntel ?? null,
  };
}

/**
 * Load history with validation. Skips corrupted entries. Returns { entries, skippedCount }.
 */
export function loadHistory() {
  if (typeof window === "undefined") return { entries: [], skippedCount: 0 };
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return { entries: [], skippedCount: 0 };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { entries: [], skippedCount: 0 };
    const entries = [];
    let skippedCount = 0;
    parsed.forEach((item) => {
      if (isEntryValid(item)) {
        entries.push(normalizeEntry(item));
      } else {
        skippedCount += 1;
      }
    });
    return { entries, skippedCount };
  } catch {
    return { entries: [], skippedCount: 0 };
  }
}

export function saveHistory(entries) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

export function addHistoryEntry(entry) {
  const { entries } = loadHistory();
  const updated = [entry, ...entries];
  saveHistory(updated);
  return updated;
}

/**
 * Compute adjusted readiness score from base + skill confidence.
 * +2 per "know", -2 per "practice" (default). Bounds 0–100.
 */
export function computeAdjustedReadinessScore(baseScore, skillConfidenceMap, allSkills) {
  if (!allSkills || allSkills.length === 0) return baseScore;
  let score = baseScore;
  allSkills.forEach((skill) => {
    const status = skillConfidenceMap?.[skill] ?? "practice";
    if (status === "know") score += 2;
    else score -= 2;
  });
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Update an existing history entry by id and save. Keeps history order.
 * Persist standard shape; set finalScore and updatedAt when skill confidence changes.
 */
export function updateHistoryEntry(updatedEntry) {
  const { entries } = loadHistory();
  const index = entries.findIndex((e) => e.id === updatedEntry.id);
  if (index === -1) return entries;
  const next = [...entries];
  const normalized = normalizeEntry({
    ...updatedEntry,
    updatedAt: new Date().toISOString(),
  });
  next[index] = normalized;
  saveHistory(next);
  return next;
}

export { SKILL_CATEGORIES, HISTORY_KEY };

