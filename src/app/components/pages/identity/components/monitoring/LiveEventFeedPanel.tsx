import { useState, useMemo } from "react";
import { Panel } from "../shared/Panel";
import { ShieldAlert, Eye, Siren, Clock } from "lucide-react";
import { IDENTITY_ALERTS } from "../../data/mockData";
import type { IdentityAlert, IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

type FilterKey = "ALL" | "CRITICAL" | "HIGH" | "UNKNOWNS";

/** Convert absolute timestamp "HH:MM:SS" → human-readable age */
function timeAgo(ts: string): string {
  const parts = ts.split(":").map(Number);
  const [h, m] = parts;
  const now = new Date();
  const then = new Date();
  then.setHours(h, m, 0, 0);
  const diffMin = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 60_000));
  if (diffMin === 0) return "just now";
  if (diffMin === 1) return "1m ago";
  if (diffMin < 60) return `${diffMin}m ago`;
  const hrs = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  return mins > 0 ? `${hrs}h ${mins}m ago` : `${hrs}h ago`;
}

const SEVERITY_CFG = {
  CRITICAL: {
    border: "border-l-red-600",
    bg: "bg-red-50",
    text: "text-red-800",
    badge: "bg-red-600 text-white",
    dispatchBtn: "bg-red-600 text-white hover:bg-red-700",
    ring: "ring-2 ring-red-200 ring-offset-1",
  },
  HIGH: {
    border: "border-l-orange-500",
    bg: "bg-orange-50",
    text: "text-orange-800",
    badge: "bg-orange-500 text-white",
    dispatchBtn: "bg-orange-500 text-white hover:bg-orange-600",
    ring: "",
  },
  MEDIUM: {
    border: "border-l-amber-400",
    bg: "bg-amber-50",
    text: "text-amber-800",
    badge: "bg-amber-500 text-white",
    dispatchBtn: "",
    ring: "",
  },
  LOW: {
    border: "border-l-blue-300",
    bg: "bg-blue-50/60",
    text: "text-blue-800",
    badge: "bg-blue-400 text-white",
    dispatchBtn: "",
    ring: "",
  },
} as const;

function resolveEntityType(alert: IdentityAlert): "matched" | "unknown" | "blacklist" {
  if (["BLACKLIST_MATCH", "STOLEN_PLATE", "BOLO"].includes(alert.type)) return "blacklist";
  if (["UNKNOWN_AT_ENTRY", "UNREGISTERED_PLATE", "REPEATED_UNKNOWN"].includes(alert.type)) return "unknown";
  return "matched";
}

const EventRow = ({
  alert,
  onEntityClick,
}: {
  alert: IdentityAlert;
  onEntityClick?: (type: "matched" | "unknown" | "blacklist") => void;
}) => {
  const cfg = SEVERITY_CFG[alert.severity as keyof typeof SEVERITY_CFG] ?? SEVERITY_CFG.LOW;
  const entityType = resolveEntityType(alert);
  const isActive = alert.status === "ACTIVE";
  const needsDispatch = isActive && (alert.severity === "CRITICAL" || alert.severity === "HIGH");

  return (
    <div className={cn(
      "border-l-4 rounded-r-lg p-3 border border-neutral-100 flex flex-col gap-2",
      cfg.border, cfg.bg, cfg.ring
    )}>
      {/* Row 1: severity badge + subject + time-ago */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0", cfg.badge)}>
            {alert.severity}
          </span>
          {isActive && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-400 text-emerald-600 bg-white uppercase tracking-wide shrink-0">
              LIVE
            </span>
          )}
          <span className={cn("text-xs font-bold truncate", cfg.text)}>
            {alert.subject}
          </span>
        </div>
        <span className="text-[10px] text-neutral-400 font-data shrink-0 flex items-center gap-0.5">
          <Clock className="w-3 h-3" />
          {timeAgo(alert.timestamp)}
        </span>
      </div>

      {/* Row 2: event type label + location context */}
      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
        <span className={cn("font-semibold", cfg.text)}>
          {alert.type.replace(/_/g, " ")}
        </span>
        <span className="text-neutral-300">·</span>
        <span className="text-neutral-600 font-medium">{alert.zone}</span>
        <span className="text-neutral-300">·</span>
        <span className="text-neutral-400">{alert.camera_id}</span>
        {alert.confidence != null && (
          <>
            <span className="text-neutral-300">·</span>
            <span className="font-data text-neutral-500">{alert.confidence}% conf</span>
          </>
        )}
      </div>

      {/* Row 3: inline action buttons — always visible, no click-to-expand needed */}
      {isActive && onEntityClick && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {needsDispatch && (
            <button
              onClick={(e) => { e.stopPropagation(); onEntityClick(entityType); }}
              className={cn(
                "flex items-center gap-1 h-6 px-2.5 rounded text-[10px] font-bold transition-colors shrink-0",
                cfg.dispatchBtn
              )}
            >
              <Siren className="w-3 h-3" />
              {entityType === "blacklist" ? "Dispatch Security" : "Investigate"}
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onEntityClick(entityType); }}
            className="flex items-center gap-1 h-6 px-2.5 rounded border border-neutral-200 bg-white text-[10px] font-semibold text-neutral-700 hover:border-[#00775B] hover:text-[#00775B] transition-colors"
          >
            <Eye className="w-3 h-3" />
            View Details
          </button>
        </div>
      )}
    </div>
  );
};

interface Props {
  terminology: IdentityTerminology;
  onEntityClick?: (type: "matched" | "unknown" | "blacklist") => void;
}

export const LiveEventFeedPanel = ({ terminology, onEntityClick }: Props) => {
  const [filter, setFilter] = useState<FilterKey>("ALL");

  const critCount = IDENTITY_ALERTS.filter(
    (a) => a.severity === "CRITICAL" && a.status === "ACTIVE"
  ).length;

  const filtered = useMemo(() => {
    // Always sort by severity first
    const priority = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    const sorted = [...IDENTITY_ALERTS].sort(
      (a, b) =>
        (priority[a.severity as keyof typeof priority] ?? 3) -
        (priority[b.severity as keyof typeof priority] ?? 3)
    );
    if (filter === "CRITICAL") return sorted.filter((a) => a.severity === "CRITICAL");
    if (filter === "HIGH") return sorted.filter((a) => a.severity === "CRITICAL" || a.severity === "HIGH");
    if (filter === "UNKNOWNS")
      return sorted.filter((a) =>
        ["UNKNOWN_AT_ENTRY", "UNREGISTERED_PLATE", "REPEATED_UNKNOWN"].includes(a.type)
      );
    return sorted;
  }, [filter]);

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "CRITICAL", label: critCount > 0 ? `Critical (${critCount})` : "Critical" },
    { key: "HIGH", label: "High" },
    { key: "UNKNOWNS", label: terminology.isLPR ? "Unregistered" : "Unknowns" },
  ];

  return (
    <Panel
      title="Security Triage Feed"
      icon={ShieldAlert}
      info="Real-time security events sorted by severity. Inline action buttons — no click-to-expand needed."
      headerRight={
        <div className="flex items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "h-5 px-1.5 rounded text-[9px] font-bold transition-colors whitespace-nowrap",
                filter === f.key
                  ? f.key === "CRITICAL" && critCount > 0
                    ? "bg-red-600 text-white"
                    : "bg-[#00775B] text-white"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-xs">
            No {filter === "ALL" ? "" : filter.toLowerCase()} events active
          </div>
        ) : (
          filtered.map((alert) => (
            <EventRow
              key={alert.id}
              alert={alert}
              onEntityClick={onEntityClick}
            />
          ))
        )}
      </div>
    </Panel>
  );
};
