import { Panel } from "../shared/Panel";
import { ShieldAlert, UserX, Ban } from "lucide-react";
import { IDENTITY_LIVE_STATUS, IDENTITY_ZONES, IDENTITY_ALERTS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: IdentityTerminology;
  onEntityClick?: (type: "matched" | "unknown" | "blacklist") => void;
}

export const BlacklistUnknownPanel = ({ terminology, onEntityClick }: Props) => {
  const status = IDENTITY_LIVE_STATUS;
  const totalDenied = IDENTITY_ZONES.reduce((s, z) => s + z.denied, 0);
  const topDeniedZone = [...IDENTITY_ZONES].sort((a, b) => b.denied - a.denied)[0];
  const blAlert = IDENTITY_ALERTS.find(
    (a) => (a.type === "BLACKLIST_MATCH" || a.type === "STOLEN_PLATE") && a.status === "ACTIVE"
  );

  return (
    <Panel
      title="Threat Overview"
      icon={ShieldAlert}
      info="Active security threats. Click any tile to view associated events and take action immediately."
    >
      <div className="grid grid-cols-3 gap-2">

        {/* ── Blacklist / BOLO Hits ── */}
        <button
          onClick={() => status.blacklist_matches > 0 && onEntityClick?.("blacklist")}
          className={cn(
            "rounded-lg p-4 flex flex-col items-center gap-1.5 border text-center w-full transition-all",
            status.blacklist_matches > 0
              ? "bg-red-50 border-red-200 hover:brightness-95 hover:shadow-md ring-2 ring-red-200 ring-offset-1 cursor-pointer"
              : "bg-neutral-50 border-neutral-200 cursor-default"
          )}
        >
          <ShieldAlert className={cn("w-5 h-5", status.blacklist_matches > 0 ? "text-red-600" : "text-neutral-300")} />
          <span className={cn(
            "text-4xl font-black font-data tabular-nums leading-none",
            status.blacklist_matches > 0 ? "text-red-700" : "text-neutral-700"
          )}>
            {status.blacklist_matches}
          </span>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest text-center leading-tight",
            status.blacklist_matches > 0 ? "text-red-600" : "text-neutral-400"
          )}>
            {terminology.blacklistLabel} Hits
          </span>
          <span className="text-[9px] text-neutral-400 leading-tight min-h-[2.5em]">
            {blAlert
              ? `${blAlert.zone} · ${blAlert.timestamp}`
              : "No active hits"}
          </span>
          {status.blacklist_matches > 0 && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded bg-red-600 text-white animate-pulse">
              DISPATCH →
            </span>
          )}
        </button>

        {/* ── Unknown / Unrecognised Count ── */}
        <button
          onClick={() => status.unknown_count > 0 && onEntityClick?.("unknown")}
          className={cn(
            "rounded-lg p-4 flex flex-col items-center gap-1.5 border text-center w-full transition-all",
            status.unknown_count > 0
              ? "bg-amber-50 border-amber-200 hover:brightness-95 hover:shadow-md cursor-pointer"
              : "bg-neutral-50 border-neutral-200 cursor-default"
          )}
        >
          <UserX className={cn("w-5 h-5", status.unknown_count > 0 ? "text-amber-600" : "text-neutral-300")} />
          <span className={cn(
            "text-4xl font-black font-data tabular-nums leading-none",
            status.unknown_count > 0 ? "text-amber-700" : "text-neutral-700"
          )}>
            {status.unknown_count}
          </span>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest text-center leading-tight",
            status.unknown_count > 0 ? "text-amber-600" : "text-neutral-400"
          )}>
            {terminology.unknownShortLabel}s Active
          </span>
          <span className="text-[9px] text-neutral-400 leading-tight min-h-[2.5em]">
            {status.unknown_count > 0 ? "Longest tracked: 5h 19m" : "No active unknowns"}
          </span>
          {status.unknown_count > 0 && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-500 text-white">
              TRACK →
            </span>
          )}
        </button>

        {/* ── Access Denied Today ── */}
        <button
          onClick={() => {}}
          className={cn(
            "rounded-lg p-4 flex flex-col items-center gap-1.5 border text-center w-full transition-all",
            totalDenied > 10
              ? "bg-orange-50 border-orange-200 hover:brightness-95 hover:shadow-md cursor-pointer"
              : "bg-neutral-50 border-neutral-200 cursor-default"
          )}
        >
          <Ban className={cn("w-5 h-5", totalDenied > 10 ? "text-orange-600" : "text-neutral-300")} />
          <span className={cn(
            "text-4xl font-black font-data tabular-nums leading-none",
            totalDenied > 10 ? "text-orange-700" : "text-neutral-700"
          )}>
            {totalDenied}
          </span>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest text-center leading-tight",
            totalDenied > 10 ? "text-orange-600" : "text-neutral-400"
          )}>
            Access Denied Today
          </span>
          <span className="text-[9px] text-neutral-400 leading-tight min-h-[2.5em]">
            {topDeniedZone
              ? `Highest: ${topDeniedZone.zone_name} (${topDeniedZone.denied})`
              : "No denials"}
          </span>
          {totalDenied > 10 && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded bg-orange-500 text-white">
              REVIEW →
            </span>
          )}
        </button>

      </div>
    </Panel>
  );
};
