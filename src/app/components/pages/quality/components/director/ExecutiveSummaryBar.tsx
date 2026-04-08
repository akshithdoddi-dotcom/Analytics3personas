import { SCORECARD_DATA, SIX_MONTH_DATA, DEFECT_KPIS } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: QualityTerminology;
}

export const ExecutiveSummaryBar = ({ terminology }: Props) => {
  const latestMonth = SIX_MONTH_DATA[SIX_MONTH_DATA.length - 1];
  const prevMonth = SIX_MONTH_DATA[SIX_MONTH_DATA.length - 2];
  const isDefect = terminology.isDefectApp;
  const d = DEFECT_KPIS;

  const stats = [
    {
      label: terminology.primaryMetricLabel,
      value: isDefect
        ? `${(100 - d.defect_rate_pct).toFixed(1)}%`
        : `${latestMonth.compliance_pct.toFixed(1)}%`,
      delta: latestMonth.compliance_pct - prevMonth.compliance_pct,
      deltaSuffix: "pp",
      positiveWhenUp: true,
      context: "vs. last month · Target: 90%",
    },
    {
      label: isDefect ? "Defect Rate" : "Monthly Violations",
      value: isDefect
        ? `${d.defect_rate_pct.toFixed(1)}%`
        : (SCORECARD_DATA.find((s) => s.metric === "Total Violations (Month)")?.this_period ?? 312).toLocaleString(),
      delta: isDefect ? d.defect_rate_pct - d.vs_yesterday.defect_rate_pct : -77,
      deltaSuffix: isDefect ? "pp" : "",
      positiveWhenUp: false,
      context: isDefect ? "Target: <1%" : "vs. last month",
    },
    {
      label: isDefect ? "Defect Density" : "Avg Time to Compliance",
      value: isDefect ? `${d.defect_density_pct.toFixed(1)}%` : "47s",
      delta: isDefect ? d.defect_density_pct - d.vs_yesterday.defect_density_pct : -16,
      deltaSuffix: isDefect ? "pp" : "s",
      positiveWhenUp: false,
      context: isDefect ? "Avg area per item" : "Target: <30s",
    },
    {
      label: "Cost of Quality",
      value: "$8,200",
      delta: -1400,
      deltaSuffix: "",
      positiveWhenUp: false,
      context: "vs. last month",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const isUp = stat.delta > 0;
        const isGood = stat.positiveWhenUp ? isUp : !isUp;
        const deltaColor = isGood ? "text-emerald-600" : "text-red-500";
        const borderColor = isGood ? "border-neutral-200" : stat.delta === 0 ? "border-neutral-200" : "border-red-200";

        return (
          <div
            key={stat.label}
            className={cn("bg-white rounded-[4px] border shadow-sm p-4 flex flex-col gap-1.5", borderColor)}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400">
              {stat.label}
            </span>
            <span className="text-[36px] font-black font-data tabular-nums leading-none text-neutral-900">
              {stat.value}
            </span>
            <div className={cn("flex items-center gap-1 text-[10px] font-semibold", deltaColor)}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>
                {isUp ? "+" : ""}
                {typeof stat.delta === "number" && stat.delta !== 0
                  ? `${Number.isInteger(stat.delta) ? stat.delta : stat.delta.toFixed(1)}${stat.deltaSuffix}`
                  : "No change"}
              </span>
              <span className="text-neutral-400 font-normal">{stat.context}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
