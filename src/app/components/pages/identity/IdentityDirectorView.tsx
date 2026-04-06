import {
  ComposedChart, BarChart, Bar, Line, LineChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceArea, ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, ShieldOff, Users, Activity, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { IdentityTerminology } from "../IdentityAnalytics";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const EXEC_STATS = [
  { label: "Total Identifications", value: "12.4K", delta: "+6%",   deltaDir: "up",        context: "vs. last month"     },
  { label: "Blacklist Alerts",       value: "3",     delta: "↓ 40%", deltaDir: "down-good", context: "lowest in 6 months" },
  { label: "Match Accuracy",         value: "97.2%", delta: "+1.1pp",deltaDir: "up",        context: "above 95% target"   },
  { label: "Unique Visitors",        value: "847",   delta: "+12%",  deltaDir: "up",        context: "vs. last month"     },
];

const SIX_MONTH_TREND = [
  { month: "Nov", identifications: 9800,  accuracy: 95.1 },
  { month: "Dec", identifications: 10200, accuracy: 95.6 },
  { month: "Jan", identifications: 10800, accuracy: 96.1 },
  { month: "Feb", identifications: 11200, accuracy: 96.4 },
  { month: "Mar", identifications: 11800, accuracy: 97.0 },
  { month: "Apr", identifications: 12400, accuracy: 97.2 },
];

const ACCESS_RISK_MONTHLY = [
  { month: "Nov", blacklist: 8, unauthorized: 4, unknown: 45 },
  { month: "Dec", blacklist: 6, unauthorized: 3, unknown: 38 },
  { month: "Jan", blacklist: 5, unauthorized: 2, unknown: 32 },
  { month: "Feb", blacklist: 4, unauthorized: 2, unknown: 28 },
  { month: "Mar", blacklist: 5, unauthorized: 3, unknown: 25 },
  { month: "Apr", blacklist: 3, unauthorized: 1, unknown: 22 },
];

const UNIQUE_VISITORS_MONTHLY = [
  { month: "Nov", unique: 620, repeatRate: 28 },
  { month: "Dec", unique: 680, repeatRate: 30 },
  { month: "Jan", unique: 710, repeatRate: 31 },
  { month: "Feb", unique: 760, repeatRate: 33 },
  { month: "Mar", unique: 800, repeatRate: 34 },
  { month: "Apr", unique: 847, repeatRate: 34 },
];

const SCORECARD = [
  { metric: "Match Accuracy",               thisMonth: "97.2%", lastMonth: "96.1%", target: "≥95%",  status: "on-track" },
  { metric: "Blacklist Alert Count",         thisMonth: "3",     lastMonth: "5",     target: "≤5",    status: "on-track" },
  { metric: "Unknown Rate",                  thisMonth: "11.4%", lastMonth: "13.5%", target: "≤10%",  status: "watch"    },
  { metric: "Unauthorized Access Incidents", thisMonth: "1",     lastMonth: "3",     target: "0",     status: "watch"    },
  { metric: "Plate Read Accuracy (LPR)",     thisMonth: "98.7%", lastMonth: "98.2%", target: "≥98%",  status: "on-track" },
  { metric: "Avg Resolution Time",           thisMonth: "38s",   lastMonth: "51s",   target: "≤60s",  status: "on-track" },
];

// Enrollment health
const ENROLLMENT_HEALTH = [
  { label: "Enrolled",          value: "3,420", pct: 89, target: 100, color: "#00775B" },
  { label: "Unknown Rate",      value: "11.4%", pct: 14, target: 10,  color: "#F59E0B", invert: true },
  { label: "Avg Confidence",    value: "91.3%", pct: 91, target: 95,  color: "#3B82F6" },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

const ACCENT  = "#00775B";
const DANGER  = "#EF4444";
const WARNING = "#F59E0B";

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white border border-neutral-200 rounded-md p-6 shadow-sm", className)}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) => (
  <div className="flex items-start gap-3 mb-6">
    <div className="p-2 bg-[#E5FFF9] text-[#00775B] rounded-sm mt-0.5">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-800">{title}</h3>
      {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// ─── 1. Executive Summary Bar ─────────────────────────────────────────────────

const ExecutiveSummaryBar = ({ terminology }: { terminology: IdentityTerminology }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {EXEC_STATS.map((s) => {
      const isUp   = s.deltaDir === "up";
      const isGood = s.deltaDir === "up" || s.deltaDir === "down-good";
      return (
        <Card key={s.label} className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">{s.label}</p>
          <p className="text-3xl font-black text-neutral-900 mb-2">{s.value}</p>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full border",
              isGood
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : "text-red-700 bg-red-50 border-red-200"
            )}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {s.delta}
            </span>
          </div>
          <p className="text-[10px] text-neutral-400">{s.context}</p>
        </Card>
      );
    })}
  </div>
);

// ─── 2. 6-Month Identity Volume & Accuracy Trend ─────────────────────────────

const SixMonthTrend = ({ terminology }: { terminology: IdentityTerminology }) => (
  <Card className="mb-6">
    <SectionTitle
      icon={TrendingUp}
      title="6-Month Identity Volume & Accuracy Trend"
      subtitle={`${terminology.identLabel} volume (bars) and match accuracy (line) — last 6 months`}
    />
    <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
      <ComposedChart data={SIX_MONTH_TREND} margin={{ top: 10, right: 50, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="identGradDir" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.85} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} />
        <YAxis
          yAxisId="left"
          orientation="left"
          tick={{ fontSize: 10, fill: "#94A3B8" }}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}K`}
          width={40}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[93, 99]}
          tickFormatter={(v: number) => `${v}%`}
          tick={{ fontSize: 10, fill: "#94A3B8" }}
          width={40}
        />
        <Tooltip
          contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 11 }}
          formatter={(v: number, name: string) => [
            name === "accuracy" ? `${v}%` : v.toLocaleString(),
            name === "accuracy" ? "Match Accuracy" : terminology.identLabel + "s",
          ]}
        />
        <Legend wrapperStyle={{ fontSize: 10 }} />
        {/* 95% target reference band */}
        <ReferenceArea yAxisId="right" y1={95} y2={99} fill="#E5FFF9" fillOpacity={0.4} />
        <ReferenceLine yAxisId="right" y={95} stroke={ACCENT} strokeDasharray="4 2" label={{ value: "95% target", fontSize: 9, fill: ACCENT }} />
        <Bar yAxisId="left" dataKey="identifications" fill="url(#identGradDir)" radius={[3, 3, 0, 0]} isAnimationActive={false} name="Identifications" />
        <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: "#3B82F6" }} isAnimationActive={false} name="Accuracy %" />
      </ComposedChart>
    </ResponsiveContainer>
  </Card>
);

// ─── 3. Access Risk Summary ───────────────────────────────────────────────────

const AccessRiskSummary = ({ terminology }: { terminology: IdentityTerminology }) => {
  const riskStats = [
    { label: `${terminology.blacklistLabel} Alerts`,     value: "3",  delta: "↓40%", good: true,  context: "vs 5 last month"  },
    { label: "Unauthorized Access",                       value: "1",  delta: "↓67%", good: true,  context: "vs 3 last month"  },
    { label: `${terminology.unknownLabel}s (total)`,     value: "22", delta: "↓12%", good: true,  context: "vs 25 last month" },
  ];

  return (
    <Card className="mb-6">
      <SectionTitle
        icon={ShieldOff}
        title="Access Risk Summary – 6 Months"
        subtitle="Risk event trends and monthly breakdown by category"
      />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 3 stat cards */}
        <div className="flex flex-col gap-4">
          {riskStats.map((s) => (
            <div key={s.label} className="p-4 rounded-lg border border-neutral-100 bg-neutral-50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">{s.label}</p>
              <p className="text-2xl font-black text-neutral-900 mb-1">{s.value}</p>
              <div className="flex items-center gap-1.5">
                <span className={cn("text-[10px] font-bold", s.good ? "text-emerald-600" : "text-red-600")}>
                  {s.delta}
                </span>
                <span className="text-[9px] text-neutral-400">{s.context}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stacked bar chart */}
        <div className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={200} minWidth={0} minHeight={0}>
            <BarChart data={ACCESS_RISK_MONTHLY} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} width={28} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 10 }}
              />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              <Bar dataKey="blacklist"    stackId="a" fill={DANGER}    isAnimationActive={false} name={terminology.blacklistLabel} />
              <Bar dataKey="unauthorized" stackId="a" fill={WARNING}   isAnimationActive={false} name="Unauthorized"               />
              <Bar dataKey="unknown"      stackId="a" fill="#94A3B8"   radius={[2, 2, 0, 0]} isAnimationActive={false} name={terminology.unknownLabel} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

// ─── 4. Visitor Pattern & System Reach ───────────────────────────────────────

const VisitorPatternSection = ({ terminology }: { terminology: IdentityTerminology }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
    {/* Unique visitors + repeat rate */}
    <Card>
      <SectionTitle
        icon={Users}
        title={`Unique ${terminology.entityLabel}s & Repeat Rate`}
        subtitle="Monthly unique visitors with repeat visit rate %"
      />
      <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={0}>
        <ComposedChart data={UNIQUE_VISITORS_MONTHLY} margin={{ top: 8, right: 40, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} />
          <YAxis yAxisId="left"  tick={{ fontSize: 10, fill: "#94A3B8" }} width={32} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 50]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 10, fill: "#94A3B8" }} width={36} />
          <Tooltip
            contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 10 }}
            formatter={(v: number, name: string) => [
              name === "repeatRate" ? `${v}%` : v,
              name === "repeatRate" ? "Repeat Rate" : `Unique ${terminology.entityLabel}s`,
            ]}
          />
          <Bar yAxisId="left"  dataKey="unique"     fill="#3B82F6"  radius={[3, 3, 0, 0]} isAnimationActive={false} name="unique" />
          <Line yAxisId="right" type="monotone" dataKey="repeatRate" stroke={WARNING} strokeWidth={2.5} dot={{ r: 4, fill: WARNING }} isAnimationActive={false} name="repeatRate" />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>

    {/* Enrollment health */}
    <Card>
      <SectionTitle
        icon={Activity}
        title="Enrollment Health"
        subtitle="System reach and recognition quality metrics"
      />
      <div className="flex flex-col gap-5 mt-2">
        {ENROLLMENT_HEALTH.map((item) => {
          const targetPct = item.invert
            ? Math.max(0, 100 - (item.pct / (item.target * 2)) * 100)
            : Math.min(100, (item.pct / item.target) * 100);
          const barWidth = Math.min(100, item.pct);
          const isOnTrack = item.invert ? item.pct <= item.target : item.pct >= item.target * 0.95;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-neutral-700">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-neutral-900">{item.value}</span>
                  <span className={cn(
                    "inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                    isOnTrack ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  )}>
                    {isOnTrack ? <CheckCircle className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                    Target: {item.target}{item.invert ? "%" : ""}
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${barWidth}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  </div>
);

// ─── 5. Identity Program Scorecard ───────────────────────────────────────────

const IdentityScorecard = ({ terminology: _terminology }: { terminology: IdentityTerminology }) => (
  <Card>
    <SectionTitle
      icon={Activity}
      title="Identity Program Scorecard"
      subtitle="This month vs last month vs target"
    />
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-neutral-100">
            {["Metric", "This Month", "Last Month", "Target", "Status"].map((h) => (
              <th key={h} className="text-left py-2 px-3 text-[9px] uppercase tracking-widest text-neutral-400 font-bold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SCORECARD.map((row) => {
            const onTrack = row.status === "on-track";
            return (
              <tr key={row.metric} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                <td className="py-3 px-3 font-medium text-neutral-800 whitespace-nowrap">{row.metric}</td>
                <td className="py-3 px-3 font-mono text-[11px] font-bold text-neutral-900">{row.thisMonth}</td>
                <td className="py-3 px-3 font-mono text-[11px] text-neutral-500">{row.lastMonth}</td>
                <td className="py-3 px-3 font-mono text-[11px] text-neutral-500">{row.target}</td>
                <td className="py-3 px-3">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold",
                    onTrack
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  )}>
                    {onTrack
                      ? <><CheckCircle className="w-2.5 h-2.5" /> On Track</>
                      : <><AlertCircle className="w-2.5 h-2.5" /> Watch</>
                    }
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </Card>
);

// ─── Main View ────────────────────────────────────────────────────────────────

interface IdentityDirectorViewProps {
  terminology: IdentityTerminology;
  timeRange: string;
}

export const IdentityDirectorView = ({ terminology, timeRange: _timeRange }: IdentityDirectorViewProps) => (
  <div>
    <ExecutiveSummaryBar terminology={terminology} />
    <SixMonthTrend terminology={terminology} />
    <AccessRiskSummary terminology={terminology} />
    <VisitorPatternSection terminology={terminology} />
    <IdentityScorecard terminology={terminology} />
  </div>
);
