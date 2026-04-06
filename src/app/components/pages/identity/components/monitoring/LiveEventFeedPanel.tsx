import { useState } from "react";
import { Panel } from "../shared/Panel";
import { Radio } from "lucide-react";
import { IDENTITY_ALERTS } from "../../data/mockData";
import type { IdentityAlert, IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props { terminology: IdentityTerminology }

const TONE_MAP: Record<string, { bg: string; text: string; badge: string }> = {
  BLACKLIST_MATCH:    { bg: "bg-red-50",    text: "text-red-800",    badge: "bg-red-600 text-white" },
  STOLEN_PLATE:       { bg: "bg-red-50",    text: "text-red-800",    badge: "bg-red-600 text-white" },
  BOLO:               { bg: "bg-red-50",    text: "text-red-800",    badge: "bg-red-600 text-white" },
  VIP_DETECTED:       { bg: "bg-purple-50", text: "text-purple-800", badge: "bg-purple-600 text-white" },
  UNKNOWN_AT_ENTRY:   { bg: "bg-slate-50",  text: "text-slate-700",  badge: "bg-slate-500 text-white" },
  UNREGISTERED_PLATE: { bg: "bg-amber-50",  text: "text-amber-800",  badge: "bg-amber-500 text-white" },
  ACCESS_DENIED:      { bg: "bg-orange-50", text: "text-orange-800", badge: "bg-orange-500 text-white" },
  REPEATED_UNKNOWN:   { bg: "bg-amber-50",  text: "text-amber-800",  badge: "bg-amber-500 text-white" },
};

const EventRow = ({ alert, terminology }: { alert: IdentityAlert; terminology: IdentityTerminology }) => {
  const [expanded, setExpanded] = useState(false);
  const tone = TONE_MAP[alert.type] ?? TONE_MAP.UNKNOWN_AT_ENTRY;
  const typeLabel = alert.type.replace(/_/g, " ");

  return (
    <div
      className={cn("rounded-lg p-3 border cursor-pointer transition-colors", tone.bg, "border-neutral-100 hover:brightness-95")}
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0", tone.badge)}>
            {typeLabel}
          </span>
          <span className={cn("text-xs font-semibold truncate", tone.text)}>{alert.subject}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {alert.confidence && (
            <span className="text-[10px] text-neutral-500 font-mono">{alert.confidence}%</span>
          )}
          <span className="text-[10px] text-neutral-400 font-mono">{alert.timestamp}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] text-neutral-500">{alert.zone}</span>
        <span className="text-[10px] text-neutral-400">·</span>
        <span className="text-[10px] text-neutral-400">{alert.camera_id}</span>
        <span className={cn(
          "ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full",
          alert.severity === "CRITICAL" ? "bg-red-100 text-red-600" :
          alert.severity === "HIGH"     ? "bg-orange-100 text-orange-600" :
          alert.severity === "MEDIUM"   ? "bg-amber-100 text-amber-600" :
                                          "bg-blue-100 text-blue-600"
        )}>
          {alert.severity}
        </span>
      </div>
      {expanded && (
        <p className={cn("mt-2 text-xs leading-relaxed", tone.text)}>{alert.message}</p>
      )}
    </div>
  );
};

export const LiveEventFeedPanel = ({ terminology }: Props) => (
  <Panel
    title="Live Event Feed"
    icon={Radio}
    info="Real-time identity events from all cameras. Click an event to expand details."
  >
    <div className="flex flex-col gap-2">
      {IDENTITY_ALERTS.map((alert) => (
        <EventRow key={alert.id} alert={alert} terminology={terminology} />
      ))}
    </div>
  </Panel>
);
