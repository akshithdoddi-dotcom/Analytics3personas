import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { ALERTS } from "../../data/mockData";
import type { QualityTerminology, AlertEvent } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: QualityTerminology;
}

type FilterTab = "All" | "CRITICAL" | "HIGH" | "MEDIUM";

function formatTs(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

const severityLeftBorder: Record<string, string> = {
  CRITICAL: "border-l-red-600",
  HIGH:     "border-l-orange-500",
  MEDIUM:   "border-l-amber-400",
  LOW:      "border-l-neutral-300",
};

const severityBadge: Record<string, string> = {
  CRITICAL: "bg-red-600 text-white",
  HIGH:     "bg-orange-500 text-white",
  MEDIUM:   "bg-amber-400 text-neutral-900",
  LOW:      "bg-neutral-200 text-neutral-600",
};

const statusBadge: Record<string, string> = {
  ACTIVE:       "border-red-200 bg-red-50 text-red-700",
  ACKNOWLEDGED: "border-amber-200 bg-amber-50 text-amber-700",
  RESOLVED:     "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export const AlertFeedPanel = ({ terminology: _terminology }: Props) => {
  const [filter, setFilter] = useState<FilterTab>("All");

  const sorted = [...ALERTS].sort(
    (a, b) => {
      const sev = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const sevDiff = (sev[b.severity as keyof typeof sev] ?? 0) - (sev[a.severity as keyof typeof sev] ?? 0);
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  );

  const filtered: AlertEvent[] =
    filter === "All" ? sorted : sorted.filter((a) => a.severity === filter);

  const tabs: FilterTab[] = ["All", "CRITICAL", "HIGH", "MEDIUM"];
  const counts: Record<FilterTab, number> = {
    All:      sorted.length,
    CRITICAL: sorted.filter((a) => a.severity === "CRITICAL").length,
    HIGH:     sorted.filter((a) => a.severity === "HIGH").length,
    MEDIUM:   sorted.filter((a) => a.severity === "MEDIUM").length,
  };

  return (
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-50">
        <div className="flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-[#00775B]" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Alert Feed</span>
          {counts.CRITICAL > 0 && (
            <span className="inline-flex h-5 items-center rounded-[2px] bg-red-600 px-1.5 text-[9px] font-black text-white animate-pulse">
              {counts.CRITICAL} CRITICAL
            </span>
          )}
        </div>
        {/* Filter chips */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "h-6 px-2.5 text-[10px] font-bold rounded-[2px] transition-all",
                filter === tab
                  ? tab === "CRITICAL" ? "bg-red-600 text-white"
                    : tab === "HIGH" ? "bg-orange-500 text-white"
                    : tab === "MEDIUM" ? "bg-amber-400 text-neutral-900"
                    : "bg-neutral-800 text-white"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              )}
            >
              {tab === "All" ? `All (${counts.All})` : `${tab} (${counts[tab]})`}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-xs">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/80">
              <th className="pl-4 pr-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-16">Time</th>
              <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-20">Severity</th>
              <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Alert</th>
              <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-24">Zone</th>
              <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Message</th>
              <th className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-28">Status</th>
              <th className="pl-2 pr-4 py-2 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {filtered.map((alert) => (
              <tr
                key={alert.id}
                className={cn(
                  "transition-colors group border-l-2",
                  severityLeftBorder[alert.severity],
                  alert.severity === "CRITICAL" ? "hover:bg-red-50/20" :
                  alert.severity === "HIGH" ? "hover:bg-orange-50/20" :
                  "hover:bg-neutral-50/60"
                )}
              >
                <td className="pl-4 pr-2 py-3">
                  <div className="font-data tabular-nums text-[11px] font-bold text-neutral-700">{formatTs(alert.timestamp)}</div>
                  <div className="text-[10px] text-neutral-400">{timeAgo(alert.timestamp)}</div>
                </td>
                <td className="px-2 py-3">
                  <span className={cn("inline-flex h-5 items-center rounded-[2px] px-1.5 text-[9px] font-black uppercase tracking-wide", severityBadge[alert.severity])}>
                    {alert.severity}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <div className="text-[12px] font-bold text-neutral-800">{alert.name}</div>
                  <div className="text-[10px] text-neutral-400 font-data tabular-nums">{alert.camera_id}</div>
                </td>
                <td className="px-2 py-3 text-[12px] text-neutral-600">{alert.zone}</td>
                <td className="px-2 py-3 text-[11px] text-neutral-500 max-w-xs truncate">{alert.message}</td>
                <td className="px-2 py-3 text-center">
                  <span className={cn("inline-flex h-5 items-center rounded-[2px] border px-1.5 text-[9px] font-black uppercase tracking-wide", statusBadge[alert.status])}>
                    {alert.status}
                  </span>
                </td>
                <td className="pl-2 pr-4 py-3">
                  <button className="opacity-0 group-hover:opacity-100 flex h-7 items-center gap-1.5 rounded-[4px] border border-neutral-200 bg-white px-2.5 text-[10px] font-bold text-neutral-600 transition-all hover:border-[#00775B] hover:text-[#00775B]">
                    <Check className="w-3 h-3" />
                    ACK
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
