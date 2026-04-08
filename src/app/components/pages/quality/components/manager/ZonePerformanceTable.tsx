import { useState } from "react";
import { Map, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { ZONE_DATA } from "../../data/mockData";
import type { ZoneMetric, QualityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: QualityTerminology;
}

type SortKey = "compliance_pct" | "violation_count" | "zone_name" | "trend_delta_pct";

export const ZonePerformanceTable = ({ terminology }: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>("compliance_pct");
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...ZONE_DATA].sort((a, b) => {
    const av = a[sortKey] as number | string;
    const bv = b[sortKey] as number | string;
    if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av;
    return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <Minus className="w-2.5 h-2.5 inline opacity-25 ml-0.5" />;
    return sortAsc
      ? <ArrowUp className="w-2.5 h-2.5 inline ml-0.5" />
      : <ArrowDown className="w-2.5 h-2.5 inline ml-0.5" />;
  };

  return (
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-50">
        <Map className="w-3.5 h-3.5 text-[#00775B]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Zone Performance</span>
        <span className="ml-auto text-[10px] text-neutral-400">Click column headers to sort</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[580px] text-xs">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/80">
              <th
                className="pl-4 pr-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 cursor-pointer hover:text-neutral-700"
                onClick={() => handleSort("zone_name")}
              >
                Zone <SortIcon col="zone_name" />
              </th>
              <th
                className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 cursor-pointer hover:text-neutral-700"
                onClick={() => handleSort("compliance_pct")}
              >
                {terminology.primaryMetricLabel} <SortIcon col="compliance_pct" />
              </th>
              <th
                className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 cursor-pointer hover:text-neutral-700"
                onClick={() => handleSort("violation_count")}
              >
                {terminology.negativeCountLabel} <SortIcon col="violation_count" />
              </th>
              <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">
                Top {terminology.negativeEventLabel}
              </th>
              <th className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">
                Peak Hour
              </th>
              <th
                className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 cursor-pointer hover:text-neutral-700"
                onClick={() => handleSort("trend_delta_pct")}
              >
                Trend <SortIcon col="trend_delta_pct" />
              </th>
              <th className="pl-2 pr-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {sorted.map((zone) => {
              const isHighRisk = zone.status === "HIGH_RISK";
              const isGood = zone.compliance_pct >= 90;
              const compColor = isHighRisk ? "text-red-600" : isGood ? "text-emerald-600" : "text-amber-600";
              const statusLabel = isHighRisk ? "HIGH RISK" : isGood ? "NORMAL" : "WATCH";
              const statusBadge = isHighRisk
                ? "border-red-200 bg-red-50 text-red-700"
                : isGood
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700";

              return (
                <tr
                  key={zone.zone_id}
                  className={cn(
                    "transition-colors group border-l-2",
                    isHighRisk
                      ? "border-l-red-500 hover:bg-red-50/20"
                      : "border-l-transparent hover:bg-neutral-50/60"
                  )}
                >
                  <td className="pl-4 pr-2 py-3">
                    <div className="flex items-center gap-1.5">
                      {isHighRisk && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />}
                      <span className={cn("text-[12px] font-semibold", isHighRisk ? "text-red-800" : "text-neutral-800")}>
                        {zone.zone_name}
                      </span>
                    </div>
                    {zone.flag && (
                      <div className="text-[10px] text-amber-600 mt-0.5">{zone.flag}</div>
                    )}
                  </td>
                  <td className={cn("px-2 py-3 text-right font-data tabular-nums text-[15px] font-black", compColor)}>
                    {zone.compliance_pct.toFixed(1)}%
                  </td>
                  <td className="px-2 py-3 text-right font-data tabular-nums text-[13px] font-bold text-neutral-700">
                    {zone.violation_count}
                  </td>
                  <td className="px-2 py-3 text-[11px] text-neutral-500">{zone.top_violation_type}</td>
                  <td className="px-2 py-3 text-center font-data tabular-nums text-[11px] text-neutral-500">
                    {zone.peak_violation_hour}:00
                  </td>
                  <td className="px-2 py-3 text-center">
                    {zone.trend === "up" && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                        <ArrowUp className="w-3 h-3" />+{zone.trend_delta_pct}%
                      </span>
                    )}
                    {zone.trend === "down" && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-500">
                        <ArrowDown className="w-3 h-3" />{zone.trend_delta_pct}%
                      </span>
                    )}
                    {zone.trend === "stable" && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-neutral-400">
                        <Minus className="w-3 h-3" />Stable
                      </span>
                    )}
                  </td>
                  <td className="pl-2 pr-4 py-3 text-center">
                    <span className={cn("inline-flex h-5 items-center rounded-[2px] border px-1.5 text-[9px] font-black uppercase tracking-wide", statusBadge)}>
                      {statusLabel}
                    </span>
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
