import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "pui/ui/chart";
import { cn } from "pui/lib/utils";

export type PuiChartSeries = { key: string; label: string; color?: string };

type PuiChartProps = {
  type?: "bar" | "line" | "area";
  data: Record<string, string | number>[];
  // Field used for the x axis labels
  xKey: string;
  series: PuiChartSeries[];
  legend?: boolean;
  className?: string;
};

// Bar, line or area chart with the theme's chart colours
export function PuiChart({ type = "bar", data, xKey, series, legend, className }: PuiChartProps) {
  const config: ChartConfig = Object.fromEntries(
    series.map((s, index) => [s.key, { label: s.label, color: s.color ?? `var(--chart-${(index % 5) + 1})` }]),
  );
  const grid = <CartesianGrid vertical={false} />;
  const axis = <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} />;
  const tooltip = <ChartTooltip content={<ChartTooltipContent />} />;
  const legendEl = legend ? <ChartLegend content={<ChartLegendContent />} /> : null;
  return (
    <ChartContainer config={config} className={cn("min-h-[200px] w-full", className)}>
      {type === "line" ? (
        <LineChart data={data}>
          {grid}
          {axis}
          {tooltip}
          {legendEl}
          {series.map((s) => (
            <Line key={s.key} dataKey={s.key} stroke={`var(--color-${s.key})`} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      ) : type === "area" ? (
        <AreaChart data={data}>
          {grid}
          {axis}
          {tooltip}
          {legendEl}
          {series.map((s) => (
            <Area
              key={s.key}
              dataKey={s.key}
              fill={`var(--color-${s.key})`}
              stroke={`var(--color-${s.key})`}
              fillOpacity={0.3}
            />
          ))}
        </AreaChart>
      ) : (
        <BarChart data={data}>
          {grid}
          {axis}
          {tooltip}
          {legendEl}
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} fill={`var(--color-${s.key})`} radius={4} />
          ))}
        </BarChart>
      )}
    </ChartContainer>
  );
}
