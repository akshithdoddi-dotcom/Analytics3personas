import { ZONE_DATA } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { MapPin, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";

interface Props {
  terminology: QualityTerminology;
}

const ACTION_TAGS: Record<string, string> = {
  "Zone C — Forklift Corridor": "Process audit recommended",
  "Zone E — Chemical Bay": "Staffing review needed",
  "Zone B — Assembly": "Training recommended",
};

export const RiskZoneSummary = ({ terminology }: Props) => {
  const sorted = [...ZONE_DATA].sort((a, b) => a.compliance_pct - b.compliance_pct);

  return (
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-50">
        <MapPin className="w-3.5 h-3.5 text-[#00775B]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
          {terminology.zoneRiskLabel} Summary
        </span>
        <span className="ml-2 inline-flex h-5 items-center rounded-[2px] bg-red-600 px-1.5 text-[9px] font-black text-white">
          {sorted.filter(z => z.status === "HIGH_RISK").length} HIGH RISK
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-xs">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/80">
              <th className="pl-4 pr-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Zone</th>
              <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">{terminology.primaryMetricLabel}</th>
              <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">{terminology.negativeCountLabel}</th>
              <th className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">MoM Trend</th>
              <th className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Status</th>
              <th className="pl-2 pr-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Action Required</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {sorted.map((zone) => {
              const isHighRisk = zone.status === "HIGH_RISK";
              const isGood = zone.compliance_pct >= 90;
              const compColor = isHighRisk ? "text-red-600" : isGood ? "text-emerald-600" : "text-amber-600";
              const statusBg = isHighRisk
                ? "border-red-200 bg-red-50 text-red-700"
                : isGood
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700";
              const action = ACTION_TAGS[zone.zone_name];

              return (
                <tr
                  key={zone.zone_id}
                  className={cn(
                    "transition-colors border-l-2",
                    isHighRisk ? "border-l-red-500 hover:bg-red-50/20" : "border-l-transparent hover:bg-neutral-50/40"
                  )}
                >
                  <td className="pl-4 pr-2 py-3">
                    <div className="flex items-center gap-1.5">
                      {isHighRisk && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />}
                      <span className={cn("text-[12px] font-semibold", isHighRisk ? "text-red-800" : "text-neutral-800")}>
                        {zone.zone_name}
                      </span>
                    </div>
                  </td>
                  <td className={cn("px-2 py-3 text-right font-data tabular-nums text-[15px] font-black", compColor)}>
                    {zone.compliance_pct.toFixed(1)}%
                  </td>
                  <td className="px-2 py-3 text-right font-data tabular-nums text-[13px] font-bold text-neutral-700">
                    {zone.violation_count}
                  </td>
                  <td className="px-2 py-3 text-center">
                    {zone.trend === "up" && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                        <TrendingUp className="w-3 h-3" />+{zone.trend_delta_pct}%
                      </span>
                    )}
                    {zone.trend === "down" && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-500">
                        <TrendingDown className="w-3 h-3" />{zone.trend_delta_pct}%
                      </span>
                    )}
                    {zone.trend === "stable" && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-neutral-400">
                        <Minus className="w-3 h-3" />Stable
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-3 text-center">
                    <span className={cn("inline-flex h-5 items-center rounded-[2px] border px-1.5 text-[9px] font-black uppercase tracking-wide", statusBg)}>
                      {isHighRisk ? "HIGH RISK" : isGood ? "NORMAL" : "WATCH"}
                    </span>
                  </td>
                  <td className="pl-2 pr-4 py-3">
                    {action ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700">
                        <AlertTriangle className="w-3 h-3" />{action}
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
