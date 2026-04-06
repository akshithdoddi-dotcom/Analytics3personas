import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  TrendingUp, TrendingDown, Minus, Activity, Users, ShieldOff,
  MapPin, Eye, UserX, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { IdentityTerminology } from "../IdentityAnalytics";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const KPI_DATA = {
  identifications: { value: 2840, delta: 6,    unit: "",  trend: [2200, 2400, 2650, 2800, 2750, 2900, 2840] },
  blacklistAlerts: { value: 1,    delta: -50,   unit: "",  trend: [4, 3, 2, 2, 3, 1, 1] },
  matchAccuracy:   { value: 97.2, delta: 0.4,   unit: "%", trend: [96.1, 96.3, 96.8, 97.0, 96.9, 97.1, 97.2] },
  uniqueVisitors:  { value: 412,  delta: 8,     unit: "",  trend: [310, 340, 370, 395, 380, 405, 412] },
};

const BY_HOUR_DATA = [
  { hour: "06", count: 45  }, { hour: "07", count: 123 }, { hour: "08", count: 287 },
  { hour: "09", count: 312 }, { hour: "10", count: 245 }, { hour: "11", count: 198 },
  { hour: "12", count: 234 }, { hour: "13", count: 189 }, { hour: "14", count: 223 },
  { hour: "15", count: 267 }, { hour: "16", count: 298 }, { hour: "17", count: 219 },
  { hour: "18", count: 87  }, { hour: "19", count: 34  }, { hour: "20", count: 12  },
];

const DAILY_STACKED = [
  { day: "Mon", whitelist: 380, unknown: 82,  blacklist: 1, vip: 18 },
  { day: "Tue", whitelist: 410, unknown: 95,  blacklist: 0, vip: 22 },
  { day: "Wed", whitelist: 395, unknown: 78,  blacklist: 2, vip: 19 },
  { day: "Thu", whitelist: 425, unknown: 88,  blacklist: 1, vip: 24 },
  { day: "Fri", whitelist: 450, unknown: 102, blacklist: 0, vip: 27 },
  { day: "Sat", whitelist: 210, unknown: 45,  blacklist: 0, vip: 11 },
  { day: "Sun", whitelist: 180, unknown: 38,  blacklist: 0, vip: 9  },
];

const DENIAL_TREND = [
  { day: "Mon", blacklist: 3, unknown: 8,  tailgating: 2 },
  { day: "Tue", blacklist: 1, unknown: 12, tailgating: 3 },
  { day: "Wed", blacklist: 4, unknown: 7,  tailgating: 1 },
  { day: "Thu", blacklist: 2, unknown: 9,  tailgating: 2 },
  { day: "Fri", blacklist: 1, unknown: 11, tailgating: 4 },
  { day: "Sat", blacklist: 0, unknown: 4,  tailgating: 1 },
  { day: "Sun", blacklist: 0, unknown: 3,  tailgating: 0 },
];

const VISIT_FREQ = [
  { range: "1×",   count: 212 },
  { range: "2–3×", count: 134 },
  { range: "4–7×", count: 48  },
  { range: "8×+",  count: 18  },
];

const ENTRY_POINTS = [
  { name: "Gate A – Main",       total: 1240, whitelistRate: 91.2, unknownRate: 8.1,  blacklistHits: 1, peakHour: "08:00", status: "normal"   },
  { name: "Gate B – Side",       total: 780,  whitelistRate: 87.4, unknownRate: 12.1, blacklistHits: 2, peakHour: "09:00", status: "critical"  },
  { name: "Lobby – Cam 03",      total: 560,  whitelistRate: 84.3, unknownRate: 15.2, blacklistHits: 0, peakHour: "08:30", status: "watch"     },
  { name: "Parking – Cam 05",    total: 320,  whitelistRate: 92.8, unknownRate: 7.2,  blacklistHits: 0, peakHour: "07:45", status: "normal"    },
  { name: "Side Entry – Cam 07", total: 280,  whitelistRate: 79.6, unknownRate: 20.1, blacklistHits: 0, peakHour: "17:00", status: "watch"     },
];

const UNKNOWN_SUMMARY = [
  { trackerId: "TRK-004", appearances: 8, cameras: "Gate B, Lobby, Side Entry",         firstSeen: "Mon 09:12", lastSeen: "Today 17:42", recurring: true  },
  { trackerId: "TRK-019", appearances: 3, cameras: "Gate A, Lobby",                      firstSeen: "Wed 14:30", lastSeen: "Today 11:15", recurring: false },
  { trackerId: "TRK-027", appearances: 5, cameras: "Side Entry, Stairwell, Elevator",    firstSeen: "Thu 08:00", lastSeen: "Today 16:50", recurring: true  },
];

// Traffic heatmap (hour x day)
const DAYS_HM = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TRAFFIC_HEATMAP: { hour: number; day: string; count: number }[] = [];
for (const day of DAYS_HM) {
  for (let h = 6; h <= 20; h++) {
    const isWeekend = day === "Sat" || day === "Sun";
    const isPeak = h >= 8 && h <= 9;
    const base = isWeekend ? 20 : 60;
    const pseudo = ((h * 13 + DAYS_HM.indexOf(day) * 7) % 20);
    TRAFFIC_HEATMAP.push({ day, hour: h, count: Math.round(base * (isPeak ? 3.5 : 1) + pseudo) });
  }
}

const LIST_WEEKLY = [
  { name: "Whitelist", value: 2450, color: "#00775B" },
  { name: "VIP",       value: 130,  color: "#F59E0B" },
  { name: "Unknown",   value: 528,  color: "#94A3B8" },
  { name: "Blacklist", value: 4,    color: "#EF4444" },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

const ACCENT  = "#00775B";
const DANGER  = "#EF4444";
const WARNING = "#F59E0B";

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white border border-neutral-200 rounded-md p-5 shadow-sm", className)}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title, action }: { icon: React.ElementType; title: string; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-[#E5FFF9] text-[#00775B] rounded-sm">
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-700">{title}</h3>
    </div>
    {action}
  </div>
);

const DeltaChip = ({ value, suffix = "%", invertColor = false }: { value: number; suffix?: string; invertColor?: boolean }) => {
  const isGood = invertColor ? value < 0 : value > 0;
  const isBad  = invertColor ? value > 0 : value < 0;
  if (value > 0) return (
    <span className={cn("flex items-center gap-0.5 text-[10px] font-bold", isGood ? "text-emerald-600" : "text-red-600")}>
      <TrendingUp className="w-3 h-3" /> +{value}{suffix}
    </span>
  );
  if (value < 0) return (
    <span className={cn("flex items-center gap-0.5 text-[10px] font-bold", isBad ? "text-red-600" : "text-emerald-600")}>
      <TrendingDown className="w-3 h-3" /> {value}{suffix}
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold text-neutral-400">
      <Minus className="w-3 h-3" /> {value}{suffix}
    </span>
  );
};

// ─── 1. Live Summary Strip ────────────────────────────────────────────────────

const LiveSummaryStrip = ({ terminology }: { terminology: IdentityTerminology }) => (
  <div className="bg-[#E5FFF9] border border-[#00775B]/20 rounded-md px-5 py-3 mb-5 flex flex-wrap gap-6 items-center">
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-[#00775B] animate-pulse" />
      <span className="text-[9px] font-bold uppercase tracking-widest text-[#00775B]">LIVE</span>
    </div>

    {[
      { label: `${terminology.identLabel} Rate`,       value: "42 / min",   danger: false, warn: false },
      { label: "Blacklist Alerts Active",               value: "1",          danger: true,  warn: false },
      { label: "Unknowns at Access Points",             value: "7",          danger: false, warn: true  },
      { label: "Cameras Online",                        value: "10 / 12",   danger: false, warn: false },
    ].map((s) => (
      <div key={s.label} className="flex flex-col">
        <span className="text-[9px] uppercase tracking-widest text-[#00775B]/60">{s.label}</span>
        <span className={cn(
          "text-lg font-black font-mono",
          s.danger ? "text-red-600" : s.warn ? "text-amber-600" : "text-[#003d2e]"
        )}>
          {s.value}
        </span>
      </div>
    ))}

    <button className="ml-auto flex items-center gap-1 text-[10px] font-bold text-[#00775B] underline underline-offset-2 hover:text-[#005a44] transition-colors">
      <ArrowUpRight className="w-3 h-3" />
      View Monitoring
    </button>
  </div>
);

// ─── 2. KPI Cards ─────────────────────────────────────────────────────────────

const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-6">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
};

const KPICards = ({ terminology }: { terminology: IdentityTerminology }) => {
  const cards = [
    {
      label: `${terminology.identLabel}s Today`,
      value: KPI_DATA.identifications.value.toLocaleString(),
      delta: KPI_DATA.identifications.delta,
      trend: KPI_DATA.identifications.trend,
      color: ACCENT,
      invertColor: false,
    },
    {
      label: "Blacklist Alerts",
      value: String(KPI_DATA.blacklistAlerts.value),
      delta: KPI_DATA.blacklistAlerts.delta,
      trend: KPI_DATA.blacklistAlerts.trend,
      color: DANGER,
      invertColor: true,
    },
    {
      label: `${terminology.matchScoreLabel} Accuracy`,
      value: `${KPI_DATA.matchAccuracy.value}%`,
      delta: KPI_DATA.matchAccuracy.delta,
      trend: KPI_DATA.matchAccuracy.trend,
      color: ACCENT,
      invertColor: false,
    },
    {
      label: `Unique ${terminology.entityLabel}s`,
      value: String(KPI_DATA.uniqueVisitors.value),
      delta: KPI_DATA.uniqueVisitors.delta,
      trend: KPI_DATA.uniqueVisitors.trend,
      color: "#3B82F6",
      invertColor: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      {cards.map((c) => (
        <Card key={c.label} className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">{c.label}</p>
          <p className="text-2xl font-black text-neutral-900 mb-1">{c.value}</p>
          <div className="flex items-center gap-2 mb-2">
            <DeltaChip value={c.delta} invertColor={c.invertColor} />
            <span className="text-[9px] text-neutral-400">vs last week</span>
          </div>
          <MiniSparkline data={c.trend} color={c.color} />
        </Card>
      ))}
    </div>
  );
};

// ─── 3. Identification Volume ─────────────────────────────────────────────────

const IdentificationVolumeSection = ({ terminology }: { terminology: IdentityTerminology }) => {
  const peakEntry = BY_HOUR_DATA.reduce((a, b) => (b.count > a.count ? b : a));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
      {/* By hour */}
      <Card>
        <SectionTitle icon={Activity} title={`${terminology.identLabel}s by Hour – Today`} />
        <ResponsiveContainer width="100%" height={200} minWidth={0} minHeight={0}>
          <BarChart data={BY_HOUR_DATA} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} width={28} />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 10 }}
              formatter={(v: number) => [v, terminology.identLabel]}
            />
            <ReferenceLine x={peakEntry.hour} stroke={WARNING} strokeDasharray="3 2" label={{ value: "Peak", fontSize: 8, fill: WARNING }} />
            <Bar dataKey="count" fill={ACCENT} radius={[2, 2, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Daily stacked */}
      <Card>
        <SectionTitle icon={Activity} title="Last 7 Days – By List Type" />
        <ResponsiveContainer width="100%" height={200} minWidth={0} minHeight={0}>
          <BarChart data={DAILY_STACKED} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} width={28} />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 10 }}
            />
            <Legend wrapperStyle={{ fontSize: 9 }} />
            <Bar dataKey="whitelist" stackId="a" fill={ACCENT}     isAnimationActive={false} name="Whitelist" />
            <Bar dataKey="vip"       stackId="a" fill={WARNING}    isAnimationActive={false} name="VIP"       />
            <Bar dataKey="unknown"   stackId="a" fill="#94A3B8"    isAnimationActive={false} name="Unknown"   />
            <Bar dataKey="blacklist" stackId="a" fill={DANGER}     radius={[2, 2, 0, 0]} isAnimationActive={false} name="Blacklist" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

// ─── 4. Access & Authorization ────────────────────────────────────────────────

const AccessAuthSection = ({ terminology }: { terminology: IdentityTerminology }) => {
  const total = LIST_WEEKLY.reduce((s, d) => s + d.value, 0);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
      {/* Pie */}
      <Card>
        <SectionTitle icon={Users} title="Weekly List Membership" />
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={140} height={140} minWidth={0} minHeight={0}>
            <PieChart>
              <Pie data={LIST_WEEKLY} cx="50%" cy="50%" innerRadius={38} outerRadius={62} dataKey="value" isAnimationActive={false}>
                {LIST_WEEKLY.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 10 }}
                formatter={(v: number) => [v, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 flex-1">
            {LIST_WEEKLY.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-[10px] text-neutral-600">{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-neutral-900">{d.value.toLocaleString()}</span>
                  <span className="text-[9px] text-neutral-400">{((d.value / total) * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Denial by reason */}
      <Card>
        <SectionTitle icon={ShieldOff} title="Access Denied – By Reason (7 days)" />
        <ResponsiveContainer width="100%" height={180} minWidth={0} minHeight={0}>
          <BarChart data={DENIAL_TREND} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} width={28} />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 10 }}
            />
            <Legend wrapperStyle={{ fontSize: 9 }} />
            <Bar dataKey="blacklist"  stackId="a" fill={DANGER}   isAnimationActive={false} name={terminology.blacklistLabel} />
            <Bar dataKey="unknown"    stackId="a" fill="#94A3B8"  isAnimationActive={false} name={terminology.unknownLabel}   />
            <Bar dataKey="tailgating" stackId="a" fill={WARNING}  radius={[2, 2, 0, 0]} isAnimationActive={false} name="Tailgating" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

// ─── 5. Visitor Behavior ─────────────────────────────────────────────────────

const maxTrafficCount = Math.max(...TRAFFIC_HEATMAP.map((d) => d.count));

function heatmapColor(count: number): string {
  const ratio = count / maxTrafficCount;
  const r = Math.round(239 + (29  - 239) * ratio);
  const g = Math.round(246 + (78  - 246) * ratio);
  const b = Math.round(255 + (216 - 255) * ratio);
  return `rgb(${r},${g},${b})`;
}

const VisitorBehaviorSection = ({ terminology }: { terminology: IdentityTerminology }) => {
  const hourLabels = Array.from({ length: 15 }, (_, i) => String(6 + i));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
      {/* Visit frequency */}
      <Card>
        <SectionTitle icon={Activity} title={`${terminology.entityLabel} Visit Frequency`} />
        <ResponsiveContainer width="100%" height={180} minWidth={0} minHeight={0}>
          <BarChart data={VISIT_FREQ} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="range" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} width={28} />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 10 }}
              formatter={(v: number) => [v, `${terminology.entityLabel}s`]}
            />
            <Bar dataKey="count" fill="#3B82F6" radius={[2, 2, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Traffic heatmap */}
      <Card>
        <SectionTitle icon={Activity} title="Traffic Heatmap – Hour × Day" />
        <div className="overflow-x-auto">
          {/* Hour labels */}
          <div className="flex ml-10 mb-1">
            {hourLabels.map((h) => (
              <div key={h} className="flex-1 text-center text-[8px] text-neutral-400 font-mono">{h}</div>
            ))}
          </div>
          {/* Grid */}
          {DAYS_HM.map((day) => {
            const row = TRAFFIC_HEATMAP.filter((d) => d.day === day).sort((a, b) => a.hour - b.hour);
            return (
              <div key={day} className="flex items-center mb-0.5">
                <div className="w-10 text-[9px] font-medium text-neutral-500 shrink-0">{day}</div>
                <div className="flex flex-1 gap-0.5">
                  {row.map((cell) => (
                    <div
                      key={cell.hour}
                      className="flex-1 h-5 rounded-sm"
                      style={{ backgroundColor: heatmapColor(cell.count) }}
                      title={`${day} ${cell.hour}:00 – ${cell.count} idents`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-2 mt-2 ml-10">
            <span className="text-[8px] text-neutral-400">Low</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="w-3 h-2 rounded-sm" style={{ backgroundColor: heatmapColor((i / 11) * maxTrafficCount) }} />
              ))}
            </div>
            <span className="text-[8px] text-neutral-400">High</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ─── 6. Entry Point Performance Table ────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  normal:   { label: "Normal",   cls: "bg-emerald-50 text-emerald-700" },
  watch:    { label: "Watch",    cls: "bg-amber-50 text-amber-700"     },
  critical: { label: "Critical", cls: "bg-red-50 text-red-700"         },
};

type SortKey = "name" | "total" | "whitelistRate" | "unknownRate" | "blacklistHits";

const EntryPointTable = ({ terminology }: { terminology: IdentityTerminology }) => {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...ENTRY_POINTS].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      return sortDir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  }, [sortKey, sortDir]);

  const toggle = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      className="text-left py-2 px-3 text-[9px] uppercase tracking-widest text-neutral-400 font-bold cursor-pointer hover:text-neutral-600 whitespace-nowrap select-none"
      onClick={() => toggle(k)}
    >
      {label} {sortKey === k ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <Card className="mb-5">
      <SectionTitle icon={MapPin} title="Entry Point Performance" />
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-100">
              <Th k="name"           label="Entry Point"             />
              <Th k="total"          label="Total IDs"               />
              <Th k="whitelistRate"  label={`${terminology.authorizedLabel} %`} />
              <Th k="unknownRate"    label="Unknown %"               />
              <Th k="blacklistHits"  label={`${terminology.blacklistLabel} Hits`} />
              <th className="text-left py-2 px-3 text-[9px] uppercase tracking-widest text-neutral-400 font-bold whitespace-nowrap">Peak Hour</th>
              <th className="text-left py-2 px-3 text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((ep) => {
              const badge = STATUS_BADGE[ep.status] ?? STATUS_BADGE.normal;
              return (
                <tr key={ep.name} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                  <td className="py-2 px-3 font-medium text-neutral-800 whitespace-nowrap">{ep.name}</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-neutral-700">{ep.total.toLocaleString()}</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-emerald-600">{ep.whitelistRate}%</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-amber-500">{ep.unknownRate}%</td>
                  <td className="py-2 px-3 font-mono text-[11px]">
                    <span className={cn(ep.blacklistHits > 0 ? "text-red-600 font-bold" : "text-neutral-600")}>
                      {ep.blacklistHits}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-neutral-500">{ep.peakHour}</td>
                  <td className="py-2 px-3">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold", badge.cls)}>
                      {badge.label}
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
};

// ─── 7. Unknown Individual Summary ───────────────────────────────────────────

const UnknownSummarySection = ({ terminology }: { terminology: IdentityTerminology }) => (
  <Card className="mb-5">
    <SectionTitle icon={UserX} title={`${terminology.unknownLabel} Summary`} />
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-neutral-100">
            {["Tracker ID", "Appearances", "Cameras", "First Seen", "Last Seen", "Recurring", "Actions"].map((h) => (
              <th key={h} className="text-left py-2 px-3 text-[9px] uppercase tracking-widest text-neutral-400 font-bold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {UNKNOWN_SUMMARY.map((row) => (
            <tr key={row.trackerId} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
              <td className="py-2 px-3 font-mono text-[10px] font-bold text-neutral-700">{row.trackerId}</td>
              <td className="py-2 px-3 font-mono text-[11px] text-neutral-700">{row.appearances}</td>
              <td className="py-2 px-3 text-[10px] text-neutral-600">{row.cameras}</td>
              <td className="py-2 px-3 font-mono text-[10px] text-neutral-500 whitespace-nowrap">{row.firstSeen}</td>
              <td className="py-2 px-3 font-mono text-[10px] text-neutral-500 whitespace-nowrap">{row.lastSeen}</td>
              <td className="py-2 px-3">
                {row.recurring ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-700">
                    Recurring
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-neutral-100 text-neutral-500">
                    Single
                  </span>
                )}
              </td>
              <td className="py-2 px-3">
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 rounded-sm text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors whitespace-nowrap">
                    Enroll
                  </button>
                  <button className="px-2 py-1 rounded-sm text-[9px] font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors whitespace-nowrap">
                    Escalate
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

// ─── Main View ────────────────────────────────────────────────────────────────

interface IdentityManagerViewProps {
  terminology: IdentityTerminology;
  timeRange: string;
}

export const IdentityManagerView = ({ terminology, timeRange: _timeRange }: IdentityManagerViewProps) => (
  <div>
    <LiveSummaryStrip terminology={terminology} />
    <KPICards terminology={terminology} />
    <IdentificationVolumeSection terminology={terminology} />
    <AccessAuthSection terminology={terminology} />
    <VisitorBehaviorSection terminology={terminology} />
    <EntryPointTable terminology={terminology} />
    <UnknownSummarySection terminology={terminology} />
  </div>
);
