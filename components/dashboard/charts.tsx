"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { ApplicationStatus } from "@/app/lib/dashboard-data"

const tooltipStyle = {
  backgroundColor: "#1a1a1f",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  color: "#ededef",
  fontSize: 12,
}

const axisTick = { fill: "#6e6e78", fontSize: 11 }

export function ApplicationStatusChart({
  data,
}: {
  data: { name: ApplicationStatus | string; value: number; color: string }[]
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative mx-auto h-[210px] w-full max-w-[240px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 240, height: 210 }}
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#ededef" }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-[#ededef]">{total}</span>
          <span className="text-[10px] tracking-wider text-[#6e6e78] uppercase">
            Applications
          </span>
        </div>
      </div>

      <ul className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
        {data.map((item) => (
          <li key={item.name} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="flex-1 truncate text-[#a0a0ab]">{item.name}</span>
            <span className="font-semibold text-[#ededef]">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ApplicantsBarChart({
  data,
}: {
  data: { job: string; applicants: number }[]
}) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 640, height: 260 }}
      >
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="job" tick={axisTick} axisLine={false} tickLine={false} interval={0} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="applicants" name="Applicants" radius={[6, 6, 0, 0]} maxBarSize={42}>
            {data.map((entry, index) => (
              <Cell
                key={entry.job}
                fill={index === 1 ? "#5c53fe" : "#3d3a66"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function JobsByCategoryChart({
  data,
}: {
  data: { category: string; jobs: number }[]
}) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 640, height: 240 }}
      >
        <BarChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="category" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="jobs" name="Jobs posted" radius={[6, 6, 0, 0]} fill="#5c53fe" maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RegistrationsChart({
  data,
}: {
  data: { day: string; users: number }[]
}) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 640, height: 240 }}
      >
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
          <defs>
            <linearGradient id="registrations-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5c53fe" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#5c53fe" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="day" tick={axisTick} axisLine={false} tickLine={false} minTickGap={16} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="users"
            name="New registrations"
            stroke="#8f88ff"
            strokeWidth={2}
            fill="url(#registrations-fill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
