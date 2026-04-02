import {
  ComposedChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceArea, Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, ShieldCheck, DollarSign, BarChart2 } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { QualityTerminology } from "@/app/data/mockData";
import { D3RadarChart, d3ColorFor } from "./D3Charts";
import {
  SIX_MONTH_TREND_DATA,
  COQ_STACKED_MONTHLY,
  INCIDENT_BY_MONTH_DATA,
  QUALITY_ZONES,
} from "@/app/data/mockData";

interface DirectorViewProps {
  terminology: QualityTerminology;
  timeRange: string;
}

// ─── Shared card wrapper ───────────────────────────────────────────────────
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white border border-neutral-200 rounded-md p-6 shadow-sm", className)}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) => (
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

const DeltaPill = ({ value, suffix = "%" }: { value: number; suffix?: string }) => {
  if (value > 0) return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
      <TrendingUp className="w-3 h-3" /> +{value}{suffix}
    </span>
  );
  if (value < 0) return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
      <TrendingDown className="w-3 h-3" /> {value}{suffix}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full">
      <Minus className="w-3 h-3" /> {value}{suffix}
    </span>
  );
};

// ─── 1. Executive Summary Bar ──────────────────────────────────────────────
const ExecutiveSummaryBar = ({ terminology }: { terminology: QualityTerminology }) => {
  const stats = [
    {
      label: terminology.complianceLabel,
      value: "94.2%",
      delta: 2.1,
      benchmark: "Target: 90%",
      positive: true,
    },
    {
      label: terminology.defectRateLabel,
      value: "3.8%",
      delta: -0.3,
      benchmark: "Target: <5%",
      positive: false,
      deltaPositive: true, // lower is better
    },
    {
      label: "Cost of Quality",
      value: "$23.5K",
      delta: -13.7,
      benchmark: "vs Oct: $37.4K",
      deltaPositive: true,
    },
    {
      label: "Critical Incidents",
      value: "4",
      delta: -10,
      benchmark: "vs Oct: 14",
      deltaPositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <Card key={s.label} className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">{s.label}</p>
          <p className="text-3xl font-black text-neutral-900 mb-2">{s.value}</p>
          <div className="flex items-center gap-2">
            <DeltaPill value={s.delta} suffix={typeof s.delta === "number" && Math.abs(s.delta) > 5 ? "%" : "%"} />
            <span className="text-[10px] text-neutral-400">{s.benchmark}</span>
          </div>
        </Card>
      ))}
    </div>
  );
};

// ─── 2. Six-Month Trend Chart ──────────────────────────────────────────────
const SixMonthTrendChart = ({ terminology }: { terminology: QualityTerminology }) => (
  <Card className="mb-6">
    <SectionTitle icon={TrendingUp} title="6-Month Performance Trend" subtitle="Compliance rate vs defect rate over the past 6 months" />
    <ResponsiveContainer width="100%" height={280} minWidth={0} minHeight={0}>
      <ComposedChart data={SIX_MONTH_TREND_DATA} margin={{ top: 10, right: 40, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} />
        <YAxis
          yAxisId="left"
          domain={[80, 100]}
          orientation="left"
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: "#94A3B8" }}
          width={42}
        />
        <YAxis
          yAxisId="right"
          domain={[0, 10]}
          orientation="right"
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: "#94A3B8" }}
          width={36}
        />
        <Tooltip
          contentStyle={{ fontSize: 11, border: "1px solid #E2E8F0", borderRadius: 4 }}
          formatter={(value: number, name: string) => [`${value}%`, name === "complianceRate" ? terminology.complianceLabel : terminology.defectRateLabel]}
        />
        <ReferenceArea yAxisId="left" y1={90} y2={100} fill="#00775B" fillOpacity={0.06} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="complianceRate"
          stroke="#00775B"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#00775B" }}
          name={terminology.complianceLabel}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="defectRate"
          stroke="#EF4444"
          strokeWidth={2}
          strokeDasharray="4 3"
          dot={{ r: 3, fill: "#EF4444" }}
          name={terminology.defectRateLabel}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
          formatter={(value: string) => value}
        />
      </ComposedChart>
    </ResponsiveContainer>
    <p className="text-[10px] text-neutral-400 mt-3">
      Green band = target zone (≥90%). Right axis shows {terminology.defectRateLabel.toLowerCase()} (dashed red).
    </p>
  </Card>
);

// ─── 3. Cost of Quality Panel ──────────────────────────────────────────────
const QualityCOQPanel = () => {
  const totalByMonth = COQ_STACKED_MONTHLY.map((m) => ({
    ...m,
    total: m.rework + m.rejection + m.inspection,
  }));

  const latestTotal  = totalByMonth[totalByMonth.length - 1].total;
  const earliestTotal = totalByMonth[0].total;
  const reduction    = (((earliestTotal - latestTotal) / earliestTotal) * 100).toFixed(0);

  const statCards = [
    { label: "Rework Cost",      value: "$10.9K", delta: -40, color: "#3B82F6" },
    { label: "Rejection Cost",   value: "$6.2K",  delta: -46, color: "#F59E0B" },
    { label: "Inspection Cost",  value: "$6.4K",  delta: -18, color: "#8B5CF6" },
  ];

  return (
    <Card className="mb-6">
      <SectionTitle icon={DollarSign} title="Cost of Quality" subtitle={`${reduction}% total reduction over 6 months — from $${(earliestTotal / 1000).toFixed(1)}K to $${(latestTotal / 1000).toFixed(1)}K`} />
      <div className="grid grid-cols-3 gap-4 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="bg-neutral-50 rounded-sm border border-neutral-200 p-4">
            <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: s.color }} />
            <p className="text-xs text-neutral-500 mb-1">{s.label}</p>
            <p className="text-2xl font-black text-neutral-800">{s.value}</p>
            <DeltaPill value={s.delta} />
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={0}>
        <ComposedChart data={totalByMonth} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} />
          <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: "#94A3B8" }} width={44} />
          <Tooltip
            contentStyle={{ fontSize: 11, border: "1px solid #E2E8F0", borderRadius: 4 }}
            formatter={(v: number, name: string) => [`$${(v / 1000).toFixed(1)}K`, name.charAt(0).toUpperCase() + name.slice(1)]}
          />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="rework"     stackId="a" fill="#3B82F6" fillOpacity={0.8} name="Rework" />
          <Bar dataKey="rejection"  stackId="a" fill="#F59E0B" fillOpacity={0.8} name="Rejection" />
          <Bar dataKey="inspection" stackId="a" fill="#8B5CF6" fillOpacity={0.8} name="Inspection" radius={[3, 3, 0, 0]} />
          <Line type="monotone" dataKey="total" stroke="#374151" strokeWidth={2} dot={{ r: 3 }} name="Total" />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ─── 4. Risk Concentration Map ─────────────────────────────────────────────
const RiskConcentrationMap = ({ terminology }: { terminology: QualityTerminology }) => {
  const maxViolations = Math.max(...QUALITY_ZONES.map((z) => z.violations));

  const statusColors: Record<string, string> = {
    safe: "#00775B",
    warning: "#F59E0B",
    critical: "#EF4444",
  };

  const criticalZones = QUALITY_ZONES
    .filter((z) => z.status === "critical")
    .sort((a, b) => b.violations - a.violations)
    .slice(0, 3);

  return (
    <Card className="mb-6">
      <SectionTitle icon={AlertTriangle} title={`${terminology.zoneLabel} Risk Concentration`} subtitle="Monthly average compliance by zone — darker = higher risk" />
      {/* D3 RdYlGn colour scale — green = high compliance, red = low */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
        {QUALITY_ZONES.map((zone) => {
          const bg     = d3ColorFor(zone.complianceRate, 0.75);
          const border = d3ColorFor(zone.complianceRate, 0.4);
          const textDark = zone.complianceRate > 50;
          return (
            <div
              key={zone.id}
              className="rounded-sm border p-3 cursor-default transition-transform hover:scale-105"
              style={{ backgroundColor: bg, borderColor: border }}
            >
              <p className={`text-[9px] font-bold uppercase tracking-wider truncate ${textDark ? "text-neutral-700" : "text-white"}`}>{zone.name}</p>
              <p className={`text-lg font-black mt-1 ${textDark ? "text-neutral-900" : "text-white"}`}>
                {zone.complianceRate}%
              </p>
              <p className={`text-[9px] ${textDark ? "text-neutral-500" : "text-white/70"}`}>
                {zone.violations} {terminology.violationLabel.toLowerCase()}s
              </p>
            </div>
          );
        })}
      </div>
      {/* Colour scale legend */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[9px] text-neutral-400">Low compliance</span>
        {[0, 20, 40, 60, 80, 100].map((v) => (
          <div key={v} className="flex-1 h-2.5 rounded-sm" style={{ backgroundColor: d3ColorFor(v, 0.75) }} />
        ))}
        <span className="text-[9px] text-neutral-400">High compliance</span>
      </div>
      {criticalZones.length > 0 && (
        <div className="border-t border-neutral-100 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-3">Top Risk {terminology.zoneLabel}s</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {criticalZones.map((z) => (
              <div key={z.id} className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-sm p-3">
                <div className="w-2 h-8 rounded-full bg-red-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-red-800">{z.name}</p>
                  <p className="text-[10px] text-red-600">{z.complianceRate}% compliant · {z.violations} {terminology.violationLabel.toLowerCase()}s</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

// ─── 5. Compliance Scorecard Panel ─────────────────────────────────────────
const ComplianceScorecardPanel = ({ terminology }: { terminology: QualityTerminology }) => {
  const scorecardRows = [
    { metric: `${terminology.complianceLabel} ≥ 90%`,        value: "94.2%", status: "pass",    trend: "+2.1%" },
    { metric: `${terminology.defectRateLabel} < 5%`,         value: "3.8%",  status: "pass",    trend: "-0.3%" },
    { metric: "Critical Incidents < 5/month",                value: "4",     status: "pass",    trend: "-33%"  },
    { metric: "Cost of Quality < $30K/month",                value: "$23.5K",status: "pass",    trend: "-13%"  },
    { metric: "Camera Uptime > 95%",                         value: "91.7%", status: "warning", trend: "-2.1%" },
    { metric: "Repeat Offenders < 5%",                       value: "8.3%",  status: "fail",    trend: "+1.2%" },
  ];

  const statusMap: Record<string, { icon: string; color: string; bg: string; border: string }> = {
    pass:    { icon: "✓", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
    warning: { icon: "⚠", color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200"  },
    fail:    { icon: "✗", color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200"    },
  };

  return (
    <Card>
      <SectionTitle icon={ShieldCheck} title="Compliance Scorecard" subtitle="KPI targets vs actuals — monthly summary" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* D3 Radar — KPI spider chart (left) */}
        <div className="flex flex-col items-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3 self-start">KPI Radar</p>
          <D3RadarChart
            size={200}
            color="#00775B"
            data={[
              { label: terminology.complianceLabel, value: 94.2, max: 100 },
              { label: "Camera Uptime",             value: 91.7, max: 100 },
              { label: "Resolution Time",           value: 78,   max: 100 },
              { label: "Zero Repeats",              value: 65,   max: 100 },
              { label: "COQ Target",                value: 88,   max: 100 },
              { label: "Incident Free",             value: 86,   max: 100 },
            ]}
          />
        </div>

        {/* Incident Trend (middle) */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">Incident Trend by Severity</p>
          <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={0}>
            <BarChart data={INCIDENT_BY_MONTH_DATA} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} />
              <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #E2E8F0", borderRadius: 4 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="medium"   stackId="a" fill="#3B82F6" fillOpacity={0.7} name="Medium"   />
              <Bar dataKey="high"     stackId="a" fill="#F59E0B" fillOpacity={0.8} name="High"     />
              <Bar dataKey="critical" stackId="a" fill="#EF4444" fillOpacity={0.9} name="Critical" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scorecard table (right) */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">KPI Status</p>
          <div className="space-y-2">
            {scorecardRows.map((row) => {
              const s = statusMap[row.status];
              return (
                <div
                  key={row.metric}
                  className={cn("flex items-center gap-3 rounded-sm border px-3 py-2.5", s.bg, s.border)}
                >
                  <span className={cn("text-base font-black w-5 text-center", s.color)}>{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-medium truncate", s.color)}>{row.metric}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-sm font-black", s.color)}>{row.value}</p>
                    <p className="text-[9px] text-neutral-400">{row.trend} MoM</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

// ─── Main Export ───────────────────────────────────────────────────────────
export const DirectorView = ({ terminology, timeRange }: DirectorViewProps) => {
  return (
    <div className="space-y-0">
      <ExecutiveSummaryBar terminology={terminology} />
      <SixMonthTrendChart terminology={terminology} />
      <QualityCOQPanel />
      <RiskConcentrationMap terminology={terminology} />
      <ComplianceScorecardPanel terminology={terminology} />
    </div>
  );
};
