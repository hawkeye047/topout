'use client';

export default function ProgressRing({ value, size = 64, stroke = 3 }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18" cy="18" r={r}
          fill="none"
          stroke="#3a4a5f"
          strokeWidth={stroke}
        />
        <circle
          cx="18" cy="18" r={r}
          fill="none"
          stroke="#ffc174"
          strokeWidth={stroke}
          strokeDasharray={`${(value / 100) * 100}, 100`}
          strokeLinecap="butt"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-headline font-extrabold tracking-tighter text-on-surface">
          {value}%
        </span>
      </div>
    </div>
  );
}
