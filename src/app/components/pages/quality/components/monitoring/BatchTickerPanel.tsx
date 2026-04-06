import { Panel } from "../shared/Panel";
import { Package } from "lucide-react";
import { BATCH_TICKER } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: QualityTerminology;
}

export const BatchTickerPanel = ({ terminology }: Props) => {
  const passCount = BATCH_TICKER.filter((b) => b.pass).length;
  const passRate = Math.round((passCount / BATCH_TICKER.length) * 100);

  return (
    <Panel
      title="Batch Pass/Fail Ticker"
      icon={Package}
      info={`Latest ${terminology.entityLabel.toLowerCase()} batch inspection results. Green = Pass, Red = Fail.`}
    >
      <div className="flex flex-col gap-4">
        {/* Running pass rate */}
        <div className="flex items-center gap-4">
          <div>
            <p className="text-3xl font-black font-data text-neutral-900">{passRate}%</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-0.5">
              Pass Rate (Last {BATCH_TICKER.length} Batches)
            </p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-full">
              {passCount} Pass
            </span>
            <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-1 rounded-full">
              {BATCH_TICKER.length - passCount} Fail
            </span>
          </div>
        </div>

        {/* Batch chips */}
        <div className="flex flex-wrap gap-2">
          {BATCH_TICKER.map((batch) => (
            <div
              key={batch.id}
              className={cn(
                "flex flex-col items-center px-2.5 py-2 rounded-lg border text-[10px] font-bold min-w-[52px]",
                batch.pass
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-red-200 text-red-700"
              )}
            >
              <span>{batch.id}</span>
              <span className="mt-0.5 text-[9px] font-normal">
                {batch.pass ? "Pass" : `Fail (${batch.defectCount})`}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-neutral-400">
          Showing last {BATCH_TICKER.length} {terminology.entityLabel.toLowerCase()} batches · Live
        </p>
      </div>
    </Panel>
  );
};
