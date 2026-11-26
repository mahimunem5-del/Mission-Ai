import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export interface ChartSpec {
  type?: 'bar' | 'line' | 'pie';
  title?: string;
  data?: Array<Record<string, unknown>>;
  xKey?: string;
  yKeys?: string[];
  yKey?: string;
  nameKey?: string;
  valueKey?: string;
}

const NEUTRAL_PALETTE = ['#18181b', '#52525b', '#71717a', '#a1a1aa', '#3f3f46'];

export const ChartRenderer: React.FC<{ spec: ChartSpec }> = ({ spec }) => {
  const data = Array.isArray(spec?.data) ? spec.data : [];
  if (data.length === 0) {
    return (
      <div className="my-3 rounded-lg border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        No chart data available.
      </div>
    );
  }

  const chartType = spec.type || 'bar';
  const keys = Object.keys(data[0] || {});
  const xKey = spec.xKey || spec.nameKey || keys[0] || 'name';
  const yKeys = spec.yKeys && spec.yKeys.length > 0
    ? spec.yKeys
    : [spec.yKey || spec.valueKey || keys.find((k) => k !== xKey) || 'value'];

  const chartLabel =
    chartType === 'line' ? 'Line Chart' : chartType === 'pie' ? 'Pie Chart' : 'Bar Chart';

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-2.5">
        <span className="truncate text-xs font-semibold text-foreground">
          {spec.title || 'Data Visualization'}
        </span>
        <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {chartLabel}
        </span>
      </div>
      <div className="p-4">
        <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {yKeys.map((k, idx) => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stroke={NEUTRAL_PALETTE[idx % NEUTRAL_PALETTE.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          ) : chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={data}
                dataKey={yKeys[0]}
                nameKey={xKey}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {data.map((_, idx) => (
                  <Cell key={idx} fill={NEUTRAL_PALETTE[idx % NEUTRAL_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {yKeys.map((k, idx) => (
                <Bar
                  key={k}
                  dataKey={k}
                  fill={NEUTRAL_PALETTE[idx % NEUTRAL_PALETTE.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartRenderer;
