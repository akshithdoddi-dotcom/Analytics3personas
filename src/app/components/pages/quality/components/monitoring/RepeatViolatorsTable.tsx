import { useState } from "react";
import { Users, ChevronRight } from "lucide-react";
import { REPEAT_VIOLATORS } from "../../data/mockData";
import type { QualityTerminology, RepeatViolator } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { ViolatorDetailPanel } from "../panels/ViolatorDetailPanel";

interface Props {
  terminology: QualityTerminology;
}

function formatTs(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " · " +
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export const RepeatViolatorsTable = ({ terminology }: Props) => {
  const [selectedViolator, setSelectedViolator] = useState<RepeatViolator | null>(null);

  const sorted = [...REPEAT_VIOLATORS].sort((a, b) => b.violation_count - a.violation_count);

  return (
    <>
      <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-50">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#00775B]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
              {terminology.repeatOffenderLabel}s
            </span>
          </div>
          <span className="inline-flex h-5 items-center rounded-[2px] bg-amber-50 border border-amber-200 px-1.5 text-[9px] font-black uppercase tracking-wide text-amber-700">
            {sorted.filter(v => v.badge === "RECURRING").length} Recurring
          </span>
        </div>

        <div className="overflow-x-auto -mb-0">
          <table className="w-full min-w-[600px] text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/80">
                <th className="pl-4 pr-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-8">#</th>
                <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">{terminology.entityLabel}</th>
                <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Zones</th>
                <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Top {terminology.negativeEventLabel}</th>
                <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">{terminology.negativeCountLabel}</th>
                <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Days</th>
                <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Last Seen</th>
                <th className="pl-2 pr-4 py-2 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {sorted.map((v, i) => {
                const topType = Object.entries(v.violation_types).sort((a, b) => b[1] - a[1])[0];
                const isRecurring = v.badge === "RECURRING";
                return (
                  <tr
                    key={v.tracker_id}
                    onClick={() => setSelectedViolator(v)}
                    className={cn(
                      "transition-colors group cursor-pointer",
                      isRecurring ? "hover:bg-amber-50/40" : "hover:bg-neutral-50/60"
                    )}
                  >
                    <td className="pl-4 pr-2 py-3 text-[10px] font-bold text-neutral-300">{i + 1}</td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-6 h-6 rounded-[2px] flex items-center justify-center text-[9px] font-black",
                          isRecurring ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-500"
                        )}>
                          {v.tracker_id}
                        </div>
                        <span className="text-[12px] font-bold text-neutral-800">{v.anonymized_label}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap gap-1">
                        {v.zones.map(zone => (
                          <span key={zone} className="inline-flex h-5 items-center rounded-[2px] border border-neutral-200 bg-neutral-50 px-1.5 text-[9px] font-semibold text-neutral-600">
                            {zone}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 py-3 text-[12px] text-neutral-600">
                      {topType ? (
                        <span>
                          {topType[0]}
                          <span className="ml-1 font-data tabular-nums text-[10px] text-neutral-400">({topType[1]}×)</span>
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <span className="font-data tabular-nums text-[15px] font-black text-red-600">
                        {v.violation_count}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right font-data tabular-nums text-[12px] text-neutral-600">
                      {v.days_seen}d
                    </td>
                    <td className="px-2 py-3 text-right font-data tabular-nums text-[11px] text-neutral-400">
                      {formatTs(v.last_violation_ts)}
                    </td>
                    <td className="pl-2 pr-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {isRecurring && (
                          <span className="inline-flex h-5 items-center rounded-[2px] bg-amber-50 border border-amber-200 px-1.5 text-[9px] font-black text-amber-700">
                            RECURRING
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-[#00775B] transition-colors" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ViolatorDetailPanel
        violator={selectedViolator}
        onClose={() => setSelectedViolator(null)}
        terminology={terminology}
      />
    </>
  );
};
