import { cn } from "@/app/lib/utils";
import { Package, AlertCircle, TrendingDown, Activity, Eye, Shield, MapPin, type LucideIcon } from "lucide-react";
import { DEFECT_KPIS, COMPLIANCE_KPIS } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";

interface Props {
  terminology: QualityTerminology;
}

interface Tile {
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  icon: LucideIcon;
  accent?: "red" | "amber" | "emerald" | "neutral";
}

export const PrimaryKPIRow = ({ terminology }: Props) => {
  const isDefect = terminology.isDefectApp;
  const d = DEFECT_KPIS;
  const c = COMPLIANCE_KPIS;

  const tiles: Tile[] = isDefect
    ? [
        {
          label: "Total Inspected",
          value: d.total_inspected.toLocaleString(),
          delta: `+${d.total_inspected - d.vs_yesterday.total_inspected} vs yesterday`,
          deltaPositive: true,
          icon: Package,
          accent: "neutral",
        },
        {
          label: "Defect Count",
          value: d.defect_count.toLocaleString(),
          delta: `${d.defect_count - d.vs_yesterday.defect_count < 0 ? "" : "+"}${d.defect_count - d.vs_yesterday.defect_count} vs yesterday`,
          deltaPositive: d.defect_count < d.vs_yesterday.defect_count,
          icon: AlertCircle,
          accent: d.defect_count > d.vs_yesterday.defect_count ? "red" : "emerald",
        },
        {
          label: "Defect Rate",
          value: `${d.defect_rate_pct.toFixed(1)}%`,
          delta: `${d.defect_rate_pct < d.vs_yesterday.defect_rate_pct ? "↓" : "↑"} ${Math.abs(d.defect_rate_pct - d.vs_yesterday.defect_rate_pct).toFixed(1)}% vs yesterday`,
          deltaPositive: d.defect_rate_pct < d.vs_yesterday.defect_rate_pct,
          icon: TrendingDown,
          accent: d.defect_rate_pct > 2.5 ? "red" : d.defect_rate_pct > 1.5 ? "amber" : "emerald",
        },
        {
          label: "Defect Density",
          value: `${d.defect_density_pct.toFixed(1)}%`,
          delta: `Avg defect area per item`,
          deltaPositive: d.defect_density_pct < d.vs_yesterday.defect_density_pct,
          icon: Activity,
          accent: d.defect_density_pct > 3 ? "red" : d.defect_density_pct > 2 ? "amber" : "neutral",
        },
      ]
    : [
        {
          label: "Total Observations",
          value: c.total_observations.toLocaleString(),
          delta: `+${c.total_observations - c.vs_yesterday.total_observations} vs yesterday`,
          deltaPositive: true,
          icon: Eye,
          accent: "neutral",
        },
        {
          label: "Violations Today",
          value: c.violation_count.toLocaleString(),
          delta: `${c.violation_count < c.vs_yesterday.violation_count ? "↓" : "↑"} ${Math.abs(c.violation_count - c.vs_yesterday.violation_count)} vs yesterday`,
          deltaPositive: c.violation_count < c.vs_yesterday.violation_count,
          icon: AlertCircle,
          accent: c.violation_count > 50 ? "red" : c.violation_count > 30 ? "amber" : "emerald",
        },
        {
          label: "Compliance Rate",
          value: `${c.compliance_rate_pct.toFixed(1)}%`,
          delta: `${c.compliance_rate_pct > c.vs_yesterday.compliance_rate_pct ? "↑" : "↓"} ${Math.abs(c.compliance_rate_pct - c.vs_yesterday.compliance_rate_pct).toFixed(1)}% vs yesterday`,
          deltaPositive: c.compliance_rate_pct > c.vs_yesterday.compliance_rate_pct,
          icon: Shield,
          accent: c.compliance_rate_pct >= 90 ? "emerald" : c.compliance_rate_pct >= 80 ? "amber" : "red",
        },
        {
          label: "High-Risk Zones",
          value: c.high_risk_zones.toString(),
          delta: `${c.high_risk_zones < c.vs_yesterday.high_risk_zones ? "↓" : c.high_risk_zones === c.vs_yesterday.high_risk_zones ? "—" : "↑"} vs yesterday (${c.vs_yesterday.high_risk_zones})`,
          deltaPositive: c.high_risk_zones < c.vs_yesterday.high_risk_zones,
          icon: MapPin,
          accent: c.high_risk_zones > 2 ? "red" : c.high_risk_zones > 0 ? "amber" : "emerald",
        },
      ];

  const accentNumber = (accent?: string) => {
    if (accent === "red") return "text-red-700";
    if (accent === "amber") return "text-amber-600";
    if (accent === "emerald") return "text-emerald-700";
    return "text-neutral-900";
  };

  const accentBorder = (accent?: string) => {
    if (accent === "red") return "border-red-200 bg-red-50/30";
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
              "bg-white rounded-[4px] border p-4 flex flex-col gap-2",
              accentBorder(tile.accent)
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400">
                {tile.label}
              </span>
              <Icon className="w-3.5 h-3.5 text-neutral-300" />
            </div>
            <div className={cn("text-5xl font-black font-data tabular-nums leading-none", accentNumber(tile.accent))}>
              {tile.value}
            </div>
            <div className={cn("text-[10px] font-semibold", tile.deltaPositive ? "text-emerald-600" : "text-red-500")}>
              {tile.delta}
            </div>
          </div>
        );
      })}
    </div>
  );
};
