/**
 * Bullet structure guidance — non-blocking suggestions only.
 * Used for Experience and Projects bullet text.
 */

const ACTION_VERBS = [
  "built",
  "developed",
  "designed",
  "implemented",
  "led",
  "improved",
  "created",
  "optimized",
  "automated",
];

function startsWithActionVerb(text) {
  if (!text || typeof text !== "string") return true;
  const firstWord = text.trim().split(/\s+/)[0] || "";
  const lower = firstWord.toLowerCase().replace(/[^a-z]/g, "");
  return ACTION_VERBS.includes(lower);
}

function hasNumericIndicator(text) {
  if (!text || typeof text !== "string") return false;
  return /[\d%]|\b\d+[kKmM]?\b/i.test(text);
}

/**
 * For a single bullet line, return which suggestions apply.
 * @returns { { actionVerb: boolean, numbers: boolean } }
 */
export function getBulletSuggestions(bulletText) {
  const trimmed = (bulletText || "").trim();
  if (!trimmed) return { actionVerb: false, numbers: false };
  return {
    actionVerb: !startsWithActionVerb(trimmed),
    numbers: !hasNumericIndicator(trimmed),
  };
}

/**
 * Split details/description into lines and return suggestion messages per line (1-based).
 * @param {string} block - details or description text
 * @returns Array<{ index: number, line: string, suggestions: string[] }>
 */
export function getBulletLinesWithSuggestions(block) {
  const lines = (block || "")
    .split(/\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  return lines.map((line, i) => {
    const { actionVerb, numbers } = getBulletSuggestions(line);
    const suggestions = [];
    if (actionVerb) suggestions.push("Start with a strong action verb.");
    if (numbers) suggestions.push("Add measurable impact (numbers).");
    return { index: i + 1, line, suggestions };
  });
}
