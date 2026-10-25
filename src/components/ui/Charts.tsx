import React from 'react';

function scale(data: number[], w: number, h: number, pad = 2) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  return data.map((v, i) => [
    (i / Math.max(data.length - 1, 1)) * w,
    pad + (1 - (v - min) / range) * (h - pad * 2),
  ]);
}

function smooth(points: number[][]) {
  return points
    .map((p, i, a) => {
      if (i === 0) return `M${p[0]},${p[1]}`;
      const prev = a[i - 1];
      const cx = (prev[0] + p[0]) / 2;
      return `C${cx},${prev[1]} ${cx},${p[1]} ${p[0]},${p[1]}`;
    })
    .join(' ');
}

export function Sparkline({ data, color = '#2c9a69', className = '' }: { data: number[]; color?: string; className?: string }) {
  const w = 100,
    h = 40;
  const pts = scale(data, w, h, 3);
  const line = smooth(pts);
  const id = `sp-${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
    </svg>
  );
}

export function AreaChart({
  data,
  labels,
  secondary,
  height = 260,
  format = (n: number) => String(n),
}: {
  data: number[];
  labels: string[];
  secondary?: number[];
  height?: number;
  format?: (n: number) => string;
}) {
  const w = 700,
    h = height,
    padL = 44,
    padB = 26,
    padT = 10;
  const all = [...data, ...(secondary ?? [])];
  const max = Math.max(...all, 1) * 1.1;
  const x = (i: number) => padL + (i / Math.max(data.length - 1, 1)) * (w - padL - 8);
  const y = (v: number) => padT + (1 - v / max) * (h - padT - padB);
  const path = (arr: number[]) =>
    smooth(arr.map((v, i) => [x(i), y(v)]));
  const main = path(data);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Trend chart">
      <defs>
        <linearGradient id="area-main" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2c9a69" stopOpacity=".28" />
          <stop offset="1" stopColor="#2c9a69" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={w - 8} y1={y(t)} y2={y(t)} stroke="#e9e7de" strokeDasharray="3 4" />
          <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#8f9c93">
            {format(Math.round(t))}
          </text>
        </g>
      ))}
      {secondary && <path d={path(secondary)} fill="none" stroke="#d3a843" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" />}
      <path d={`${main} L${x(data.length - 1)},${h - padB} L${x(0)},${h - padB} Z`} fill="url(#area-main)" />
      <path d={main} fill="none" stroke="#1e7b54" strokeWidth="2.6" strokeLinecap="round" />
      {data.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="3.2" fill="#fff" stroke="#1e7b54" strokeWidth="2" />
      ))}
      {labels.map((l, i) => (
        <text key={l + i} x={x(i)} y={h - 6} textAnchor="middle" fontSize="10.5" fill="#8f9c93">
          {l}
        </text>
      ))}
    </svg>
  );
}

export function BarChart({ data, labels, height = 200, color = '#1e7b54' }: { data: number[]; labels: string[]; height?: number; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-2.5" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-[10.5px] font-semibold text-ink-500 opacity-0 transition-opacity group-hover:opacity-100">{v}</span>
          <div
            className="w-full rounded-t-lg transition-all group-hover:opacity-80"
            style={{ height: `${(v / max) * 78}%`, background: `linear-gradient(180deg, ${color}, ${color}bb)` }}
          />
          <span className="text-[10.5px] text-ink-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function Donut({
  segments,
  size = 150,
  center,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  center?: React.ReactNode;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = 52,
    c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#f0eee6" strokeWidth="16" />
        {segments.map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={s.label}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="16"
              strokeDasharray={`${Math.max(len - 3, 0)} ${c - Math.max(len - 3, 0)}`}
              strokeDashoffset={-acc}
              strokeLinecap="round"
            />
          );
          acc += len;
          return el;
        })}
      </svg>
      {center && <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{center}</div>}
    </div>
  );
}
