import { SIX_MONTH_TREND } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { TrendingUp, TrendingDown, ShieldCheck, Radar, ScanSearch, AlertTriangle } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface Props { terminology: IdentityTerminology }

export const ExecutiveSummaryBar = ({ terminology: _terminology }: Props) => {
  const latestMonth = SIX_MONTH_TREND[SIX_MONTH_TREND.length - 1];
  const prevMonth = SIX_MONTH_TREND[SIX_MONTH_TREND.length - 2];

  const stats = [
    {
      label: "Match Accuracy",
      value: `${latestMonth.accuracy_pct}%`,
      delta: `+${(latestMonth.accuracy_pct - prevMonth.accuracy_pct).toFixed(1)}pp`,
      up: true,
      positive: true,
      benchmark: "Target: 97%",
    },
    {
      label: "Unknown Rate",
      value: `${latestMonth.unknown_rate_pct}%`,
      delta: `-${(prevMonth.unknown_rate_pct - latestMonth.unknown_rate_pct).toFixed(1)}pp`,
      up: false,
      positive: true,
      benchmark: "Target: <5%",
    },
    {
      label: "Monthly Identifications",
      value: latestMonth.total_identifications.toLocaleString(),
      delta: `+${((latestMonth.total_identifications - prevMonth.total_identifications) / prevMonth.total_identifications * 100).toFixed(1)}%`,
      up: true,
      positive: true,
      benchmark: "vs. last month",
    },
    {
      label: "Blacklist Hits (MTD)",
      value: String(latestMonth.blacklist_hits),
      delta: latestMonth.blacklist_hits <= prevMonth.blacklist_hits ? `↓ from ${prevMonth.blacklist_hits}` : `↑ from ${prevMonth.blacklist_hits}`,
      up: latestMonth.blacklist_hits > prevMonth.blacklist_hits,
      positive: latestMonth.blacklist_hits <= prevMonth.blacklist_hits,
      benchmark: "All confirmed",
    },
  ];

  const heroMetrics = [
    { icon: ShieldCheck, label: "Program health", value: "Stable", tone: "text-emerald-300" },
    { icon: Radar, label: "Coverage", value: "87.5%", tone: "text-cyan-300" },
    { icon: ScanSearch, label: "Enrollment", value: "73.4%", tone: "text-amber-300" },
    { icon: AlertTriangle, label: "Open watch areas", value: "2", tone: "text-red-300" },
  ];

  return (
    <div className="overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm">
      <div className="grid gap-6 bg-[linear-gradient(135deg,var(--primary-dark)_0%,var(--primary-main)_32%,var(--neutral-white)_32%,var(--neutral-white)_100%)] px-6 py-6 xl:grid-cols-[1.15fr,2fr]">
        <div className="rounded-md border border-white/10 bg-[rgba(0,30,24,0.92)] p-6 text-white">
          <p className="text-[12px] leading-[1.3] font-semibold uppercase tracking-[0.05em] text-[#79f2d0]">
            Director Command View
          </p>
          <h3 className="mt-3 max-w-[18ch] text-[28px] leading-[1.2] font-semibold text-white">
            Identity program quality and access risk in one board
          </h3>
          <p className="mt-2 max-w-[42ch] text-[14px] leading-[1.5] text-white/70">
            Strategic trends, coverage posture, and exception pressure aligned to the analytics design language used across the platform.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {heroMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="rounded-md border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex items-center gap-2 text-[12px] leading-[1.3] font-semibold uppercase tracking-[0.05em] text-white/55">
                    <Icon className={cn("h-3.5 w-3.5", metric.tone)} />
                    {metric.label}
                  </div>
                  <p className={cn("mt-2 text-[20px] leading-[1.3] font-bold font-data", metric.tone)}>{metric.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-md border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 [transition-timing-function:var(--ease-snappy)] hover:border-[var(--primary-main)] hover:shadow-[0_0_20px_var(--primary-glow)]">
              <p className="text-[12px] leading-[1.3] font-semibold uppercase tracking-[0.05em] text-neutral-500">{stat.label}</p>
              <p className="mt-2 text-[40px] leading-[1.2] font-bold font-data text-neutral-900">{stat.value}</p>
              <div className={cn("mt-2 flex items-center gap-1 text-[14px] leading-[1.5] font-semibold",
                stat.positive ? "text-emerald-600" : "text-red-500"
              )}>
                {stat.up
                  ? <TrendingUp className="h-4 w-4" />
                  : <TrendingDown className="h-4 w-4" />}
                <span>{stat.delta}</span>
              </div>
              <p className="mt-1 text-[12px] leading-[1.3] text-neutral-400">{stat.benchmark}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
