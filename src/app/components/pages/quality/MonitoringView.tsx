import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Line,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  Activity, AlertTriangle, Camera, CheckCircle, XCircle,
  AlertCircle, ChevronDown, ChevronUp, Radio, Wifi, WifiOff,
  Info, TrendingDown, TrendingUp, User, X, Clock,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { QualityTerminology } from "@/app/data/mockData";
import {
  LIVE_COMPLIANCE_SPARKLINE,
  LIVE_VIOLATION_BARS,
  CAMERA_HEALTH_DATA,
  BATCH_TICKER_DATA,
  VIOLATION_TYPE_DISTRIBUTION,
  QUALITY_ZONES,
  QUALITY_ALERTS,
  TIME_TO_COMPLIANCE_DATA,
  DEFECT_DISTRIBUTION,
} from "@/app/data/mockData";
import { D3Gauge, D3ZoneHeatmap, D3Sparkline, d3ColorFor } from "./D3Charts";

// ─── Pastel palette ────────────────────────────────────────────────────────────
const ACCENT   = "#00775B";
const PASTEL   = {
  red:    "#FCA5A5",
  orange: "#FDBA74",
  amber:  "#FCD34D",
  blue:   "#93C5FD",
  purple: "#C4B5FD",
  teal:   "#5EEAD4",
  green:  "#86EFAC",
  slate:  "#CBD5E1",
};
const DANGER_TEXT  = "#DC2626";
const WARNING_TEXT = "#D97706";

// ─── Info Tooltip ──────────────────────────────────────────────────────────────
const InfoTooltip = ({ text }: { text: string }) => {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Info className="w-3.5 h-3.5 text-neutral-300 hover:text-neutral-400 cursor-help transition-colors" />
      {show && (
        <div className="absolute z-50 right-0 top-5 w-56 bg-neutral-900 text-white text-[10px] leading-relaxed rounded-md p-2.5 shadow-xl pointer-events-none">
          {text}
          <div className="absolute -top-1 right-1 w-2 h-2 bg-neutral-900 rotate-45" />
        </div>
      )}
    </div>
  );
};

// ─── Panel wrapper ─────────────────────────────────────────────────────────────
const Panel = ({
  title, icon: Icon, children, className, collapsible = false, info,
}: {
  title: string; icon: any; children: React.ReactNode;
  className?: string; collapsible?: boolean; info?: string;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className={cn("bg-white border border-neutral-200 rounded-md p-4 shadow-sm", className)}>
      <div
        className={cn("flex items-center justify-between mb-3", collapsible && "cursor-pointer")}
        onClick={collapsible ? () => setOpen((o) => !o) : undefined}
      >
        <div className="flex items-center gap-2">
          <div className="p-1 bg-[#E5FFF9] rounded-sm">
            <Icon className="w-3.5 h-3.5 text-[#00775B]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {info && <InfoTooltip text={info} />}
          {collapsible && (open ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />)}
        </div>
      </div>
      {open && children}
    </div>
  );
};

interface MonitoringViewProps {
  terminology: QualityTerminology;
  timeRange: string;
}

// ─── 1. Live Status Bar ────────────────────────────────────────────────────────
const LiveStatusBar = ({ terminology }: { terminology: QualityTerminology }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);
  const stats = [
    { label: `Live ${terminology.complianceLabel}`, value: (91.8 + Math.sin(tick / 3) * 0.5).toFixed(1) + "%" },
    { label: `Active ${terminology.violationLabel}s`, value: String(23 + (tick % 5) - 2) },
    { label: "Cameras Online", value: "10 / 12" },
    { label: "Last Batch",     value: "PASS 97.2%" },
  ];
  return (
    <div className="bg-[#E5FFF9] border border-[#00775B]/20 rounded-md px-4 py-3 mb-4 sticky top-0 z-30">
      <div className="flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse bg-[#00775B]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#00775B]">LIVE</span>
        </div>
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-[#00775B]/60">{s.label}</span>
            <span className="text-sm font-black text-neutral-900 font-mono">{s.value}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-[9px] text-neutral-500 font-mono">
          <Radio className="w-3 h-3 text-[#00775B]" />
          Live feed active
        </div>
      </div>
    </div>
  );
};

// ─── 2. Compliance Sparkline ───────────────────────────────────────────────────
const ComplianceSparklinePanel = ({ terminology }: { terminology: QualityTerminology }) => (
  <Panel
    title={`${terminology.complianceLabel} — Live`}
    icon={Activity}
    info={`Tracks ${terminology.complianceLabel.toLowerCase()} in real-time over the last hour. Each point is a 5-minute reading. The red dashed line marks the 80% minimum threshold.`}
  >
    <ResponsiveContainer width="100%" height={140} minWidth={0} minHeight={0}>
      <AreaChart data={LIVE_COMPLIANCE_SPARKLINE} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
        <defs>
          <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.25} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="time" tick={false} axisLine={false} tickLine={false} />
        <YAxis domain={[75, 100]} tick={{ fontSize: 9, fill: "#94A3B8" }} width={28} />
        <Tooltip
          contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 10 }}
          formatter={(v: number) => [`${v}%`, terminology.complianceLabel]}
        />
        <ReferenceLine y={80} stroke={PASTEL.red} strokeDasharray="3 2" strokeWidth={1.5} />
        <Area type="monotone" dataKey="value" stroke={ACCENT} strokeWidth={2} fill="url(#compGrad)" isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
    <div className="flex items-center justify-between mt-1">
      <span className="text-[9px] text-neutral-400">Threshold: 80%</span>
      <span className="text-xs font-black text-[#00775B]">94.2% now</span>
    </div>
  </Panel>
);

// ─── 3. Violation Count Bars ───────────────────────────────────────────────────
const ViolationCountBarPanel = ({ terminology }: { terminology: QualityTerminology }) => (
  <Panel
    title={`${terminology.violationLabel} Rate — 5 min intervals`}
    icon={AlertTriangle}
    info={`Number of ${terminology.violationLabel.toLowerCase()}s detected every 5 minutes. Red bars are anomalous spikes. The amber line shows the rolling average to distinguish noise from trends.`}
  >
    <ResponsiveContainer width="100%" height={140} minWidth={0} minHeight={0}>
      <ComposedChart data={LIVE_VIOLATION_BARS} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="time" tick={false} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} width={20} />
        <Tooltip
          contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 10 }}
          formatter={(v: number, _: string, props: any) => [v, props.payload.isSpike ? "⚠ SPIKE" : `${terminology.violationLabel}s`]}
        />
        <Bar dataKey="count" isAnimationActive={false} radius={[1, 1, 0, 0]} barSize={3}>
          {LIVE_VIOLATION_BARS.map((entry, i) => (
            <Cell key={i} fill={entry.isSpike ? PASTEL.red : PASTEL.slate} />
          ))}
        </Bar>
        <Line type="monotone" dataKey="count" stroke={PASTEL.amber} strokeWidth={2} dot={false} isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
    <div className="flex gap-3 mt-1">
      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm" style={{ backgroundColor: PASTEL.red }} /><span className="text-[9px] text-neutral-500">Spike</span></div>
      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm" style={{ backgroundColor: PASTEL.slate }} /><span className="text-[9px] text-neutral-500">Normal</span></div>
      <div className="flex items-center gap-1"><div className="w-4 h-px" style={{ backgroundColor: PASTEL.amber }} /><span className="text-[9px] text-neutral-500">Rolling avg</span></div>
    </div>
  </Panel>
);

// ─── 4. Defect Rate — improved: gauge + trend stats + sparkline ────────────────
const DEFECT_TREND_DATA = [4.8, 4.6, 4.5, 4.3, 4.2, 4.0, 3.9, 3.8];

const DefectRateGaugePanel = ({ terminology }: { terminology: QualityTerminology }) => {
  const defectPct = 3.8;
  const trend = defectPct - DEFECT_TREND_DATA[0];
  const isImproving = trend < 0;
  return (
    <Panel
      title={terminology.defectRateLabel}
      icon={Activity}
      info={`Percentage of inspected items or frames flagged as defective right now. Green zone = on target (<5%). Amber = approaching threshold. Red = exceeds limit. The trend shows movement over the past 8 readings.`}
    >
      <div className="flex items-start gap-3">
        {/* Gauge */}
        <div className="flex flex-col items-center shrink-0">
          <D3Gauge
            value={defectPct}
            min={0}
            max={20}
            warnAt={5}
            critAt={10}
            label={terminology.gaugeLabel}
            unit="%"
            width={160}
            height={100}
          />
        </div>
        {/* Right panel: stats + sparkline */}
        <div className="flex-1 pt-2 space-y-2">
          {/* Current value callout */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#00775B]">{defectPct}%</span>
            <div className={cn("flex items-center gap-0.5 text-[10px] font-bold", isImproving ? "text-emerald-600" : "text-red-500")}>
              {isImproving ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {Math.abs(trend).toFixed(1)}% vs start of shift
            </div>
          </div>
          {/* 8-reading sparkline */}
          <div>
            <span className="text-[9px] text-neutral-400 uppercase tracking-wider">Shift trend</span>
            <D3Sparkline data={DEFECT_TREND_DATA} width={120} height={28} color="#00775B" fill />
          </div>
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
            {[
              { label: "Target",  value: "<5%",  ok: true  },
              { label: "30d Avg", value: "4.2%", ok: false },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[9px] text-neutral-400 uppercase tracking-wider">{s.label}</p>
                <p className={cn("text-xs font-black", s.ok ? "text-[#00775B]" : "text-amber-600")}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Progress bar to target */}
      <div className="mt-3 pt-3 border-t border-neutral-100">
        <div className="flex justify-between text-[9px] text-neutral-400 mb-1">
          <span>Current: {defectPct}%</span><span>Target: &lt;5%</span>
        </div>
        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-[#86EFAC]" style={{ width: `${(defectPct / 5) * 100}%` }} />
        </div>
        <p className="text-[9px] text-neutral-400 mt-1">
          {defectPct < 5 ? `✓ Within target — ${(5 - defectPct).toFixed(1)}pp headroom` : `⚠ ${(defectPct - 5).toFixed(1)}pp above target`}
        </p>
      </div>
    </Panel>
  );
};

// ─── 5. Violations by Type — with legend, %, totals ───────────────────────────
const TYPE_PASTEL_COLORS = [PASTEL.red, PASTEL.orange, PASTEL.blue, PASTEL.purple, PASTEL.slate];

const ViolationsByTypePanel = ({ terminology }: { terminology: QualityTerminology }) => {
  const sorted = [...VIOLATION_TYPE_DISTRIBUTION].sort((a, b) => b.value - a.value);
  const total  = sorted.reduce((s, d) => s + d.value, 0);

  const CustomLabel = ({ x, y, width, value }: any) => {
    const pct = ((value / total) * 100).toFixed(0);
    return (
      <text x={x + width + 4} y={y + 7} fontSize={9} fill="#64748B" dominantBaseline="middle">
        {pct}%
      </text>
    );
  };

  return (
    <Panel
      title={`${terminology.violationLabel}s by Type`}
      icon={AlertTriangle}
      info={`Breakdown of today's ${terminology.violationLabel.toLowerCase()}s by category. Bar length = number of incidents. Percentage shown is each type's share of all ${terminology.violationLabel.toLowerCase()}s detected so far.`}
    >
      <ResponsiveContainer width="100%" height={150} minWidth={0} minHeight={0}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }} barSize={12}>
          <XAxis type="number" tick={{ fontSize: 9, fill: "#94A3B8" }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#64748B" }} width={78} />
          <Tooltip
            contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 10 }}
            formatter={(v: number) => [`${v} incidents (${((v / total) * 100).toFixed(0)}% of total)`, "Count"]}
          />
          <Bar dataKey="value" radius={[0, 3, 3, 0]} isAnimationActive={false} label={<CustomLabel />}>
            {sorted.map((_, i) => (
              <Cell key={i} fill={TYPE_PASTEL_COLORS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 pt-2 border-t border-neutral-100">
        {sorted.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: TYPE_PASTEL_COLORS[i] }} />
            <span className="text-[9px] text-neutral-500">{d.name}</span>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-neutral-400 mt-1">Total: {total} {terminology.violationLabel.toLowerCase()}s detected today</p>
    </Panel>
  );
};

// ─── 6. Zone Heatmap Live — fixed color domain ─────────────────────────────────
const ZoneHeatmapLivePanel = ({ terminology }: { terminology: QualityTerminology }) => (
  <Panel
    title={`Live ${terminology.zoneLabel} Status`}
    icon={Activity}
    className="col-span-2"
    info={`Real-time compliance heatmap across all monitored zones. Color = compliance rate: red (<75%) signals critical non-compliance, yellow (75–90%) is a warning, green (>90%) is on target. Red border = active critical alert in that zone.`}
  >
    <D3ZoneHeatmap
      zones={QUALITY_ZONES}
      violationLabel={terminology.violationLabel}
      columns={6}
      cellHeight={68}
      colorDomain={[60, 100]}
    />
    <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-neutral-100">
      <span className="text-[9px] text-neutral-400">Low compliance</span>
      {[60, 70, 80, 90, 100].map((v) => (
        <div key={v} className="w-5 h-2.5 rounded-sm" style={{ backgroundColor: d3ColorFor(v, 0.85) }} />
      ))}
      <span className="text-[9px] text-neutral-400">High compliance</span>
    </div>
  </Panel>
);

// ─── 7. Alert Feed — ack/resolve with feedback + low=blue ─────────────────────
const AlertFeedLivePanel = () => {
  const [alertStates, setAlertStates] = useState<Record<string, { status: string; time?: string }>>(
    () => Object.fromEntries(QUALITY_ALERTS.map((a) => [a.id, { status: a.status }]))
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toast, setToast]       = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const ack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setAlertStates((s) => ({ ...s, [id]: { status: "acknowledged", time: now } }));
    showToast("Alert acknowledged — you are now tracking this.");
  };

  const resolve = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setAlertStates((s) => ({ ...s, [id]: { status: "resolved", time: now } }));
    showToast("Alert resolved and closed.");
  };

  const severityStyle: Record<string, { border: string; dot: string; text: string; badge: string; bg: string }> = {
    critical: { border: "border-l-4 border-red-400",    dot: "bg-red-400",    text: "text-red-600",    badge: "bg-red-100 text-red-700",    bg: "bg-red-50/60"    },
    high:     { border: "border-l-4 border-orange-400", dot: "bg-orange-400", text: "text-orange-600", badge: "bg-orange-100 text-orange-700", bg: "bg-orange-50/60" },
    medium:   { border: "border-l-4 border-amber-400",  dot: "bg-amber-400",  text: "text-amber-700",  badge: "bg-amber-100 text-amber-800",  bg: "bg-amber-50/60"  },
    low:      { border: "border-l-4 border-blue-400",   dot: "bg-blue-400",   text: "text-blue-600",   badge: "bg-blue-100 text-blue-700",    bg: "bg-blue-50/60"   },
  };

  return (
    <Panel
      title="Alert Feed"
      icon={AlertCircle}
      className="col-span-2"
      info="Live feed of quality alerts sorted by severity and time. Click any alert to expand it. Acknowledge = you are taking ownership of the alert. Resolve = the issue has been corrected and the alert is closed."
    >
      <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
        {QUALITY_ALERTS.map((alert) => {
          const state  = alertStates[alert.id];
          const style  = severityStyle[alert.severity] ?? severityStyle.low;
          const isOpen = expanded === alert.id;
          const isDone = state.status === "resolved";
          return (
            <div
              key={alert.id}
              className={cn(
                "rounded-sm px-3 py-2 cursor-pointer transition-all",
                style.border, style.bg,
                isDone && "opacity-40"
              )}
              onClick={() => setExpanded(isOpen ? null : alert.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />
                  <span className={cn("text-[9px] font-black shrink-0 px-1 py-0.5 rounded-sm", style.badge)}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-neutral-700 truncate">{alert.title}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {state.status === "acknowledged" && (
                    <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3" /> Acked
                    </span>
                  )}
                  {state.status === "resolved" && (
                    <span className="text-[9px] text-neutral-500 font-bold flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3" /> Resolved
                    </span>
                  )}
                  <span className="text-[9px] text-neutral-400">{alert.timestamp ?? alert.time}</span>
                </div>
              </div>
              {isOpen && (
                <div className="mt-2 pt-2 border-t border-neutral-200/60">
                  <p className="text-[10px] text-neutral-500 mb-1.5">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-2 text-[9px] text-neutral-400 mb-2">
                    <span>Zone: <strong className="text-neutral-600">{alert.zone}</strong></span>
                    <span>·</span>
                    <span>Camera: <strong className="text-neutral-600">{alert.camera}</strong></span>
                    {state.time && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {state.status === "acknowledged" ? `Acked at ${state.time}` : `Resolved at ${state.time}`}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {state.status === "open" && (
                      <button
                        onClick={(e) => ack(alert.id, e)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold rounded-sm bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" /> Acknowledge
                      </button>
                    )}
                    {state.status === "acknowledged" && (
                      <button
                        onClick={(e) => resolve(alert.id, e)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold rounded-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" /> Mark Resolved
                      </button>
                    )}
                    {state.status === "open" && (
                      <button
                        onClick={(e) => resolve(alert.id, e)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold rounded-sm bg-[#00775B] text-white hover:bg-[#005f47] transition-colors"
                      >
                        <X className="w-3 h-3" /> Resolve
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Toast */}
      {toast && (
        <div className="mt-2 px-3 py-1.5 bg-neutral-800 text-white text-[10px] rounded-sm flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}
    </Panel>
  );
};

// ─── 8. Repeat Violations — redesigned as ranked risk list ────────────────────
const REPEAT_DATA = [
  { id: "EMP-014", name: "J. Mitchell",  dept: "Warehouse",  count: 12, yesterday: 9,  trend: +3, types: ["No Helmet","Zone Breach"],  spark: [3,2,4,2,3,5,4,3,4,3,2,5] },
  { id: "EMP-022", name: "A. Torres",    dept: "Factory",    count: 9,  yesterday: 10, trend: -1, types: ["PPE Missing","Loitering"],   spark: [2,3,2,1,3,2,3,2,1,2,3,2] },
  { id: "EMP-007", name: "R. Okafor",    dept: "Logistics",  count: 8,  yesterday: 7,  trend: +1, types: ["Speed Limit"],               spark: [1,2,3,2,1,2,1,3,2,1,2,2] },
  { id: "EMP-031", name: "M. Singh",     dept: "Operations", count: 7,  yesterday: 8,  trend: -1, types: ["Zone Breach"],               spark: [2,1,2,2,1,2,1,2,2,1,2,1] },
];
const MAX_COUNT = REPEAT_DATA[0].count;

const RepeatViolatorPanel = ({ terminology }: { terminology: QualityTerminology }) => (
  <Panel
    title={`Repeat ${terminology.violationLabel}s`}
    icon={AlertTriangle}
    info={`Staff members with the highest ${terminology.violationLabel.toLowerCase()} count today. The bar shows count relative to the top offender. Trend arrow shows change vs yesterday. Tap a row for violation types.`}
  >
    <div className="space-y-2.5">
      {REPEAT_DATA.map((r, idx) => {
        const riskColor = idx === 0 ? "text-red-600 bg-red-50" : idx === 1 ? "text-orange-600 bg-orange-50" : "text-amber-700 bg-amber-50";
        const barColor  = idx === 0 ? PASTEL.red : idx === 1 ? PASTEL.orange : PASTEL.amber;
        const isWorse   = r.trend > 0;
        return (
          <div key={r.id} className="flex items-center gap-2.5 group">
            {/* Rank + avatar */}
            <div className="flex flex-col items-center w-5 shrink-0">
              <span className="text-[9px] font-bold text-neutral-300">#{idx + 1}</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-neutral-400" />
            </div>
            {/* Name + dept */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold text-neutral-800">{r.name}</span>
                <span className="text-[8px] text-neutral-400 font-mono">{r.id}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-neutral-400">{r.dept}</span>
                {r.types.map((t) => (
                  <span key={t} className="text-[8px] px-1 bg-neutral-100 text-neutral-500 rounded-sm">{t}</span>
                ))}
              </div>
              {/* Progress bar */}
              <div className="mt-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(r.count / MAX_COUNT) * 100}%`, backgroundColor: barColor }}
                />
              </div>
            </div>
            {/* Count + trend + sparkline */}
            <div className="flex flex-col items-end shrink-0 w-20">
              <div className="flex items-center gap-1">
                <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded-sm", riskColor)}>{r.count}</span>
                <div className={cn("flex items-center text-[9px] font-bold", isWorse ? "text-red-500" : "text-emerald-600")}>
                  {isWorse ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {Math.abs(r.trend)}
                </div>
              </div>
              <D3Sparkline data={r.spark} width={72} height={20} color={isWorse ? "#EF4444" : "#22C55E"} fill />
            </div>
          </div>
        );
      })}
    </div>
  </Panel>
);

// ─── 9. Time to Compliance — meaningful histogram ─────────────────────────────
const TTC_COLORS = [PASTEL.green, PASTEL.teal, PASTEL.amber, PASTEL.orange, PASTEL.red];
const TTC_LABELS = ["Very Fast", "Fast", "Moderate", "Slow", "Critical"];

const TimeToCompliancePanel = () => {
  const total  = TIME_TO_COMPLIANCE_DATA.reduce((s, d) => s + d.count, 0);
  const median = "5–15 min"; // 82 / 223 is highest bucket after 0-5m
  const fast   = ((TIME_TO_COMPLIANCE_DATA[0].count + TIME_TO_COMPLIANCE_DATA[1].count) / total * 100).toFixed(0);

  const CustomLabel = ({ x, y, width, value }: any) => {
    const pct = ((value / total) * 100).toFixed(0);
    return (
      <text x={x + width / 2} y={y - 3} textAnchor="middle" fontSize={8} fill="#94A3B8">
        {pct}%
      </text>
    );
  };

  return (
    <Panel
      title="Resolution Time"
      icon={Clock}
      info={`How quickly violations are corrected after detection. Green bars = resolved fast, red bars = took too long. The goal is to maximise the green (0–15 min) portion. ${fast}% of violations are resolved within 15 minutes.`}
    >
      {/* Summary callout */}
      <div className="flex gap-3 mb-2">
        <div className="flex-1 bg-emerald-50 rounded-sm px-2 py-1.5">
          <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Fast Resolution</p>
          <p className="text-sm font-black text-emerald-700">{fast}%</p>
          <p className="text-[9px] text-emerald-500">resolved in &lt;15 min</p>
        </div>
        <div className="flex-1 bg-amber-50 rounded-sm px-2 py-1.5">
          <p className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">Typical Time</p>
          <p className="text-sm font-black text-amber-700">{median}</p>
          <p className="text-[9px] text-amber-500">most common range</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={120} minWidth={0} minHeight={0}>
        <BarChart data={TIME_TO_COMPLIANCE_DATA} margin={{ top: 16, right: 5, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="bucket" tick={{ fontSize: 9, fill: "#94A3B8" }} />
          <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} width={25} />
          <Tooltip
            contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 10 }}
            formatter={(v: number) => [`${v} incidents (${((v / total) * 100).toFixed(0)}% of total)`, "Resolved"]}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]} isAnimationActive={false} label={<CustomLabel />}>
            {TIME_TO_COMPLIANCE_DATA.map((_, i) => (
              <Cell key={i} fill={TTC_COLORS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between mt-1 px-1">
        {TTC_LABELS.map((l, i) => (
          <div key={l} className="flex items-center gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TTC_COLORS[i] }} />
            <span className="text-[8px] text-neutral-400 hidden sm:inline">{l}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
};

// ─── 10. Violation Breakdown — improved donut ─────────────────────────────────
const DONUT_PASTELS = [PASTEL.orange, PASTEL.blue, PASTEL.red, PASTEL.slate];

const DefectBreakdownPanel = ({ terminology }: { terminology: QualityTerminology }) => {
  const total = DEFECT_DISTRIBUTION.reduce((s, d) => s + d.value, 0);
  const [active, setActive] = useState<number | null>(null);

  return (
    <Panel
      title={`${terminology.violationLabel} Breakdown`}
      icon={Activity}
      info={`Root-cause breakdown of detected ${terminology.violationLabel.toLowerCase()}s. Hover over a segment to highlight it. Percentages show each category's share of total ${terminology.violationLabel.toLowerCase()} events.`}
    >
      <div className="flex items-center gap-4">
        {/* Donut — larger */}
        <div className="shrink-0">
          <PieChart width={130} height={130}>
            <Pie
              data={DEFECT_DISTRIBUTION}
              cx={65} cy={65}
              innerRadius={36} outerRadius={58}
              dataKey="value"
              stroke="none"
              onMouseEnter={(_, i) => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              {DEFECT_DISTRIBUTION.map((_, i) => (
                <Cell
                  key={i}
                  fill={DONUT_PASTELS[i % DONUT_PASTELS.length]}
                  opacity={active === null || active === i ? 1 : 0.4}
                  style={{ cursor: "pointer", transition: "opacity 0.15s" }}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 10 }}
              formatter={(v: number, _: any, props: any) => [`${v}% (${((v / total) * 100).toFixed(0)}% share)`, props.payload.name]}
            />
          </PieChart>
        </div>
        {/* Legend with progress bars */}
        <div className="flex-1 space-y-2">
          <p className="text-[9px] text-neutral-400 uppercase tracking-wider mb-1">Total: {total} events</p>
          {DEFECT_DISTRIBUTION.map((d, i) => (
            <div
              key={d.name}
              className={cn("transition-opacity", active !== null && active !== i && "opacity-40")}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DONUT_PASTELS[i % DONUT_PASTELS.length] }} />
                  <span className="text-[10px] text-neutral-600 font-medium">{d.name}</span>
                </div>
                <span className="text-[10px] font-black text-neutral-800">{d.value}%</span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${d.value}%`, backgroundColor: DONUT_PASTELS[i % DONUT_PASTELS.length] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};

// ─── 11. Shift Results (Batch Ticker) — click to expand ───────────────────────
const BATCH_DETAILS: Record<string, { inspector: string; zone: string; violations: number; note: string }> = {
  "BATCH-001": { inspector: "J. Smith",   zone: "Warehouse Zone A", violations: 2,  note: "All PPE checks passed. Minor camera occlusion resolved." },
  "BATCH-002": { inspector: "R. Brown",   zone: "Factory Floor B",  violations: 4,  note: "Two zone breach warnings issued. Corrected on re-check." },
  "BATCH-003": { inspector: "A. Torres",  zone: "Loading Dock",     violations: 18, note: "Multiple No-Helmet violations. Supervisor notified." },
  "BATCH-004": { inspector: "J. Smith",   zone: "Corridor 3B",      violations: 1,  note: "Clean inspection. One loitering alert auto-resolved." },
  "BATCH-005": { inspector: "M. Singh",   zone: "Perimeter North",  violations: 3,  note: "Speed limit warning logged. No further action required." },
  "BATCH-006": { inspector: "R. Okafor",  zone: "Back Alley",       violations: 22, note: "Compliance below threshold. Re-inspection scheduled." },
  "BATCH-007": { inspector: "J. Mitchell",zone: "Server Room A",    violations: 5,  note: "Restricted access check passed with minor anomalies." },
  "BATCH-008": { inspector: "A. Torres",  zone: "Retail Floor",     violations: 2,  note: "Smooth inspection. Compliance maintained above target." },
  "BATCH-009": { inspector: "M. Singh",   zone: "Parking Lot A",    violations: 14, note: "Vehicle speed violations detected. Barriers reviewed." },
  "BATCH-010": { inspector: "J. Smith",   zone: "Main Entrance",    violations: 4,  note: "Tailgating alert issued. Badge policy reminder posted." },
};

const BatchTickerPanel = ({ terminology }: { terminology: QualityTerminology }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const detail = selected ? BATCH_DETAILS[selected] : null;
  const batch  = selected ? BATCH_TICKER_DATA.find((b) => b.id === selected) : null;

  return (
    <Panel
      title={`${terminology.batchLabel} Results`}
      icon={CheckCircle}
      info={`Results of each recent inspection batch/shift. Green = passed compliance threshold (≥80%). Red = failed. Click any card to see batch details — inspector, zone, violation count, and notes.`}
    >
      <div className="grid grid-cols-5 gap-1.5">
        {BATCH_TICKER_DATA.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelected(selected === b.id ? null : b.id)}
            className={cn(
              "flex flex-col items-center justify-center rounded-sm py-2 border transition-all",
              b.status === "pass"
                ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                : "bg-red-50 border-red-200 hover:bg-red-100",
              selected === b.id && "ring-2 ring-offset-1 ring-[#00775B]"
            )}
          >
            {b.status === "pass"
              ? <CheckCircle className="w-4 h-4 text-emerald-500" />
              : <XCircle     className="w-4 h-4 text-red-500" />}
            <span className="text-[8px] font-mono text-neutral-400 mt-1">{b.timestamp}</span>
            <span className={cn("text-[9px] font-bold", b.status === "pass" ? "text-emerald-700" : "text-red-600")}>
              {b.passRate}%
            </span>
          </button>
        ))}
      </div>

      {/* Expanded detail panel */}
      {selected && batch && detail && (
        <div className={cn(
          "mt-3 rounded-sm border p-3",
          batch.status === "pass" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
        )}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {batch.status === "pass"
                ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                : <XCircle     className="w-4 h-4 text-red-500" />}
              <span className="text-[11px] font-black text-neutral-800">{selected}</span>
              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-sm", batch.status === "pass" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                {batch.status.toUpperCase()} — {batch.passRate}%
              </span>
            </div>
            <button onClick={() => setSelected(null)} className="text-neutral-400 hover:text-neutral-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
            <div><span className="text-neutral-400">Time: </span><span className="font-bold text-neutral-700">{batch.timestamp}</span></div>
            <div><span className="text-neutral-400">Inspector: </span><span className="font-bold text-neutral-700">{detail.inspector}</span></div>
            <div><span className="text-neutral-400">Zone: </span><span className="font-bold text-neutral-700">{detail.zone}</span></div>
            <div><span className="text-neutral-400">Violations: </span><span className={cn("font-black", detail.violations > 10 ? "text-red-600" : "text-amber-600")}>{detail.violations} detected</span></div>
          </div>
          <p className="text-[10px] text-neutral-500 mt-2 pt-2 border-t border-neutral-200/60">{detail.note}</p>
        </div>
      )}
    </Panel>
  );
};

// ─── 12. Camera Health Panel ───────────────────────────────────────────────────
const CameraHealthPanel = () => {
  const statusIcon: Record<string, React.ReactNode> = {
    online:   <Wifi    className="w-3.5 h-3.5 text-emerald-500" />,
    degraded: <Wifi    className="w-3.5 h-3.5 text-amber-500"   />,
    offline:  <WifiOff className="w-3.5 h-3.5 text-red-500"     />,
  };
  const statusColor: Record<string, string> = {
    online: "text-emerald-600", degraded: "text-amber-600", offline: "text-red-600",
  };
  return (
    <Panel
      title="Camera Health"
      icon={Camera}
      className="col-span-2"
      collapsible
      info="Live status of all connected cameras. Online = feeding clean data. Degraded = reduced frame rate or confidence. Offline = no signal — data from this zone is unreliable."
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {CAMERA_HEALTH_DATA.map((cam) => (
          <div
            key={cam.id}
            className={cn(
              "rounded-sm border px-3 py-2",
              cam.status === "online"   ? "bg-white border-neutral-200"  :
              cam.status === "degraded" ? "bg-amber-50 border-amber-200" :
              "bg-red-50 border-red-200"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-neutral-800">{cam.name}</span>
              {statusIcon[cam.status]}
            </div>
            <p className="text-[9px] text-neutral-500 mb-1">{cam.zone}</p>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-neutral-500">{cam.fps} fps</span>
              <span className={cn("text-[9px] font-bold", statusColor[cam.status])}>
                {cam.status === "offline" ? "OFFLINE" : `${cam.confidence}%`}
              </span>
            </div>
            <p className="text-[8px] text-neutral-400 mt-0.5">{cam.lastFrame}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
};

// ─── Bottom Notification Bar ───────────────────────────────────────────────────
const BottomNotificationBar = ({ alerts }: { alerts: typeof QUALITY_ALERTS }) => {
  const [dismissed, setDismissed] = useState(false);
  const critical = alerts.filter((a) => a.status === "open" && (a.severity === "critical" || a.severity === "high"));
  if (!critical.length || dismissed) return null;
  const top = critical[0];
  return (
    <div
      className="fixed bottom-0 right-0 z-50 flex items-center gap-4 px-6 py-3 bg-white shadow-lg"
      style={{ left: 224, borderTop: `2px solid ${PASTEL.red}` }}
    >
      <div className="w-2 h-2 rounded-full animate-pulse bg-red-400" />
      <span className="font-bold text-red-600 uppercase text-[10px] tracking-widest">{top.severity}</span>
      <span className="text-neutral-700 text-[11px]">{top.title}</span>
      <span className="text-neutral-400 text-[10px]">· {top.zone}</span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-auto px-3 py-1 text-[10px] font-bold rounded-sm border border-neutral-300 text-neutral-600 hover:bg-neutral-50 transition-colors"
      >
        Dismiss
      </button>
      <span className="text-neutral-400 text-[9px]">+ {critical.length - 1} more</span>
    </div>
  );
};

// ─── Main Export ───────────────────────────────────────────────────────────────
export const MonitoringView = ({ terminology }: MonitoringViewProps) => {
  return (
    <div className="pb-16">
      <LiveStatusBar terminology={terminology} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ComplianceSparklinePanel terminology={terminology} />
        <ViolationCountBarPanel   terminology={terminology} />

        <DefectRateGaugePanel     terminology={terminology} />
        <ViolationsByTypePanel    terminology={terminology} />

        <ZoneHeatmapLivePanel     terminology={terminology} />
        <AlertFeedLivePanel />

        <RepeatViolatorPanel      terminology={terminology} />
        <TimeToCompliancePanel />

        <DefectBreakdownPanel     terminology={terminology} />
        <BatchTickerPanel         terminology={terminology} />

        <CameraHealthPanel />
      </div>

      <BottomNotificationBar alerts={QUALITY_ALERTS} />
    </div>
  );
};
