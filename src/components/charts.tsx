"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const tooltipStyle = {
  background: "#18181b",
  border: "1px solid #27272a",
  borderRadius: 8,
  color: "#fff",
};

const axisTick = { fill: "#71717a", fontSize: 12 };
const axisTickSm = { fill: "#71717a", fontSize: 11 };

// ─── Revenue Area Chart ───────────────────────────────────────────────────

export function RevenueAreaChart({ data, id = "revGrad" }: { data: { month: string; revenue: number }[]; id?: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v}`, "Revenue"]} />
        <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill={`url(#${id})`} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Activity Bar Chart ───────────────────────────────────────────────────

export function ActivityBarChart({ data, dataKey = "users", barColor = "#3b82f6" }: { data: Record<string, unknown>[]; dataKey?: string; barColor?: string }) {
  const xKey = Object.keys(data[0] || {}).find((k) => k !== dataKey) || "label";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey={xKey} tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey={dataKey} fill={barColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── User Growth Line Chart ───────────────────────────────────────────────

export function GrowthLineChart({ data, dataKey = "users", lineColor = "#3b82f6" }: { data: Record<string, unknown>[]; dataKey?: string; lineColor?: string }) {
  const xKey = Object.keys(data[0] || {}).find((k) => k !== dataKey) || "label";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey={xKey} tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey={dataKey} stroke={lineColor} strokeWidth={2} dot={{ fill: lineColor, r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Earnings Stacked Bar Chart ───────────────────────────────────────────

export function EarningsBarChart({ data }: { data: { month: string; sessions: number; packages: number; classes: number; content: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v}`} />
        <Legend wrapperStyle={{ color: "#a1a1aa", fontSize: 12 }} />
        <Bar dataKey="sessions" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Sessions" />
        <Bar dataKey="packages" fill="#22c55e" radius={[4, 4, 0, 0]} name="Packages" />
        <Bar dataKey="classes" fill="#a855f7" radius={[4, 4, 0, 0]} name="Classes" />
        <Bar dataKey="content" fill="#f97316" radius={[4, 4, 0, 0]} name="Content Sales" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Small Engagement Line Chart ──────────────────────────────────────────

export function SmallLineChart({ data, dataKey = "value", lineColor = "#a855f7" }: { data: Record<string, unknown>[]; dataKey?: string; lineColor?: string }) {
  const xKey = Object.keys(data[0] || {}).find((k) => k !== dataKey) || "label";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey={xKey} tick={axisTickSm} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey={dataKey} stroke={lineColor} strokeWidth={2} dot={{ fill: lineColor, r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Small Bar Chart ──────────────────────────────────────────────────────

export function SmallBarChart({ data, dataKey = "value", barColor = "#3b82f6" }: { data: Record<string, unknown>[]; dataKey?: string; barColor?: string }) {
  const xKey = Object.keys(data[0] || {}).find((k) => k !== dataKey) || "label";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey={xKey} tick={axisTickSm} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey={dataKey} fill={barColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
