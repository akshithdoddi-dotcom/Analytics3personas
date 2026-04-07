import { cn } from "@/app/lib/utils";
import {
  Package, AlertCircle, TrendingDown, Activity,
  Eye, Shield, MapPin, type LucideIcon,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis,
} from "recharts";
import { DEFECT_KPIS, COMPLIANCE_KPIS, DEFECT_HOURLY_TREND, HOURLY_DATA } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";

interface Props {
  terminology: QualityTerminology;
}

interface KPITile {
  label: string;
  definition: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  icon: LucideIcon;
  accent: "red" | "amber" | "emerald" | "neutral";
  chartData: { x: string; v: number }[];
  chartColor: string;
  chartMin?: number;
  chartMax?: number;
  unit?: string;
}

// ── small inline chart ─────────────────────────────────────────────────────
const Sparkline = ({
  data,
  color,
  min,
  max,
}: {
  data: { x: string; v: number }[];
  color: string;
  min?: number;
  max?: number;
}) => (
  <ResponsiveContainer width="100%" height={56}>
    <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <XAxis
        dataKey="x"
        tick={{ fontSize: 8, fill: "#94A3B8" }}
        axisLine={false}
        tickLine={false}
        interval="preserveStartEnd"
      />
      <Tooltip
        contentStyle={{ fontSize: 9, borderRadius: 4, padding: "2px 6px", border: "1px solid #e5e7eb" }}
        formatter={(v: number) => [v, ""]}
        labelStyle={{ fontSize: 8, color: "#94A3B8" }}
      />
      <Area
        type="monotone"
        dataKey="v"
        stroke={color}
        strokeWidth={1.5}
        fill={`url(#grad-${color.replace("#", "")})`}
        dot={false}
        isAnimationActive={false}
        domain={[min ?? "auto", max ?? "auto"]}
      />
    </AreaChart>
  </ResponsiveContainer>
);

// ── main component ─────────────────────────────────────────────────────────
export const PrimaryKPIRow = ({ terminology }: Props) => {
  const isDefect = terminology.isDefectApp;
  const d = DEFECT_KPIS;
  const c = COMPLIANCE_KPIS;

  const defectTiles: KPITile[] = [
    {
      label: "Total Inspected",
      definition: "Total number of items processed through the inspection line today",
      value: d.total_inspected.toLocaleString(),
      delta: `+${(d.total_inspected - d.vs_yesterday.total_inspected).toLocaleString()} vs yesterday`,
      deltaPositive: true,
      icon: Package,
      accent: "neutral",
      chartColor: "#00775B",
      chartData: DEFECT_HOURLY_TREND.map((h) => ({ x: h.hour, v: h.total_inspected })),
      unit: "items / hr",
    },
    {
      label: "Defect Count",
      definition: "Number of items with one or more detected defects",
      value: d.defect_count.toLocaleString(),
      delta: `${d.defect_count < d.vs_yesterday.defect_count ? "↓" : "↑"} ${Math.abs(d.defect_count - d.vs_yesterday.defect_count)} vs yesterday`,
      deltaPositive: d.defect_count < d.vs_yesterday.defect_count,
      icon: AlertCircle,
      accent: d.defect_count > d.vs_yesterday.defect_count ? "red" : "emerald",
      chartColor: "#EF4444",
      chartData: DEFECT_HOURLY_TREND.map((h) => ({ x: h.hour, v: h.defect_count })),
      unit: "defects / hr",
    },
    {
      label: "Defect Rate",
      definition: "Percentage of inspected items that contain at least one defect",
      value: `${d.defect_rate_pct.toFixed(1)}%`,
      delta: `${d.defect_rate_pct < d.vs_yesterday.defect_rate_pct ? "↓" : "↑"} ${Math.abs(d.defect_rate_pct - d.vs_yesterday.defect_rate_pct).toFixed(1)}pp vs yesterday`,
      deltaPositive: d.defect_rate_pct < d.vs_yesterday.defect_rate_pct,
      icon: TrendingDown,
      accent: d.defect_rate_pct > 2.5 ? "red" : d.defect_rate_pct > 1.5 ? "amber" : "emerald",
      chartColor: d.defect_rate_pct > 2.5 ? "#EF4444" : d.defect_rate_pct > 1.5 ? "#F59E0B" : "#00775B",
      chartData: DEFECT_HOURLY_TREND.map((h) => ({ x: h.hour, v: h.defect_rate })),
      chartMin: 0,
      chartMax: 5,
      unit: "defects / 100 items",
    },
    {
      label: "Defect Density",
      definition: "Average percentage of item surface area covered by defects",
      value: `${d.defect_density_pct.toFixed(1)}%`,
      delta: `${d.defect_density_pct < d.vs_yesterday.defect_density_pct ? "↓" : "↑"} ${Math.abs(d.defect_density_pct - d.vs_yesterday.defect_density_pct).toFixed(1)}pp vs yesterday`,
      deltaPositive: d.defect_density_pct < d.vs_yesterday.defect_density_pct,
      icon: Activity,
      accent: d.defect_density_pct > 3 ? "red" : d.defect_density_pct > 2 ? "amber" : "neutral",
      chartColor: d.defect_density_pct > 3 ? "#EF4444" : d.defect_density_pct > 2 ? "#F59E0B" : "#6366F1",
      chartData: DEFECT_HOURLY_TREND.map((h) => ({ x: h.hour, v: h.defect_density })),
      chartMin: 0,
      chartMax: 5,
      unit: "% area / item",
    },
  ];

  const complianceTiles: KPITile[] = [
    {
      label: "Total Observations",
      definition: "Total detection events recorded today",
      value: c.total_observations.toLocaleString(),
      delta: `+${(c.total_observations - c.vs_yesterday.total_observations).toLocaleString()} vs yesterday`,
      deltaPositive: true,
      icon: Eye,
      accent: "neutral",
      chartColor: "#00775B",
      chartData: HOURLY_DATA.slice(-8).map((h) => ({ x: h.label.slice(0, 2), v: 100 - h.violation_count })),
      unit: "events / hr",
    },
    {
      label: "Violations Today",
      definition: "Total non-compliant events detected today",
      value: c.violation_count.toLocaleString(),
      delta: `${c.violation_count < c.vs_yesterday.violation_count ? "↓" : "↑"} ${Math.abs(c.violation_count - c.vs_yesterday.violation_count)} vs yesterday`,
      deltaPositive: c.violation_count < c.vs_yesterday.violation_count,
      icon: AlertCircle,
      accent: c.violation_count > 50 ? "red" : c.violation_count > 30 ? "amber" : "emerald",
      chartColor: "#EF4444",
      chartData: HOURLY_DATA.slice(-8).map((h) => ({ x: h.label.slice(0, 2), v: h.violation_count })),
      unit: "violations / hr",
    },
    {
      label: "Compliance Rate",
      definition: "Percentage of observations rated as compliant",
      value: `${c.compliance_rate_pct.toFixed(1)}%`,
      delta: `${c.compliance_rate_pct > c.vs_yesterday.compliance_rate_pct ? "↑" : "↓"} ${Math.abs(c.compliance_rate_pct - c.vs_yesterday.compliance_rate_pct).toFixed(1)}pp vs yesterday`,
      deltaPositive: c.compliance_rate_pct > c.vs_yesterday.compliance_rate_pct,
      icon: Shield,
      accent: c.compliance_rate_pct >= 90 ? "emerald" : c.compliance_rate_pct >= 80 ? "amber" : "red",
      chartColor: c.compliance_rate_pct >= 90 ? "#00775B" : c.compliance_rate_pct >= 80 ? "#F59E0B" : "#EF4444",
      chartData: HOURLY_DATA.slice(-8).map((h) => ({ x: h.label.slice(0, 2), v: h.compliance_pct })),
      chartMin: 60,
      chartMax: 100,
      unit: "% compliant",
    },
    {
      label: "High-Risk Zones",
      definition: "Zones with compliance below 75% in the last hour",
      value: c.high_risk_zones.toString(),
      delta: `${c.high_risk_zones < c.vs_yesterday.high_risk_zones ? "↓" : c.high_risk_zones === c.vs_yesterday.high_risk_zones ? "—" : "↑"} vs yesterday (${c.vs_yesterday.high_risk_zones})`,
      deltaPositive: c.high_risk_zones < c.vs_yesterday.high_risk_zones,
      icon: MapPin,
      accent: c.high_risk_zones > 2 ? "red" : c.high_risk_zones > 0 ? "amber" : "emerald",
      chartColor: "#F97316",
      chartData: [3, 3, 4, 3, 3, 2, 2, c.high_risk_zones].map((v, i) => ({ x: `${i}`, v })),
      unit: "zones at risk",
    },
  ];

  const tiles = isDefect ? defectTiles : complianceTiles;

  const numColor = (accent: string) => {
    if (accent === "red") return "text-red-700";
    if (accent === "amber") return "text-amber-600";
    if (accent === "emerald") return "text-emerald-700";
    return "text-neutral-900";
  };

  const borderColor = (accent: string) => {
    if (accent === "red") return "border-red-200";
    if (accent === "amber") return "border-amber-200";
    if (accent === "emerald") return "border-emerald-200";
    return "border-neutral-200";
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <div
            key={tile.label}
            className={cn(
              "bg-white rounded-[4px] border shadow-sm flex flex-col",
              borderColor(tile.accent)
            )}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-1 flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400">
                    {tile.label}
                  </span>
                  <Icon className={cn("w-3.5 h-3.5 shrink-0",
                    tile.accent === "red" ? "text-red-400" :
                    tile.accent === "amber" ? "text-amber-400" :
                    tile.accent === "emerald" ? "text-emerald-500" : "text-neutral-300"
                  )} />
                </div>
                {/* Large number */}
                <div className={cn("mt-2 text-[40px] font-black font-data tabular-nums leading-none", numColor(tile.accent))}>
                  {tile.value}
                </div>
                {/* Delta */}
                <div className={cn("mt-1 text-[10px] font-semibold leading-tight",
                  tile.deltaPositive ? "text-emerald-600" : "text-red-500"
                )}>
                  {tile.delta}
                </div>
              </div>
            </div>

            {/* Sparkline chart */}
            <div className="px-0 pb-0 pt-1 flex-1">
              <Sparkline
                data={tile.chartData}
                color={tile.chartColor}
                min={tile.chartMin}
                max={tile.chartMax}
              />
            </div>

            {/* Footer unit label */}
            <div className="px-4 pb-3">
              <span className="text-[9px] text-neutral-300 font-semibold uppercase tracking-wide">
                {tile.unit}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
