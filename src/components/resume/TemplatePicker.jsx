import { THEME_COLORS } from "../../context/ResumeContext";

export function TemplateThumbnail({ name, active, onClick, accentHsl, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-[120px] flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all ${
        active ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200 hover:border-slate-300"
      }`}
      aria-pressed={active}
      aria-label={`Select ${name} template`}
    >
      <div className="aspect-[1/1.4] bg-white relative">{children}</div>
      <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 border-t border-slate-200">
        <span className="text-[10px] font-medium text-slate-700 truncate">{name}</span>
        {active && <span className="text-blue-600 text-xs" aria-hidden>✓</span>}
      </div>
    </button>
  );
}

export function TemplatePicker({ value, onChange, accentHsl }) {
  const hsl = accentHsl || "hsl(168, 60%, 40%)";
  return (
    <div className="flex gap-2 flex-wrap">
      <TemplateThumbnail name="Classic" active={value === "Classic"} onClick={() => onChange("Classic")} accentHsl={hsl}>
        <div className="p-1.5 h-full flex flex-col text-[8px]">
          <div className="h-4 rounded-sm bg-slate-700 mb-1.5" style={{ fontFamily: "Georgia, serif" }} />
          <div className="border-b border-slate-300 mb-1" />
          <div className="h-2 bg-slate-400 rounded w-3/4 mb-1" />
          <div className="h-2 bg-slate-300 rounded w-full mb-1" />
          <div className="border-b border-slate-300 mb-1" />
          <div className="h-2 bg-slate-400 rounded w-2/3 mb-1" />
          <div className="h-2 bg-slate-300 rounded w-full" />
        </div>
      </TemplateThumbnail>
      <TemplateThumbnail name="Modern" active={value === "Modern"} onClick={() => onChange("Modern")} accentHsl={hsl}>
        <div className="p-0 h-full flex text-[8px]">
          <div className="w-6 shrink-0 rounded-l" style={{ backgroundColor: hsl }} />
          <div className="flex-1 p-1 flex flex-col">
            <div className="h-3 bg-slate-600 rounded w-full mb-1" />
            <div className="h-1.5 bg-slate-400 rounded w-4/5 mb-1" />
            <div className="h-1.5 bg-slate-300 rounded w-full mb-0.5" />
            <div className="h-1.5 bg-slate-300 rounded w-2/3" />
          </div>
        </div>
      </TemplateThumbnail>
      <TemplateThumbnail name="Minimal" active={value === "Minimal"} onClick={() => onChange("Minimal")} accentHsl={hsl}>
        <div className="p-2 h-full flex flex-col gap-1.5 text-[8px]">
          <div className="h-4 bg-slate-800 rounded w-2/3" style={{ fontFamily: "system-ui, sans-serif" }} />
          <div className="h-2 bg-slate-400 rounded w-full" />
          <div className="mt-1 h-2 bg-slate-300 rounded w-4/5" />
          <div className="h-2 bg-slate-300 rounded w-full" />
          <div className="mt-1 h-2 bg-slate-300 rounded w-3/4" />
        </div>
      </TemplateThumbnail>
    </div>
  );
}

export function ColorThemePicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-500">Accent:</span>
      {THEME_COLORS.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.id)}
          className={`w-7 h-7 rounded-full border-2 transition-all ${
            value === c.id ? "border-slate-700 ring-2 ring-slate-300" : "border-slate-200 hover:border-slate-400"
          }`}
          style={{ backgroundColor: c.hsl }}
          aria-label={`${c.name} theme`}
          title={c.name}
        />
      ))}
    </div>
  );
}
