"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type PRRiskBarChartData = {
  label: string;
  count: number;
};

export default function PRRiskBarChart({ data }: { data: PRRiskBarChartData[] }) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--text-secondary)" }} />
          <YAxis tick={{ fontSize: 10, fill: "var(--text-secondary)" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text-primary)"
            }}
            itemStyle={{ color: "var(--text-primary)" }}
            labelStyle={{ color: "var(--text-secondary)" }}
          />
          <Bar dataKey="count" fill="var(--warning)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
