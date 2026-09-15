"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { label: string; value: number };

type SoloChartsProps = {
  data: Point[];
  title: string;
};

export function SoloBarChart({ data, title }: SoloChartsProps) {
  if (data.length === 0) {
    return (
      <p role="status" className="text-muted text-sm">
        Insufficient data
      </p>
    );
  }

  return (
    <figure className="space-y-2" aria-label={title}>
      <figcaption className="text-sm font-medium">{title}</figcaption>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="var(--solo-brand)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>{title} data table alternative</caption>
        <tbody>
          {data.map((point) => (
            <tr key={point.label}>
              <th scope="row">{point.label}</th>
              <td>{point.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
