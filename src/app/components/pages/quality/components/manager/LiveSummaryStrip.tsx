import { LIVE_STATUS, DEFECT_KPIS, COMPLIANCE_KPIS } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { Shield, AlertTriangle, MapPin, Wifi, Activity } from "lucide-react";

interface Props {
  terminology: QualityTerminology;
}

export const LiveSummaryStrip = ({ terminology }: Props) => {
  const status = LIVE_STATUS;
  const isDefect = terminology.isDefectApp;
  const d = DEFECT_KPIS;
  const c = COMPLIANCE_KPIS;

  const primaryRate = isDefect
    ? `${(100 - d.defect_rate_pct).toFixed(1)}%`
    : `${c.compliance_rate_pct.toFixed(1)}%`;

  const rateColor =
    status.compliance_status === "GREEN" ? "text-emerald-600" :
    status.compliance_status === "AMBER" ? "text-amber-600" : "text-red-600";

  const statusDot =
    status.compliance_status === "GREEN" ? "bg-emerald-500" :
    status.compliance_status === "AMBER" ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
      {/* Primary metric */}
      <div className="flex items-center gap-2">
        <span className={cn("w-2 h-2 rounded-full animate-pulse", statusDot)} />
        <Shield className={cn("w-3.5 h-3.5", rateColor)} />
        <span className={cn("text-[22px] font-black font-data tabular-nums leading-none", rateColor)}>
          {primaryRate}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400">
          {terminology.primaryMetricLabel}
        </span>
      </div>

      <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

      {/* Active violations */}
      <div className="flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
        <span className="font-data tabular-nums font-bold text-neutral-800 text-[13px]">
          {status.active_violations_last_5min}
        </span>
        <span className="text-[10px] text-neutral-400">
          {terminology.negativeEventLabel}s (5 min)
        </span>
      </div>

      <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

      {/* High-risk zones */}
      <div className="flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-red-500" />
        <span className={cn(
          "font-data tabular-nums font-bold text-[13px]",
          status.high_risk_zones_count > 0 ? "text-red-600" : "text-neutral-500"
        )}>
          {status.high_risk_zones_count}
        </span>
        <span className="text-[10px] text-neutral-400">{terminology.zoneRiskLabel}s</span>
        {status.high_risk_zones.length > 0 && (
          <span className="text-[10px] text-neutral-400 hidden md:inline">
            ({status.high_risk_zones.join(", ")})
          </span>
        )}
      </div>

      <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

      {/* Alert pills */}
      <div className="flex items-center gap-1.5">
        <Activity className="w-3.5 h-3.5 text-neutral-400" />
        <span className="inline-flex h-5 items-center rounded-[2px] bg-red-600 px-1.5 text-[9px] font-black text-white">
          C:{status.open_alerts.critical}
        </span>
        <span className="inline-flex h-5 items-center rounded-[2px] bg-orange-500 px-1.5 text-[9px] font-black text-white">
          H:{status.open_alerts.high}
        </span>
        <span className="inline-flex h-5 items-center rounded-[2px] bg-amber-400 px-1.5 text-[9px] font-black text-neutral-900">
          M:{status.open_alerts.medium}
        </span>
      </div>

      {/* Camera status — pushed right */}
      <div className="ml-auto flex items-center gap-1.5">
        <Wifi className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[11px] text-neutral-600 font-semibold font-data tabular-nums">
          {status.cameras_online}/{status.cameras_total} cameras
        </span>
        <span className="inline-flex h-5 items-center rounded-[2px] border border-emerald-200 bg-emerald-50 px-1.5 text-[9px] font-bold text-emerald-700">
          LIVE
        </span>
      </div>
    </div>
  );
};
