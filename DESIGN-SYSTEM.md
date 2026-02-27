# Job Notification App — Design System

Design system foundation only. No product features. B2C-grade, calm, intentional.

## Philosophy

- **Calm, intentional, coherent, confident**
- Not flashy, playful, or hackathon-style
- No gradients, glassmorphism, neon, or animation noise

## Color (max 4 in use)

| Role      | Token           | Value     |
|-----------|-----------------|-----------|
| Background| `--color-bg`    | `#F7F6F3` |
| Text      | `--color-text`  | `#111111` |
| Accent    | `--color-accent`| `#8B0000` |
| Success   | `--color-success`| Muted green |
| Warning   | `--color-warning`| Muted amber |

Borders and muted text use derived neutrals.

## Typography

- **Headings:** Serif (Source Serif 4), large, generous spacing
- **Body:** Sans (Source Sans 3), 16–18px, line-height 1.6–1.8
- **Max width for text blocks:** 720px
- No decorative fonts or random sizes

## Spacing scale (only these)

`8px` · `16px` · `24px` · `40px` · `64px`  
Use `var(--space-1)` through `var(--space-5)`. No values outside this scale.

## Global layout

Every page must follow:

1. **Top Bar** — Left: app name · Center: Step X / Y · Right: status badge (Not Started / In Progress / Shipped)
2. **Context Header** — Large serif headline, one-line subtext, clear purpose
3. **Primary Workspace (70%)** — Cards, predictable components, subtle borders
4. **Secondary Panel (30%)** — Step explanation, copyable prompt box, buttons
5. **Proof Footer** — Checklist: UI Built, Logic Working, Test Passed, Deployed

## Components

- **Primary button:** solid `#8B0000`
- **Secondary button:** outlined
- **Same border radius** everywhere (`--layout-radius`: 6px)
- **Inputs:** clean borders, clear focus state (2px accent)
- **Cards:** subtle border, no drop shadows

## Interaction

- Transitions: 150–200ms, ease-in-out
- No bounce, no parallax

## Errors & empty states

- Errors: explain what went wrong and how to fix it. Never blame the user.
- Empty states: guide next action. No blank screens.

## Files

- `css/variables.css` — Tokens
- `css/base.css` — Reset, typography
- `css/layout.css` — App shell, top bar, context header, workspace, panel, proof footer
- `css/components.css` — Badges, buttons, inputs, cards, copy box, error/empty blocks
- `css/design-system.css` — Single import for all of the above

## Demo & routes

Open `index.html` in a browser. For client-side routes (`/`, `/dashboard`, `/saved`, etc.) to work without full reloads, serve the app from a local server (e.g. `npx serve .` or `python -m http.server`) so that all paths return `index.html`.
