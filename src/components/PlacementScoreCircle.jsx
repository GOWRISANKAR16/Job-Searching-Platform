import { useEffect, useState } from "react";

const RADIUS = 52;
const STROKE_WIDTH = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Standard Placement Score circle: clean ring, single color, centered label.
 * Score: large bold. Label: small uppercase letter-spaced. No gradient or glow.
 */
export default function PlacementScoreCircle({ score, size = 160 }) {
  const [strokeOffset, setStrokeOffset] = useState(CIRCUMFERENCE);
  const normalizedScore = Math.min(100, Math.max(0, Number(score) ?? 0));

  useEffect(() => {
    const targetOffset = CIRCUMFERENCE * (1 - normalizedScore / 100);
    const t = setTimeout(() => setStrokeOffset(targetOffset), 100);
    return () => clearTimeout(t);
  }, [normalizedScore]);

  const viewBoxSize = 116;
  const cx = viewBoxSize / 2;
  const cy = viewBoxSize / 2;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="w-full h-full"
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={RADIUS}
          fill="none"
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth={STROKE_WIDTH}
        />
        {/* Progress — single solid color (primary) */}
        <circle
          cx={cx}
          cy={cy}
          r={RADIUS}
          fill="none"
          stroke="hsl(245, 58%, 51%)"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeOffset}
          style={{
            transition: "stroke-dashoffset 600ms ease-out",
          }}
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center text-center pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <span className="text-3xl font-bold text-white tabular-nums leading-none">
          {normalizedScore}
        </span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-slate-400">
          Placement Score
        </span>
      </div>
    </div>
  );
}
