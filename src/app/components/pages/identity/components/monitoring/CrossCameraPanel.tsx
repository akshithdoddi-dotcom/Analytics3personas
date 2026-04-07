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
      <div className="flex flex-col gap-3">
        {CROSS_CAMERA_TRACKS.map((track) => (
          <div
            key={track.tracker_id}
            className={cn(
              "rounded-md border p-4 shadow-sm transition-colors hover:border-[var(--primary-main)]",
              track.badge === "BLACKLIST"
                ? "bg-[var(--severity-critical-light)] border-red-200"
                : track.severity === "high"
                ? "bg-[var(--severity-high-light)] border-orange-200"
                : "bg-white border-neutral-200"
            )}
          >
            <div className="grid gap-4 lg:grid-cols-[180px,1fr,140px,120px] lg:items-center">
              <div className="min-w-0">
                <span className={cn(
                  "inline-flex h-8 items-center rounded-[4px] px-2.5 text-[12px] font-semibold uppercase",
                  track.badge === "BLACKLIST" ? "bg-[var(--severity-critical)] text-white" :
                  track.badge === "WATCH" ? "bg-[var(--severity-high)] text-white" : "bg-neutral-700 text-white"
                )}>
                  {track.badge}
                </span>
                <div className="mt-2 text-[14px] leading-[1.5] font-semibold text-neutral-800">
                  {track.tracker_id}
                </div>
                <div className="text-[12px] leading-[1.3] text-neutral-500">{track.zones.join(" · ")}</div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {track.path.map((zone, i) => (
                    <span key={zone} className="flex items-center gap-1">
                      <span className={cn(
                        "rounded-[4px] border px-2 py-1 text-[12px] font-semibold",
                        i === track.path.length - 1
                          ? "border-[var(--primary-main)] bg-[var(--primary-subtle)] text-[var(--primary-main)]"
                          : "border-neutral-200 bg-white text-neutral-700"
                      )}>
                        {zone}
                      </span>
                      {i < track.path.length - 1 && <span className="text-neutral-300">→</span>}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-[12px] leading-[1.3] text-neutral-500">
                  Current zone: <span className="font-semibold text-neutral-700">{track.path[track.path.length - 1]}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.05em] text-neutral-400">Active</div>
                <div className="mt-1 font-data tabular-nums text-[20px] leading-[1.3] font-semibold text-neutral-900">
                  {formatDuration(track.duration_sec)}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 lg:justify-end">
                <span className="rounded-[4px] border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.05em] text-emerald-700">
                  Live
                </span>
                {onJourneyClick && (
                  <button
                    onClick={onJourneyClick}
                    className="flex h-10 items-center gap-1.5 rounded-[4px] border border-[var(--primary-main)] bg-white px-4 text-[14px] font-semibold text-[var(--primary-main)] transition-all duration-200 [transition-timing-function:var(--ease-snappy)] hover:-translate-y-px hover:shadow-[0_0_20px_var(--primary-glow)] active:scale-[0.98]"
                  >
                    <Map className="h-3.5 w-3.5" />
                    View Map
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
};
