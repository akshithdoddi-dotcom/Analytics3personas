import { IDENTITY_LIVE_STATUS, IDENTITY_KPI_CARDS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { ArrowRight, Activity, AlertTriangle, Camera, ShieldCheck } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface Props { terminology: IdentityTerminology }

export const LiveSummaryStrip = ({ terminology }: Props) => {
  const status = IDENTITY_LIVE_STATUS;
  const stats = [
    { label: `${terminology.identLabel}s Today`, value: IDENTITY_KPI_CARDS[0].value.toLocaleString(), color: "text-[#00775B]" },
    { label: `${terminology.blacklistLabel} Alerts`, value: String(status.blacklist_matches), color: status.blacklist_matches > 0 ? "text-red-600" : "text-neutral-700" },
    { label: `${terminology.unknownShortLabel}s Active`, value: String(status.unknown_count), color: status.unknown_count > 2 ? "text-amber-600" : "text-neutral-700" },
    { label: "Cameras Online", value: `${status.cameras_online}/${status.cameras_total}`, color: "text-neutral-700" },
  ];

  return (
    <div className="overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm">
      <div className="grid gap-6 bg-[linear-gradient(135deg,var(--primary-dark)_0%,var(--primary-main)_22%,var(--neutral-white)_22%,var(--neutral-white)_100%)] px-6 py-6 lg:grid-cols-[1.2fr,2fr]">
        <div className="rounded-md border border-white/10 bg-[rgba(0,30,24,0.92)] p-6 text-white">
          <div className="flex items-center gap-2 text-[12px] leading-[1.3] font-semibold uppercase tracking-[0.05em] text-[#79f2d0]">
            <Activity className="h-3.5 w-3.5" />
            Operations Snapshot
          </div>
          <p className="mt-3 text-[40px] leading-[1.2] font-bold font-data tabular-nums">{IDENTITY_KPI_CARDS[0].value.toLocaleString()}</p>
          <p className="mt-1 max-w-[40ch] text-[14px] leading-[1.5] text-white/70">{terminology.identLabel}s processed in the current operating window</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex h-10 items-center gap-1 rounded-[4px] bg-white/10 px-3 text-[12px] font-semibold text-white/85">
              <ShieldCheck className="h-3 w-3 text-[#79f2d0]" />
              Match accuracy {IDENTITY_KPI_CARDS[2].value}%
            </span>
            <span className="inline-flex h-10 items-center gap-1 rounded-[4px] bg-white/10 px-3 text-[12px] font-semibold text-white/85">
              <Camera className="h-3 w-3 text-[#79f2d0]" />
              {status.cameras_online}/{status.cameras_total} cameras online
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="rounded-md border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 [transition-timing-function:var(--ease-snappy)] hover:border-[var(--primary-main)] hover:shadow-[0_0_20px_var(--primary-glow)]">
              <span className="text-[12px] leading-[1.3] font-semibold uppercase tracking-[0.05em] text-neutral-500">{s.label}</span>
              <div className="mt-2 flex items-end justify-between gap-2">
                <span className={cn("text-[28px] leading-[1.2] font-bold font-data tabular-nums", s.color)}>{s.value}</span>
                {i === 1 && status.blacklist_matches > 0 && <AlertTriangle className="h-4 w-4 text-red-500" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 bg-[var(--neutral-50)] px-6 py-4 text-[14px] leading-[1.5]">
        <span className="text-neutral-500">Manager view follows the operational analytics style used in volume and zone pages.</span>
        <button className="flex h-10 items-center gap-1.5 rounded-[4px] border border-[var(--primary-main)] bg-white px-4 font-semibold text-[var(--primary-main)] transition-all duration-200 [transition-timing-function:var(--ease-snappy)] hover:-translate-y-px hover:shadow-[0_0_20px_var(--primary-glow)] active:scale-[0.98]">
          View all alerts <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
