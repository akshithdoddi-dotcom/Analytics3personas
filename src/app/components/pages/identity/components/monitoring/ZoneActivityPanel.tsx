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

const STATUS_DOT: Record<string, string> = {
  GREEN:    "bg-emerald-500",
  AMBER:    "bg-amber-500",
  WATCH:    "bg-orange-500",
  CRITICAL: "bg-red-600",
};

const STATUS_TEXT: Record<string, string> = {
  GREEN:    "text-emerald-700",
  AMBER:    "text-amber-700",
  WATCH:    "text-orange-700",
  CRITICAL: "text-red-700",
};

const ZONE_TREND: Record<string, "up" | "down" | "stable"> = {
  z1: "up", z2: "stable", z3: "up", z4: "stable",
  z5: "stable", z6: "up", z7: "stable", z8: "down",
  z9: "stable", z10: "stable", z11: "stable", z12: "stable",
};

const LAST_EVENT: Record<string, string> = {
  z1: "just now", z2: "1m ago", z3: "2m ago", z4: "5m ago",
  z5: "3m ago", z6: "4m ago", z7: "2m ago", z8: "8m ago",
  z9: "12m ago", z10: "6m ago", z11: "15m ago", z12: "1m ago",
};

export const ZoneActivityPanel = ({ terminology, onCameraClick, onEntityClick }: Props) => (
  <Panel
    title="Zone Activity"
    icon={MapPin}
    info={`Live ${terminology.identLabel.toLowerCase()} counts per zone. Click any row to view camera feed.`}
  >
    <div className="overflow-x-auto -mx-4 -mb-4">
      <table className="w-full text-xs min-w-[480px]">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/80">
            <th className="pl-4 pr-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">
              Zone
            </th>
            <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-20">
              {terminology.identLabel}s
            </th>
            <th className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-8">
              Trend
            </th>
            <th className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">
              Threats
            </th>
            <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-20">
              Last Event
            </th>
            <th className="pl-2 pr-4 py-2 w-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50">
          {IDENTITY_ZONES.map(zone => {
            const dot = STATUS_DOT[zone.status] ?? STATUS_DOT.GREEN;
            const label = STATUS_TEXT[zone.status] ?? STATUS_TEXT.GREEN;
            const trend = ZONE_TREND[zone.zone_id] ?? "stable";
            const last = LAST_EVENT[zone.zone_id] ?? "—";
            const isCritical = zone.status === "CRITICAL";

            return (
              <tr
                key={zone.zone_id}
                onClick={() => onCameraClick?.(zone.zone_id)}
                className={cn(
                  "transition-colors group",
                  onCameraClick ? "cursor-pointer hover:bg-neutral-50" : "",
                  isCritical ? "bg-red-50/30" : ""
                )}
              >
                {/* Zone name + status dot */}
                <td className="pl-4 pr-2 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      dot,
                      isCritical && "animate-pulse"
                    )} />
                    <span className="font-semibold text-neutral-800">{zone.zone_name}</span>
                  </div>
                </td>

                {/* Count */}
                <td className="px-2 py-2.5 text-right">
                  <span className={cn("font-data font-black tabular-nums text-sm", label)}>
                    {zone.identifications}
                  </span>
                </td>

                {/* Trend */}
                <td className="px-2 py-2.5 text-center">
                  {trend === "up"     && <TrendingUp   className="w-3.5 h-3.5 text-red-400 inline" />}
                  {trend === "down"   && <TrendingDown  className="w-3.5 h-3.5 text-emerald-500 inline" />}
                  {trend === "stable" && <Minus         className="w-3.5 h-3.5 text-neutral-300 inline" />}
                </td>

                {/* Threat badges */}
                <td className="px-2 py-2.5">
                  <div className="flex items-center justify-center gap-1">
                    {zone.blacklist_hits > 0 && (
                      <button
                        onClick={e => { e.stopPropagation(); onEntityClick?.("blacklist"); }}
                        className="text-[8px] font-black font-data tabular-nums px-1.5 py-0.5 rounded-[2px] bg-red-600 text-white hover:bg-red-700 transition-colors"
                        title="View blacklist match"
                      >
                        BL:{zone.blacklist_hits}
                      </button>
                    )}
                    {zone.unknown > 0 && (
                      <button
                        onClick={e => { e.stopPropagation(); onEntityClick?.("unknown"); }}
                        className="text-[8px] font-black font-data tabular-nums px-1.5 py-0.5 rounded-[2px] bg-slate-500 text-white hover:bg-slate-600 transition-colors"
                        title="View unknowns"
                      >
                        ?{zone.unknown}
                      </button>
                    )}
                    {zone.denied > 0 && (
                      <span className="text-[8px] font-bold font-data tabular-nums px-1.5 py-0.5 rounded-[2px] bg-orange-100 text-orange-700 border border-orange-200">
                        ✗{zone.denied}
                      </span>
                    )}
                    {zone.blacklist_hits === 0 && zone.unknown === 0 && zone.denied === 0 && (
                      <span className="text-[9px] text-neutral-300">—</span>
                    )}
                  </div>
                </td>

                {/* Last event */}
                <td className="px-2 py-2.5 text-right">
                  <span className="text-[10px] text-neutral-400 font-data">{last}</span>
                </td>

                {/* Camera icon */}
                <td className="pl-2 pr-4 py-2.5 text-right">
                  <Camera className="w-3.5 h-3.5 text-neutral-300 group-hover:text-[#00775B] transition-colors inline" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </Panel>
);
