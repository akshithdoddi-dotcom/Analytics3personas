import { Panel } from "../shared/Panel";
import { MapPin, TrendingUp, TrendingDown, Minus, Camera } from "lucide-react";
import { IDENTITY_ZONES } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: IdentityTerminology;
  onCameraClick?: (cameraId?: string) => void;
  onEntityClick?: (type: "matched" | "unknown" | "blacklist") => void;
}

const STATUS_STYLE: Record<string, {
  border: string; bg: string; dot: string; label: string;
}> = {
  GREEN:    { border: "border-emerald-200", bg: "bg-emerald-50",  dot: "bg-emerald-500", label: "text-emerald-700" },
  AMBER:    { border: "border-amber-200",   bg: "bg-amber-50",    dot: "bg-amber-500",   label: "text-amber-700"   },
  WATCH:    { border: "border-orange-200",  bg: "bg-orange-50",   dot: "bg-orange-500",  label: "text-orange-700"  },
  CRITICAL: { border: "border-red-300",     bg: "bg-red-50",      dot: "bg-red-600",     label: "text-red-700"     },
};

// Mock trend per zone (derived from status + pattern)
const ZONE_TREND: Record<string, "up" | "down" | "stable"> = {
  z1: "up", z2: "stable", z3: "up",     z4: "stable",
  z5: "stable", z6: "up", z7: "stable", z8: "down",
  z9: "stable", z10: "stable", z11: "stable", z12: "stable",
};

// Mock last-event time
const LAST_EVENT: Record<string, string> = {
  z1: "just now", z2: "1m ago",  z3: "2m ago",  z4: "5m ago",
  z5: "3m ago",   z6: "4m ago",  z7: "2m ago",  z8: "8m ago",
  z9: "12m ago",  z10: "6m ago", z11: "15m ago", z12: "1m ago",
};

export const ZoneActivityPanel = ({ terminology, onCameraClick, onEntityClick }: Props) => (
  <Panel
    title="Zone Activity"
    icon={MapPin}
    info={`Live ${terminology.identLabel.toLowerCase()} counts per zone. Click zone → camera feed. BL / unknown badges are clickable.`}
  >
    <div className="grid grid-cols-2 gap-2">
      {IDENTITY_ZONES.map((zone) => {
        const style = STATUS_STYLE[zone.status] ?? STATUS_STYLE.GREEN;
        const trend = ZONE_TREND[zone.zone_id] ?? "stable";
        const lastEvent = LAST_EVENT[zone.zone_id] ?? "–";

        return (
          <div
            key={zone.zone_id}
            onClick={() => onCameraClick?.(zone.zone_id)}
            className={cn(
              "rounded-lg p-2.5 border flex flex-col gap-1.5 transition-all group",
              onCameraClick ? "cursor-pointer hover:shadow-md hover:brightness-95" : "",
              style.bg, style.border,
              zone.status === "CRITICAL" && "ring-2 ring-red-300 ring-offset-1"
            )}
          >
            {/* Zone name + status dot + camera icon */}
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                style.dot,
                zone.status === "CRITICAL" && "animate-pulse"
              )} />
              <span className="text-[9px] font-bold uppercase tracking-wide text-neutral-600 leading-tight truncate flex-1">
                {zone.zone_name}
              </span>
              <Camera className="w-3 h-3 text-neutral-300 group-hover:text-[#00775B] transition-colors shrink-0" />
            </div>

            {/* Count + trend arrow */}
            <div className="flex items-baseline gap-1">
              <span className={cn("text-xl font-black font-data tabular-nums", style.label)}>
                {zone.identifications}
              </span>
              {trend === "up"     && <TrendingUp   className="w-3.5 h-3.5 text-red-400 shrink-0" />}
              {trend === "down"   && <TrendingDown  className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
              {trend === "stable" && <Minus         className="w-3.5 h-3.5 text-neutral-300 shrink-0" />}
            </div>

            {/* Threat badges — clickable, stop propagation */}
            {(zone.blacklist_hits > 0 || zone.unknown > 0 || zone.denied > 0) && (
              <div className="flex items-center gap-1 flex-wrap">
                {zone.blacklist_hits > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEntityClick?.("blacklist"); }}
                    className="text-[8px] bg-red-600 text-white rounded px-1 py-0.5 font-bold font-data tabular-nums hover:bg-red-700 transition-colors"
                    title="View blacklist match"
                  >
                    BL:{zone.blacklist_hits}
                  </button>
                )}
                {zone.unknown > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEntityClick?.("unknown"); }}
                    className="text-[8px] bg-slate-500 text-white rounded px-1 py-0.5 font-bold font-data tabular-nums hover:bg-slate-600 transition-colors"
                    title="View unknown individuals"
                  >
                    ?{zone.unknown}
                  </button>
                )}
                {zone.denied > 0 && (
                  <span className="text-[8px] bg-orange-400 text-white rounded px-1 py-0.5 font-bold font-data tabular-nums">
                    ✗{zone.denied}
                  </span>
                )}
              </div>
            )}

            {/* Last event time */}
            <div className="text-[8px] text-neutral-400">
              {lastEvent}
            </div>
          </div>
        );
      })}
    </div>
  </Panel>
);
