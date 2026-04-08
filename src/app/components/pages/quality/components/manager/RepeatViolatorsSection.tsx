import { Users } from "lucide-react";
import { REPEAT_VIOLATORS } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: QualityTerminology;
}

export const RepeatViolatorsSection = ({ terminology }: Props) => {
  const recurringCount = REPEAT_VIOLATORS.filter((v) => v.badge === "RECURRING").length;

  return (
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-50">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-[#00775B]" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
            {terminology.repeatOffenderLabel}s
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-data tabular-nums">
          <span>
            <span className="font-black text-neutral-800">{REPEAT_VIOLATORS.length}</span>
            <span className="text-neutral-400 ml-1">total</span>
          </span>
          <span className="w-px h-3 bg-neutral-200" />
          <span>
            <span className="font-black text-amber-600">{recurringCount}</span>
            <span className="text-neutral-400 ml-1">recurring (4+ days)</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-xs">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/80">
              <th className="pl-4 pr-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">{terminology.entityLabel}</th>
              <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">{terminology.negativeCountLabel}</th>
              <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Days</th>
              <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Zones</th>
              <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Top Types</th>
              <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Last Seen</th>
              <th className="pl-2 pr-4 py-2 w-28" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {REPEAT_VIOLATORS.map((v) => {
              const isRecurring = v.badge === "RECURRING";
              const topTypes = Object.entries(v.violation_types).sort((a, b) => b[1] - a[1]);
              return (
                <tr
                  key={v.tracker_id}
                  className={cn(
                    "transition-colors group border-l-2",
                    isRecurring ? "border-l-amber-400 hover:bg-amber-50/20" : "border-l-transparent hover:bg-neutral-50/60"
                  )}
                >
                  <td className="pl-4 pr-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-6 h-6 rounded-[2px] flex items-center justify-center text-[9px] font-black shrink-0",
                        isRecurring ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-500"
                      )}>
                        {v.tracker_id}
                      </div>
                      <span className="text-[12px] font-bold text-neutral-800">{v.anonymized_label}</span>
                      {isRecurring && (
                        <span className="inline-flex h-5 items-center rounded-[2px] border border-amber-200 bg-amber-50 px-1.5 text-[9px] font-black uppercase text-amber-700">
                          RECURRING
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-right font-data tabular-nums text-[15px] font-black text-red-600">
                    {v.violation_count}
                  </td>
                  <td className="px-2 py-3 text-right font-data tabular-nums text-[12px] text-neutral-600">
                    {v.days_seen}d
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex flex-wrap gap-1">
                      {v.zones.map((z) => (
                        <span key={z} className="inline-flex h-5 items-center rounded-[2px] border border-neutral-200 bg-neutral-50 px-1.5 text-[9px] font-semibold text-neutral-600">
                          {z}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-[11px] text-neutral-500">
                    {topTypes.slice(0, 2).map(([t, c]) => `${t}(${c})`).join(", ")}
                  </td>
                  <td className="px-2 py-3 text-right font-data tabular-nums text-[10px] text-neutral-400">
                    {new Date(v.last_violation_ts).toLocaleString("en-GB", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </td>
                  <td className="pl-2 pr-4 py-3">
                    <button className="opacity-0 group-hover:opacity-100 h-7 rounded-[4px] border border-amber-200 bg-amber-50 px-2.5 text-[10px] font-bold text-amber-700 transition-all hover:bg-amber-100">
                      Flag for Review
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
