"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CommitData {
  _id: string;
  total: number;
}

export default function CommitLineChart({ data }: { data: CommitData[] }) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="_id" tick={{ fontSize: 10, fill: "var(--text-secondary)" }} />
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
          <Line
            type="monotone"
            dataKey="total"
            stroke="var(--brand)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
