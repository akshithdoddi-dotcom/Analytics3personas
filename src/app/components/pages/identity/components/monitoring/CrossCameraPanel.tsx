import { Panel } from "../shared/Panel";
import { Waypoints, Map } from "lucide-react";
import { CROSS_CAMERA_TRACKS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: IdentityTerminology;
  onJourneyClick?: () => void;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

export const CrossCameraPanel = ({ terminology, onJourneyClick }: Props) => {
  // Rename based on identity type
  const title = terminology.isLPR ? "Vehicle Path" : "Movement Trail";
  const subtitle = terminology.isLPR
    ? "Vehicle routes traced across multiple access points"
    : "Individuals traced across multiple zones";

  return (
    <Panel
      title={title}
      icon={Waypoints}
      info={`${subtitle}. Click 'View Map' to see the full floor-plan journey with timestamps.`}
    >
      <div className="flex flex-col gap-2">
        {CROSS_CAMERA_TRACKS.map((track) => (
          <div
            key={track.tracker_id}
            className={cn(
              "rounded-lg p-3 border",
              track.badge === "BLACKLIST"
                ? "bg-red-50 border-red-200"
                : track.severity === "high"
                ? "bg-orange-50 border-orange-200"
                : "bg-slate-50 border-slate-200"
            )}
          >
            {/* Header: badge + tracker ID + duration + view map */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0",
                  track.badge === "BLACKLIST" ? "bg-red-600 text-white"   :
                  track.badge === "WATCH"     ? "bg-orange-500 text-white" : "bg-slate-500 text-white"
                )}>
                  {track.badge}
                </span>
                <span className="text-xs font-bold text-neutral-800 truncate">
                  {track.tracker_id}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-neutral-500 font-data">
                  {formatDuration(track.duration_sec)} active
                </span>
                {onJourneyClick && (
                  <button
                    onClick={onJourneyClick}
                    className="flex items-center gap-1 h-6 px-2.5 rounded border border-[#00775B]/30 bg-[#E5FFF9] text-[10px] font-bold text-[#00775B] hover:bg-[#00775B] hover:text-white transition-colors"
                  >
                    <Map className="w-3 h-3" />
                    View Map
                  </button>
                )}
              </div>
            </div>

            {/* Zone path visualization */}
            <div className="mt-2 flex items-center gap-1 flex-wrap">
              {track.path.map((zone, i) => (
                <span key={zone} className="flex items-center gap-1">
                  <span className={cn(
                    "text-[10px] rounded px-1.5 py-0.5 border font-medium",
                    i === track.path.length - 1
                      ? "bg-[#00775B] text-white border-[#00775B]"
                      : "bg-white border-neutral-200 text-neutral-700"
                  )}>
                    {zone}
                  </span>
                  {i < track.path.length - 1 && (
                    <span className="text-neutral-400 text-[10px]">→</span>
                  )}
                </span>
              ))}
              <span className="ml-1 text-[9px] bg-emerald-50 border border-emerald-200 text-emerald-600 rounded px-1 py-0.5 font-semibold">
                ● now
              </span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
};
