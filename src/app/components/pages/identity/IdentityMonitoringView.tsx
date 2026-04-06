import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Activity, AlertTriangle, Camera, ShieldOff, Users, Info,
  ChevronDown, ChevronUp, Radio, Eye, UserX, Filter,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { IdentityTerminology } from "../IdentityAnalytics";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const IDENT_RATE_DATA = Array.from({ length: 60 }, (_, i) => ({
  t: i,
  value: 28 + Math.round(Math.sin(i / 8) * 8 + ((i * 17 + 3) % 7) * 0.9),
}));

const CONFIDENCE_DIST = [
  { bucket: "<70%",   count: 8,   color: "#EF4444" },
  { bucket: "70–80%", count: 22,  color: "#F97316" },
  { bucket: "80–90%", count: 67,  color: "#F59E0B" },
  { bucket: "90–95%", count: 134, color: "#84CC16" },
  { bucket: ">95%",   count: 201, color: "#00775B" },
];

const LIST_MEMBERSHIP = [
  { name: "Whitelist", value: 412, color: "#00775B" },
  { name: "VIP",       value: 23,  color: "#F59E0B" },
  { name: "Unknown",   value: 89,  color: "#94A3B8" },
  { name: "Blacklist", value: 3,   color: "#EF4444" },
];

interface LiveEvent {
  id: number;
  ts: string;
  camera: string;
  entity: string;
  status: "whitelist" | "unknown" | "blacklist" | "vip";
  confidence: number;
  isNew?: boolean;
}

const LIVE_EVENTS: LiveEvent[] = [
  { id: 1,  ts: "17:42:03", camera: "Gate A – Cam 01",      entity: "John R.",            status: "whitelist", confidence: 98.2, isNew: true },
  { id: 2,  ts: "17:41:58", camera: "Lobby – Cam 03",       entity: "Unknown",             status: "unknown",   confidence: 61.4 },
  { id: 3,  ts: "17:41:51", camera: "Gate B – Cam 02",      entity: "BLACKLISTED",         status: "blacklist", confidence: 94.7 },
  { id: 4,  ts: "17:41:44", camera: "Gate A – Cam 01",      entity: "Sarah M. (VIP)",      status: "vip",       confidence: 99.1 },
  { id: 5,  ts: "17:41:38", camera: "Parking – Cam 05",     entity: "David K.",            status: "whitelist", confidence: 96.3 },
  { id: 6,  ts: "17:41:30", camera: "Lobby – Cam 03",       entity: "Unknown",             status: "unknown",   confidence: 58.9 },
  { id: 7,  ts: "17:41:22", camera: "Gate A – Cam 01",      entity: "Mike T.",             status: "whitelist", confidence: 97.8 },
  { id: 8,  ts: "17:41:15", camera: "Side Entry – Cam 07",  entity: "Unknown",             status: "unknown",   confidence: 72.1 },
  { id: 9,  ts: "17:41:07", camera: "Gate B – Cam 02",      entity: "Anna L.",             status: "whitelist", confidence: 95.6 },
  { id: 10, ts: "17:41:00", camera: "Gate A – Cam 01",      entity: "James W.",            status: "whitelist", confidence: 98.9 },
  { id: 11, ts: "17:40:52", camera: "Lobby – Cam 03",       entity: "Robert F. (VIP)",     status: "vip",       confidence: 99.3 },
  { id: 12, ts: "17:40:45", camera: "Gate B – Cam 02",      entity: "Unknown",             status: "unknown",   confidence: 65.2 },
];

const CAMERA_ZONES = [
  { id: "cam-01", name: "Gate A",      count: 142, hasBlacklist: false, hasUnknown: false },
  { id: "cam-02", name: "Gate B",      count: 98,  hasBlacklist: true,  hasUnknown: false },
  { id: "cam-03", name: "Lobby",       count: 203, hasBlacklist: false, hasUnknown: true  },
  { id: "cam-04", name: "Elevator",    count: 67,  hasBlacklist: false, hasUnknown: false },
  { id: "cam-05", name: "Parking",     count: 89,  hasBlacklist: false, hasUnknown: false },
  { id: "cam-06", name: "Stairwell",   count: 34,  hasBlacklist: false, hasUnknown: false },
  { id: "cam-07", name: "Side Entry",  count: 156, hasBlacklist: false, hasUnknown: true  },
  { id: "cam-08", name: "Server Room", count: 12,  hasBlacklist: false, hasUnknown: false },
  { id: "cam-09", name: "Roof Access", count: 8,   hasBlacklist: false, hasUnknown: false },
  { id: "cam-10", name: "Canteen",     count: 178, hasBlacklist: false, hasUnknown: false },
  { id: "cam-11", name: "HR Zone",     count: 45,  hasBlacklist: false, hasUnknown: false },
  { id: "cam-12", name: "Exec Floor",  count: 29,  hasBlacklist: false, hasUnknown: false },
];

const DENIALS_BY_HOUR = [
  { hour: "12:00", count: 2 }, { hour: "13:00", count: 1 },
  { hour: "14:00", count: 3 }, { hour: "15:00", count: 0 },
  { hour: "16:00", count: 4 }, { hour: "17:00", count: 2 },
];

interface UnknownTracker {
  id: string;
  camera: string;
  firstSeen: string;
  duration: string;
  lastSeen: string;
  confidence: number;
  crossCamera: boolean;
}

const UNKNOWN_TRACKER: UnknownTracker[] = [
  { id: "TRK-004", camera: "Gate B – Cam 02",     firstSeen: "17:12", duration: "30 min", lastSeen: "17:42", confidence: 61.4, crossCamera: true  },
  { id: "TRK-007", camera: "Lobby – Cam 03",       firstSeen: "17:28", duration: "14 min", lastSeen: "17:42", confidence: 58.9, crossCamera: false },
  { id: "TRK-011", camera: "Side Entry – Cam 07",  firstSeen: "17:35", duration: "7 min",  lastSeen: "17:42", confidence: 72.1, crossCamera: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACCENT  = "#00775B";
const DANGER  = "#EF4444";
const WARNING = "#F59E0B";

const maxCount = Math.max(...CAMERA_ZONES.map((z) => z.count));

function cameraIntensityColor(count: number): string {
  const ratio = count / maxCount;
  // interpolate from #EFF6FF to #1D4ED8
  const r = Math.round(239 + (29  - 239) * ratio);
  const g = Math.round(246 + (78  - 246) * ratio);
  const b = Math.round(255 + (216 - 255) * ratio);
  return `rgb(${r},${g},${b})`;
}

// ─── InfoTooltip ──────────────────────────────────────────────────────────────

const InfoTooltip = ({ text }: { text: string }) => {
  const [show, setShow] = useState(false);
  return (
    <div
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

// ─── Panel ────────────────────────────────────────────────────────────────────

const Panel = ({
  title, icon: Icon, children, className, collapsible = false, info,
}: {
  title: string; icon: React.ElementType; children: React.ReactNode;
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
          {collapsible && (open
            ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
            : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />)}
        </div>
      </div>
      {open && children}
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  whitelist: { label: "Whitelist", bg: "bg-emerald-50",  text: "text-emerald-700" },
  vip:       { label: "VIP",       bg: "bg-amber-50",    text: "text-amber-700"   },
  unknown:   { label: "Unknown",   bg: "bg-neutral-100", text: "text-neutral-600" },
  blacklist: { label: "Blacklist", bg: "bg-red-50",      text: "text-red-700"     },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.unknown;
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold", cfg.bg, cfg.text)}>
      {cfg.label}
    </span>
  );
};

// ─── 1. Live Status Bar ───────────────────────────────────────────────────────

const LiveStatusBar = ({ terminology }: { terminology: IdentityTerminology }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const blacklistActive = true;

  return (
    <div className={cn(
      "border rounded-md px-4 py-3 mb-4 sticky top-0 z-30",
      blacklistActive
        ? "bg-red-50 border-red-200"
        : "bg-[#E5FFF9] border-[#00775B]/20"
    )}>
      <div className="flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full animate-pulse", blacklistActive ? "bg-red-500" : "bg-[#00775B]")} />
          <span className={cn("text-[10px] font-bold uppercase tracking-widest", blacklistActive ? "text-red-600" : "text-[#00775B]")}>LIVE</span>
        </div>

        {[
          { label: `Active ${terminology.identLabel}s (5 min)`,      value: String(42 + (tick % 4) - 1) },
          { label: "Blacklist Matches Today",   value: "3",  danger: true },
          { label: "Unknowns at Access Points", value: "7",  warn: true   },
          { label: "Critical Alerts Open",      value: "1"               },
          { label: "Cameras Online",            value: "10 / 12"         },
        ].map((s) => (
          <div key={s.label} className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-neutral-500">{s.label}</span>
            <span className={cn(
              "text-sm font-black font-mono",
              s.danger ? "text-red-600" : s.warn ? "text-amber-600" : "text-neutral-900"
            )}>
              {s.value}
              {s.danger && (
                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100 text-red-700 text-[9px] font-black">!</span>
              )}
            </span>
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

// ─── 2. Identification Rate Sparkline ─────────────────────────────────────────

const baseline = 28;

const IdentRatePanel = ({ terminology }: { terminology: IdentityTerminology }) => {
  const data = IDENT_RATE_DATA.map((d) => ({
    ...d,
    spike: d.value > baseline * 1.5 ? d.value : null,
  }));

  return (
    <Panel
      title={`${terminology.identLabel} Rate – Live`}
      icon={Activity}
      info="Total identifications per minute over last 1 hour. Amber spikes indicate unusual activity bursts."
    >
      <ResponsiveContainer width="100%" height={140} minWidth={0} minHeight={0}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
          <defs>
            <linearGradient id="identGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.25} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="t" tick={false} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 60]} tick={{ fontSize: 9, fill: "#94A3B8" }} width={28} />
          <Tooltip
            contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 10 }}
            formatter={(v: number) => [`${v}`, terminology.identLabel]}
          />
          <Area type="monotone" dataKey="value" stroke={ACCENT} strokeWidth={2} fill="url(#identGrad)" isAnimationActive={false} />
          <Bar dataKey="spike" fill={WARNING} opacity={0.6} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-1">
        <div className="flex items-center gap-1.5 text-[9px] text-neutral-500">
          <span className="w-2 h-0.5 bg-[#00775B] inline-block" />
          <span>Identifications / min</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-neutral-500">
          <span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />
          <span>Activity spike</span>
        </div>
      </div>
    </Panel>
  );
};

// ─── 3. Blacklist & Unknown Alert Counter ─────────────────────────────────────

const blacklistSparkData = [1, 2, 1, 3, 2, 1, 3, 2, 1, 2, 3, 3];
const unknownSparkData   = [5, 6, 4, 7, 6, 5, 8, 7, 6, 7, 8, 7];

const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 32;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-8">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
};

const AlertCounterPanel = ({ terminology }: { terminology: IdentityTerminology }) => (
  <Panel
    title="Blacklist & Unknown Alerts"
    icon={AlertTriangle}
    info={`Live count of ${terminology.blacklistLabel} matches and unidentified individuals at access points. Click rows in the event feed to investigate.`}
  >
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-[9px] uppercase tracking-widest text-neutral-400">{terminology.blacklistLabel} Matches</span>
        <span className="text-3xl font-black text-red-600 font-mono">3</span>
        <MiniSparkline data={blacklistSparkData} color={DANGER} />
        <span className="text-[9px] text-neutral-400">1h trend</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[9px] uppercase tracking-widest text-neutral-400">{terminology.unknownLabel}s</span>
        <span className="text-3xl font-black text-amber-500 font-mono">7</span>
        <MiniSparkline data={unknownSparkData} color={WARNING} />
        <span className="text-[9px] text-neutral-400">1h trend</span>
      </div>
    </div>
  </Panel>
);

// ─── 4. Match Confidence Distribution ─────────────────────────────────────────

const ConfidenceDistPanel = ({ terminology }: { terminology: IdentityTerminology }) => (
  <Panel
    title={`${terminology.matchScoreLabel} Distribution`}
    icon={Activity}
    info="Distribution of match confidence scores. Low-confidence spikes may indicate spoofing or enrollment gaps."
  >
    <ResponsiveContainer width="100%" height={140} minWidth={0} minHeight={0}>
      <BarChart data={CONFIDENCE_DIST} layout="vertical" margin={{ top: 0, right: 8, left: 40, bottom: 0 }}>
        <XAxis type="number" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <YAxis dataKey="bucket" type="category" tick={{ fontSize: 9, fill: "#64748B" }} width={38} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 10 }}
          formatter={(v: number) => [v, "Count"]}
        />
        <Bar dataKey="count" radius={[0, 2, 2, 0]} isAnimationActive={false}>
          {CONFIDENCE_DIST.map((entry) => (
            <Cell key={entry.bucket} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </Panel>
);

// ─── 5. List Membership Breakdown ─────────────────────────────────────────────

const ListMembershipPanel = ({ terminology }: { terminology: IdentityTerminology }) => {
  const total = LIST_MEMBERSHIP.reduce((s, d) => s + d.value, 0);
  return (
    <Panel
      title="List Membership – Live"
      icon={Users}
      info={`Breakdown of identified ${terminology.entityLabel.toLowerCase()}s by enrollment category in the current session.`}
    >
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={120} height={120} minWidth={0} minHeight={0}>
          <PieChart>
            <Pie
              data={LIST_MEMBERSHIP}
              cx="50%"
              cy="50%"
              innerRadius={32}
              outerRadius={52}
              dataKey="value"
              isAnimationActive={false}
            >
              {LIST_MEMBERSHIP.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 10 }}
              formatter={(v: number) => [v, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2 flex-1">
          {LIST_MEMBERSHIP.map((d) => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-[10px] text-neutral-600">{d.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-neutral-900">{d.value}</span>
                <span className="text-[9px] text-neutral-400">{((d.value / total) * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};

// ─── 6. Live Identity Event Feed ──────────────────────────────────────────────

type EventFilter = "all" | "blacklist" | "unknown" | "vip";

const ROW_COLOR: Record<string, string> = {
  blacklist: "bg-red-50 hover:bg-red-100",
  vip:       "bg-amber-50 hover:bg-amber-100",
  whitelist: "bg-white hover:bg-neutral-50",
  unknown:   "bg-neutral-50 hover:bg-neutral-100",
};

const LiveEventFeedPanel = ({ terminology }: { terminology: IdentityTerminology }) => {
  const [filter, setFilter] = useState<EventFilter>("all");

  const filtered = filter === "all"
    ? LIVE_EVENTS
    : LIVE_EVENTS.filter((e) => e.status === filter);

  const tabs: { id: EventFilter; label: string }[] = [
    { id: "all",       label: "All"       },
    { id: "blacklist", label: terminology.blacklistLabel },
    { id: "unknown",   label: terminology.unknownLabel   },
    { id: "vip",       label: "VIP"       },
  ];

  return (
    <Panel title="Live Identity Event Feed" icon={Eye} className="col-span-full">
      {/* Filter tabs */}
      <div className="flex gap-1 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              "px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-sm transition-all",
              filter === tab.id
                ? "bg-[#00775B] text-white"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-100">
              {["Timestamp", "Camera", `${terminology.entityLabel}`, "Status", `${terminology.matchScoreLabel}`].map((h) => (
                <th key={h} className="text-left py-1.5 px-2 text-[9px] uppercase tracking-widest text-neutral-400 font-bold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((evt) => (
              <tr key={evt.id} className={cn("border-b border-neutral-50 transition-colors", ROW_COLOR[evt.status])}>
                <td className="py-2 px-2 font-mono text-[10px] text-neutral-600 whitespace-nowrap">
                  {evt.ts}
                  {evt.isNew && (
                    <span className="ml-1 inline-flex items-center px-1 py-0.5 rounded text-[8px] font-black bg-[#00775B] text-white animate-pulse">NEW</span>
                  )}
                </td>
                <td className="py-2 px-2 text-neutral-700 whitespace-nowrap">{evt.camera}</td>
                <td className="py-2 px-2 font-medium text-neutral-900 whitespace-nowrap">
                  {evt.status === "blacklist"
                    ? <span className="font-black text-red-700">{evt.entity}</span>
                    : evt.entity}
                </td>
                <td className="py-2 px-2">
                  <StatusBadge status={evt.status} />
                </td>
                <td className="py-2 px-2 font-mono text-[10px] whitespace-nowrap">
                  <span className={cn(
                    "font-bold",
                    evt.confidence >= 90 ? "text-emerald-600" :
                    evt.confidence >= 70 ? "text-amber-500" : "text-red-500"
                  )}>
                    {evt.confidence.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};

// ─── 7. Camera Zone Activity Heatmap ─────────────────────────────────────────

const CameraZoneHeatmapPanel = ({ terminology }: { terminology: IdentityTerminology }) => (
  <Panel
    title="Camera Zone Activity"
    icon={Camera}
    className="col-span-full"
    info={`Identification count per camera zone. Red border indicates ${terminology.blacklistLabel.toLowerCase()} hit or unidentified individual at access point.`}
  >
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {CAMERA_ZONES.map((zone) => {
        const alert = zone.hasBlacklist || zone.hasUnknown;
        const bgColor = cameraIntensityColor(zone.count);
        const textColor = zone.count > maxCount * 0.6 ? "#1E293B" : "#374151";
        return (
          <div
            key={zone.id}
            className={cn(
              "rounded-lg p-3 border-2 transition-all",
              alert ? "border-red-400" : "border-transparent"
            )}
            style={{ backgroundColor: bgColor }}
          >
            <div className="flex items-start justify-between mb-1">
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: textColor }}>
                {zone.name}
              </span>
              {alert && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              )}
            </div>
            <span className="text-xl font-black font-mono" style={{ color: textColor }}>
              {zone.count}
            </span>
            <div className="text-[8px] mt-0.5" style={{ color: textColor, opacity: 0.7 }}>
              identifications
            </div>
            {zone.hasBlacklist && (
              <div className="mt-1 text-[8px] font-bold text-red-700 bg-red-100 px-1 rounded">
                BLACKLIST HIT
              </div>
            )}
            {zone.hasUnknown && (
              <div className="mt-1 text-[8px] font-bold text-amber-700 bg-amber-100 px-1 rounded">
                UNKNOWN PRESENT
              </div>
            )}
          </div>
        );
      })}
    </div>
  </Panel>
);

// ─── 8. Access Denied Counter ─────────────────────────────────────────────────

const AccessDeniedPanel = ({ terminology }: { terminology: IdentityTerminology }) => (
  <Panel
    title="Access Denied – Today"
    icon={ShieldOff}
    info={`Total ${terminology.entityLabel.toLowerCase()}s denied entry today. Includes ${terminology.blacklistLabel.toLowerCase()} matches and low-confidence unknowns.`}
  >
    <div className="mb-3">
      <span className="text-3xl font-black text-red-600 font-mono">12</span>
      <span className="ml-2 text-[10px] uppercase tracking-widest text-neutral-400">access denied</span>
    </div>
    <ResponsiveContainer width="100%" height={80} minWidth={0} minHeight={0}>
      <BarChart data={DENIALS_BY_HOUR} margin={{ top: 0, right: 4, left: -30, bottom: 0 }}>
        <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 8, fill: "#94A3B8" }} width={24} />
        <Tooltip
          contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 10 }}
          formatter={(v: number) => [v, "Denials"]}
        />
        <Bar dataKey="count" fill={DANGER} radius={[2, 2, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
    <div className="text-[9px] text-neutral-400 mt-1">Denials per hour – last 6 hours</div>
  </Panel>
);

// ─── 9. Unknown Individual Tracker ────────────────────────────────────────────

const UnknownTrackerPanel = ({ terminology }: { terminology: IdentityTerminology }) => (
  <Panel title={`${terminology.unknownLabel} Tracker`} icon={UserX} className="col-span-full">
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-neutral-100">
            {["Tracker ID", "Camera", "First Seen", "Duration", "Last Seen", `${terminology.matchScoreLabel}`, "Cross-Camera", "Action"].map((h) => (
              <th key={h} className="text-left py-1.5 px-2 text-[9px] uppercase tracking-widest text-neutral-400 font-bold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {UNKNOWN_TRACKER.map((trk) => (
            <tr
              key={trk.id}
              className={cn(
                "border-b border-neutral-50 transition-colors",
                trk.crossCamera ? "bg-amber-50 hover:bg-amber-100" : "bg-white hover:bg-neutral-50"
              )}
            >
              <td className="py-2 px-2 font-mono text-[10px] font-bold text-neutral-700">{trk.id}</td>
              <td className="py-2 px-2 text-neutral-600 whitespace-nowrap">{trk.camera}</td>
              <td className="py-2 px-2 font-mono text-[10px] text-neutral-600">{trk.firstSeen}</td>
              <td className="py-2 px-2 font-mono text-[10px] text-amber-600 font-bold">{trk.duration}</td>
              <td className="py-2 px-2 font-mono text-[10px] text-neutral-600">{trk.lastSeen}</td>
              <td className="py-2 px-2 font-mono text-[10px]">
                <span className={cn(
                  "font-bold",
                  trk.confidence >= 70 ? "text-amber-500" : "text-red-500"
                )}>
                  {trk.confidence.toFixed(1)}%
                </span>
              </td>
              <td className="py-2 px-2">
                {trk.crossCamera && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700">
                    Multi-camera
                  </span>
                )}
              </td>
              <td className="py-2 px-2">
                <button className="px-2.5 py-1 rounded-sm text-[9px] font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors whitespace-nowrap">
                  Escalate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Panel>
);

// ─── Main View ────────────────────────────────────────────────────────────────

interface IdentityMonitoringViewProps {
  terminology: IdentityTerminology;
  timeRange: string;
}

export const IdentityMonitoringView = ({ terminology, timeRange: _timeRange }: IdentityMonitoringViewProps) => (
  <div>
    {/* 1. Live Status Bar */}
    <LiveStatusBar terminology={terminology} />

    {/* Row: 2 half-width panels */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <IdentRatePanel terminology={terminology} />
      <AlertCounterPanel terminology={terminology} />
    </div>

    {/* Row: 2 half-width panels */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <ConfidenceDistPanel terminology={terminology} />
      <ListMembershipPanel terminology={terminology} />
    </div>

    {/* 6. Full-width event feed */}
    <div className="mb-4">
      <LiveEventFeedPanel terminology={terminology} />
    </div>

    {/* 7. Full-width camera heatmap */}
    <div className="mb-4">
      <CameraZoneHeatmapPanel terminology={terminology} />
    </div>

    {/* Row: access denied + unknown tracker */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <AccessDeniedPanel terminology={terminology} />
      <div className="md:col-span-2">
        <UnknownTrackerPanel terminology={terminology} />
      </div>
    </div>
  </div>
);
