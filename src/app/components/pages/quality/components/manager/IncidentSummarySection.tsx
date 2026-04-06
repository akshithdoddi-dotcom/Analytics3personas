import { useState } from "react";
import { Panel } from "../shared/Panel";
import { StatusBadge } from "../shared/StatusBadge";
import type { Severity } from "../shared/StatusBadge";
import { FileText } from "lucide-react";
import { ALERTS } from "../../data/mockData";
import type { QualityTerminology, AlertEvent } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: QualityTerminology;
}

type FilterTab = "All" | "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";

export const IncidentSummarySection = ({ terminology: _terminology }: Props) => {
  const [filter, setFilter] = useState<FilterTab>("All");

  const incidents = ALERTS.filter((a) => a.event_type === "INCIDENT");
  const all = ALERTS; // show all events for richer feed

  const filtered: AlertEvent[] =
    filter === "All" ? all : all.filter((a) => a.status === filter);

  const resolved = all.filter((a) => a.status === "RESOLVED").length;
  const open = all.filter((a) => a.status === "ACTIVE").length;
  const acknowledged = all.filter((a) => a.status === "ACKNOWLEDGED").length;
  // Avg resolution time (simulated)
  const avgResolutionMin = 23;

  const tabs: FilterTab[] = ["All", "ACTIVE", "ACKNOWLEDGED", "RESOLVED"];

  return (
    <Panel
      title="Incident Summary"
      icon={FileText}
      info="Summary of incidents and alerts with resolution tracking."
    >
      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Total", value: all.length,     color: "text-neutral-700", bg: "bg-neutral-50" },
          { label: "Open",  value: open,            color: "text-red-600",     bg: "bg-red-50" },
          { label: "Acknowledged", value: acknowledged, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Avg Resolution", value: `${avgResolutionMin}m`, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((stat) => (
          <div key={stat.label} className={cn("rounded-[4px] p-3 text-center border border-neutral-100", stat.bg)}>
            <p className={cn("text-2xl font-black", stat.color)}>{stat.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all",
              filter === tab
                ? "bg-neutral-800 text-white"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-100">
              {["ID", "Time", "Type", "Severity", "Zone", "Message", "Status"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] font-bold uppercase tracking-widest text-neutral-400 pb-2 pr-3 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((alert) => (
              <tr
                key={alert.id}
                className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors"
              >
                <td className="py-2.5 pr-3 font-mono text-[10px] text-neutral-500">{alert.id}</td>
                <td className="py-2.5 pr-3 text-neutral-500 whitespace-nowrap font-mono text-[10px]">
                  {new Date(alert.timestamp).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-2.5 pr-3 text-neutral-500">{alert.event_type}</td>
                <td className="py-2.5 pr-3">
                  <StatusBadge severity={alert.severity as Severity} />
                </td>
                <td className="py-2.5 pr-3 text-neutral-500">{alert.zone}</td>
                <td className="py-2.5 pr-3 text-neutral-500 max-w-xs truncate">{alert.message}</td>
                <td className="py-2.5">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      alert.status === "ACTIVE"
                        ? "bg-red-100 text-red-700"
                        : alert.status === "ACKNOWLEDGED"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    )}
                  >
                    {alert.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};
