import { Panel } from "../shared/Panel";
import { UserX, AlertTriangle, MapPin, Radio, Eye, ShieldPlus } from "lucide-react";
import { UNKNOWN_TRACKERS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: IdentityTerminology;
  onTrackerClick?: () => void;
}

/** Format "HH:MM" first_seen → "HH:MM" last_seen as "Xh Ym tracked" */
function formatDuration(firstSeen: string, lastSeen: string): string {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const diff = Math.max(0, toMin(lastSeen) - toMin(firstSeen));
  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m`;
  return "<1m";
}

export const UnknownTrackerPanel = ({ terminology, onTrackerClick }: Props) => {
  // Priority sort: RECURRING → NEW → null (ACTIVE)
  const priorityOrder: Record<string, number> = { RECURRING: 0, NEW: 1 };
  const sorted = [...UNKNOWN_TRACKERS].sort(
    (a, b) =>
      (priorityOrder[a.badge ?? ""] ?? 2) - (priorityOrder[b.badge ?? ""] ?? 2)
  );

  return (
    <Panel
      title={`${terminology.unknownLabel} Tracker`}
      icon={UserX}
      info="Unrecognized individuals actively tracked across cameras. Dispatch, add to watch, or clear — directly inline."
    >
      <div className="flex flex-col gap-2">
        {sorted.map((tracker) => {
          const duration = formatDuration(tracker.first_seen, tracker.last_seen);
          const isRecurring = tracker.badge === "RECURRING";
          const isNew = tracker.badge === "NEW";

          return (
            <div
              key={tracker.tracker_id}
              className={cn(
                "rounded-lg p-3 border",
                isRecurring
                  ? "bg-orange-50 border-orange-200"
                  : isNew
                  ? "bg-blue-50 border-blue-200"
                  : "bg-slate-50 border-slate-200"
              )}
            >
              {/* Row 1: badge + label + duration */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn(
                    "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0",
                    isRecurring ? "bg-orange-500 text-white" :
                    isNew       ? "bg-blue-500 text-white"   : "bg-slate-400 text-white"
                  )}>
                    {tracker.badge ?? "ACTIVE"}
                  </span>
                  <span className="text-xs font-bold text-neutral-800 truncate">
                    {tracker.anonymized_label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Radio className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-data font-semibold text-neutral-600">
                    {duration}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-data">
                    {tracker.appearances}× seen
                  </span>
                </div>
              </div>

              {/* Row 2: current locations */}
              <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                {tracker.cameras.map((cam) => (
                  <span
                    key={cam}
                    className="text-[9px] bg-white border border-neutral-200 rounded px-1.5 py-0.5 text-neutral-600"
                  >
                    {cam}
                  </span>
                ))}
                {tracker.cross_camera && (
                  <span className="text-[9px] bg-amber-100 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5 font-bold">
                    multi-zone
                  </span>
                )}
                <span className={cn(
                  "ml-auto text-[9px] font-bold font-data shrink-0",
                  tracker.confidence < 70
                    ? "text-red-600"
                    : tracker.confidence < 80
                    ? "text-amber-600"
                    : "text-emerald-600"
                )}>
                  {tracker.confidence}% conf
                </span>
              </div>

              {/* Row 3: inline action buttons */}
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                {isRecurring && (
                  <button
                    onClick={onTrackerClick}
                    className="flex items-center gap-1 h-6 px-2.5 rounded text-[10px] font-bold bg-orange-500 text-white hover:bg-orange-600 transition-colors shrink-0"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Dispatch
                  </button>
                )}
                <button
                  onClick={onTrackerClick}
                  className="flex items-center gap-1 h-6 px-2.5 rounded border border-neutral-200 bg-white text-[10px] font-semibold text-neutral-700 hover:border-[#00775B] hover:text-[#00775B] transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  View Details
                </button>
                <button
                  className="flex items-center gap-1 h-6 px-2 rounded border border-neutral-200 bg-white text-[10px] font-semibold text-neutral-500 hover:border-amber-400 hover:text-amber-600 transition-colors"
                >
                  <ShieldPlus className="w-3 h-3" />
                  Add Watch
                </button>
                <button className="ml-auto h-6 px-2 rounded border border-neutral-100 bg-white text-[10px] text-neutral-400 hover:text-neutral-600 transition-colors">
                  Clear
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};
