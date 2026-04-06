import { Panel } from "../shared/Panel";
import { UserX } from "lucide-react";
import { UNKNOWN_TRACKERS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props { terminology: IdentityTerminology }

export const UnknownSummarySection = ({ terminology }: Props) => {
  const recurring = UNKNOWN_TRACKERS.filter((t) => t.badge === "RECURRING");
  return (
    <Panel
      title={`${terminology.unknownLabel} Summary`}
      icon={UserX}
      info="Active unknown individuals tracked today. Recurring individuals require investigation."
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-3xl font-black text-neutral-900">{UNKNOWN_TRACKERS.length}</span>
          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Active Trackers</span>
        </div>
        <div className="h-10 w-px bg-neutral-200" />
        <div className="flex flex-col gap-0.5">
          <span className="text-3xl font-black text-orange-600">{recurring.length}</span>
          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Recurring</span>
        </div>
        <div className="h-10 w-px bg-neutral-200" />
        <div className="flex flex-col gap-0.5">
          <span className="text-3xl font-black text-neutral-900">
            {UNKNOWN_TRACKERS.filter((t) => t.cross_camera).length}
          </span>
          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Cross-Camera</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="text-left py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">ID</th>
              <th className="text-left py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Appearances</th>
              <th className="text-left py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Cameras</th>
              <th className="text-left py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Last Seen</th>
              <th className="text-left py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Conf</th>
              <th className="text-left py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Badge</th>
            </tr>
          </thead>
          <tbody>
            {UNKNOWN_TRACKERS.map((tracker) => (
              <tr key={tracker.tracker_id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                <td className="py-2.5 px-2 font-bold text-neutral-700">{tracker.anonymized_label}</td>
                <td className="py-2.5 px-2 tabular-nums">{tracker.appearances}</td>
                <td className="py-2.5 px-2">
                  <div className="flex flex-wrap gap-1">
                    {tracker.cameras.map((c) => (
                      <span key={c} className="text-[9px] bg-neutral-100 text-neutral-600 rounded px-1.5 py-0.5">{c}</span>
                    ))}
                  </div>
                </td>
                <td className="py-2.5 px-2 font-mono text-neutral-500">{tracker.last_seen}</td>
                <td className={cn("py-2.5 px-2 font-semibold tabular-nums",
                  tracker.confidence < 70 ? "text-red-600" :
                  tracker.confidence < 80 ? "text-amber-600" : "text-emerald-600"
                )}>
                  {tracker.confidence}%
                </td>
                <td className="py-2.5 px-2">
                  {tracker.badge && (
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                      tracker.badge === "RECURRING" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {tracker.badge}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};
