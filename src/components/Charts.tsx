import * as React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, Cell, ReferenceLine, Legend } from 'recharts';

const NAVY = '#0b2745';
const GOLD = '#c8a45d';

function TooltipBox({ active, payload, label, suffix = '%' }: { active?: boolean; payload?: Array<{ value: number; name?: string; color?: string }>; label?: string | number; suffix?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tip">
      <b>{label}</b>
      {payload.map((p, i) => (
        <span key={i} style={{ color: p.color ?? GOLD }}>{p.name ? `${p.name}: ` : ''}{p.value}{suffix}</span>
      ))}
    </div>
  );
}

export function TrendChart({ data }: { data: Array<{ day: string; score: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee9df" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#8a8478' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#8a8478' }} tickLine={false} axisLine={false} width={28} />
        <Tooltip content={<TooltipBox />} />
        <ReferenceLine y={80} stroke="#d9d3c6" strokeDasharray="4 4" />
        <Line type="monotone" dataKey="score" stroke={GOLD} strokeWidth={3} dot={{ r: 2, fill: GOLD }} activeDot={{ r: 5 }} name="score" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryRadar({ data }: { data: Array<{ cat: string; score: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="#e3ddd1" />
        <PolarAngleAxis dataKey="cat" tick={{ fontSize: 10, fill: NAVY }} />
        <Radar dataKey="score" stroke={GOLD} fill={GOLD} fillOpacity={0.28} strokeWidth={2} />
        <Tooltip content={<TooltipBox />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function RecentBars({ data }: { data: Array<{ label: string; score: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee9df" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#8a8478' }} tickLine={false} axisLine={false} interval={0} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#8a8478' }} tickLine={false} axisLine={false} width={28} />
        <Tooltip content={<TooltipBox />} />
        <Bar dataKey="score" radius={[5, 5, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.score >= 80 ? '#2f9e63' : d.score >= 60 ? GOLD : '#c0564a'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryBars({ data }: { data: Array<{ cat: string; score: number }> }) {
  return (
    <div className="cat-bars">
      {data.map((d) => (
        <div className="cat-bar" key={d.cat}>
          <span className="cat-bar-name">{d.cat}</span>
          <div className="cat-bar-track">
            <div className="cat-bar-fill" style={{ width: `${d.score}%`, background: d.score >= 80 ? '#2f9e63' : d.score >= 60 ? GOLD : '#c0564a' }} />
          </div>
          <b>{d.score}%</b>
        </div>
      ))}
    </div>
  );
}

export { Legend };
