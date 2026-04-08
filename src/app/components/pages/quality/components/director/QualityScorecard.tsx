import { ClipboardList } from "lucide-react";
import { SCORECARD_DATA } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: QualityTerminology;
}

const STATUS_BADGE: Record<string, string> = {
  ON_TRACK:   "border-emerald-200 bg-emerald-50 text-emerald-700",
  WATCH:      "border-amber-200 bg-amber-50 text-amber-700",
  OFF_TARGET: "border-red-200 bg-red-50 text-red-700",
};

const STATUS_LEFT: Record<string, string> = {
  ON_TRACK:   "border-l-transparent",
  WATCH:      "border-l-amber-400",
  OFF_TARGET: "border-l-red-500",
};

const STATUS_LABEL: Record<string, string> = {
  ON_TRACK:   "On Track",
  WATCH:      "Watch",
  OFF_TARGET: "Off Target",
};

export const QualityScorecard = ({ terminology: _terminology }: Props) => {
  const onTrack   = SCORECARD_DATA.filter((r) => r.status === "ON_TRACK").length;
  const watch     = SCORECARD_DATA.filter((r) => r.status === "WATCH").length;
  const offTarget = SCORECARD_DATA.filter((r) => r.status === "OFF_TARGET").length;

  const formatValue = (value: number, unit: string) => {
    if (unit === "%") return `${value.toFixed(1)}%`;
    if (unit === "USD") return `$${value.toLocaleString()}`;
    return `${value.toLocaleString()} ${unit}`;
  };

  return (
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-50">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-3.5 h-3.5 text-[#00775B]" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Quality Scorecard</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold">
          <span className="text-emerald-600">{onTrack} On Track</span>
          <span className="text-neutral-200">·</span>
          <span className="text-amber-600">{watch} Watch</span>
          <span className="text-neutral-200">·</span>
          <span className="text-red-500">{offTarget} Off Target</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[540px] text-xs">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/80">
              <th className="pl-4 pr-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Metric</th>
              <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">This Month</th>
              <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Last Month</th>
              <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Target</th>
              <th className="pl-2 pr-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {SCORECARD_DATA.map((row) => (
              <tr
                key={row.metric}
                className={cn("transition-colors group border-l-2 hover:bg-neutral-50/60", STATUS_LEFT[row.status])}
              >
                <td className="pl-4 pr-2 py-3 text-[12px] font-semibold text-neutral-700">{row.metric}</td>
                <td className="px-2 py-3 text-right font-data tabular-nums text-[13px] font-black text-neutral-900">
                  {formatValue(row.this_period, row.unit)}
                </td>
                <td className="px-2 py-3 text-right font-data tabular-nums text-[12px] text-neutral-500">
                  {formatValue(row.last_period, row.unit)}
                </td>
                <td className="px-2 py-3 text-right font-data tabular-nums text-[12px] text-neutral-400">
                  {formatValue(row.target, row.unit)}
                </td>
                <td className="pl-2 pr-4 py-3 text-center">
                  <span className={cn("inline-flex h-5 items-center rounded-[2px] border px-1.5 text-[9px] font-black uppercase tracking-wide", STATUS_BADGE[row.status])}>
                    {STATUS_LABEL[row.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
