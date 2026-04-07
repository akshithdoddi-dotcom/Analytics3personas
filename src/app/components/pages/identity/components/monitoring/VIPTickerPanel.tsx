import { Panel } from "../shared/Panel";
import { Star, ShieldCheck } from "lucide-react";
import { VIP_ENTRIES } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { IdentityEvidenceMedia } from "../shared/IdentityEvidenceMedia";

interface Props { terminology: IdentityTerminology }

const VIP_FACE_IMAGES = [
  "https://images.pexels.com/photos/33738484/pexels-photo-33738484.jpeg?cs=srgb&dl=pexels-vika-glitter-392079-33738484.jpg&fm=jpg",
  "https://images.pexels.com/photos/14801453/pexels-photo-14801453.jpeg?cs=srgb&dl=pexels-kwizera-gadson-14801453.jpg&fm=jpg",
];

export const VIPTickerPanel = ({ terminology: _terminology }: Props) => (
  <Panel
    title="VIP Detections"
    icon={Star}
    info="VIP and executive individuals detected today. Escort protocols may apply."
  >
    <div className="overflow-x-auto -mx-4 -mb-4">
      <table className="w-full min-w-[760px] text-xs">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-100">
            <th className="pl-4 pr-2 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-neutral-500">Capture</th>
            <th className="px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-neutral-500">Identity</th>
            <th className="px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-neutral-500">Zone</th>
            <th className="px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-neutral-500">Status</th>
            <th className="px-2 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.05em] text-neutral-500">Confidence</th>
            <th className="pl-2 pr-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.05em] text-neutral-500">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {VIP_ENTRIES.map((entry, index) => (
            <tr key={entry.id} className="transition-colors hover:bg-neutral-50">
              <td className="pl-4 pr-2 py-3">
                <IdentityEvidenceMedia
                  kind="FACE"
                  seed={entry.id}
                  imageSrc={VIP_FACE_IMAGES[index % VIP_FACE_IMAGES.length]}
                  confidence={entry.confidence}
                  className="h-14 w-14"
                />
              </td>
              <td className="px-2 py-3">
                <div className="text-[14px] leading-[1.5] font-semibold text-neutral-800">{entry.label}</div>
                <div className="text-[12px] leading-[1.3] text-neutral-500">ID {entry.id}</div>
              </td>
              <td className="px-2 py-3 text-[14px] leading-[1.5] text-neutral-700">{entry.zone}</td>
              <td className="px-2 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-purple-200 bg-purple-50 px-2.5 text-[12px] font-semibold text-purple-700">
                    <Star className="h-3 w-3" />
                    VIP
                  </span>
                  <span className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-[var(--severity-success)]/20 bg-[var(--severity-success-light)] px-2.5 text-[12px] font-semibold text-[var(--severity-success)]">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                </div>
              </td>
              <td className="px-2 py-3 text-right font-data tabular-nums text-[14px] leading-[1.5] font-semibold text-neutral-800">
                {entry.confidence}%
              </td>
              <td className="pl-2 pr-4 py-3 text-right font-data tabular-nums text-[14px] leading-[1.5] text-neutral-500">
                {entry.timestamp}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Panel>
);
