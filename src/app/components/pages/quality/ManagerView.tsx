import { useState, useMemo } from "react";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, Users, MapPin,
  Activity, ChevronLeft, ChevronRight, Filter, ArrowUp, ArrowDown,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { D3StaffingHeatmap } from "./D3Charts";
import type { QualityTerminology } from "@/app/data/mockData";
import {
  COMPLIANCE_BY_SHIFT_DATA,
  VIOLATION_DEFECT_BY_DAY_DATA,
  VIOLATION_TYPE_BY_DAY_DATA,
  SEVERITY_TREND_DATA,
  ZONE_PERFORMANCE_TABLE_DATA,
  STAFFING_HEATMAP_QA,
  INCIDENT_LOG_DATA,
  COQ_BY_DAY_DATA,
  PERSON_COMPLIANCE_DATA,
} from "@/app/data/mockData";

interface ManagerViewProps {
  terminology: QualityTerminology;
  timeRange: string;
}

// ─── Card wrapper ──────────────────────────────────────────────────────────
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white border border-neutral-200 rounded-md p-5 shadow-sm", className)}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title, action }: { icon: any; title: string; action?: React.ReactNode }) => (
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

const DeltaChip = ({ value, suffix = "%" }: { value: number; suffix?: string }) => {
  if (value > 0) return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
      <TrendingUp className="w-3 h-3" /> +{value}{suffix}
    </span>
  );
  if (value < 0) return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-600">
      <TrendingDown className="w-3 h-3" /> {value}{suffix}
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold text-neutral-400">
      <Minus className="w-3 h-3" /> {value}{suffix}
    </span>
  );
};

// ─── 1. Live Summary Strip ─────────────────────────────────────────────────
const LiveSummaryStrip = ({ terminology }: { terminology: QualityTerminology }) => {
  const stats = [
    { label: `Today's ${terminology.complianceLabel}`, value: "91.8%",  delta: 1.4  },
    { label: `Active ${terminology.violationLabel}s`,  value: "23",     delta: -5   },
    { label: "Open Incidents",                          value: "3",      delta: -2   },
    { label: "Cost of Quality",                         value: "$1,420", delta: -8.3 },
  ];
  return (
    <div className="bg-[#E5FFF9] border border-[#00775B]/20 rounded-md px-5 py-3 mb-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#00775B]/70">{s.label}</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-black text-[#003d2e]">{s.value}</span>
            <DeltaChip value={s.delta} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── 2. KPI Cards ─────────────────────────────────────────────────────────
const ManagerKPICards = ({ terminology }: { terminology: QualityTerminology }) => {
  const cards = [
    { label: terminology.complianceLabel, value: "91.8%",  sub: "Target: 90%",      delta: 1.4,  good: true  },
    { label: terminology.defectRateLabel, value: "4.1%",   sub: "Target: <5%",      delta: -0.3, good: true  },
    { label: "Zone Risk Score",           value: "3 / 12",  sub: "Critical zones",   delta: -1,   good: true  },
    { label: "Avg Resolution Time",       value: "26 min",  sub: "Open incidents",   delta: -4,   good: true  },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      {cards.map((c) => (
        <Card key={c.label} className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{c.label}</p>
          <p className="text-2xl font-black text-neutral-900 mt-1 mb-1">{c.value}</p>
          <div className="flex items-center gap-2">
            <DeltaChip value={c.delta} />
            <span className="text-[10px] text-neutral-400">{c.sub}</span>
          </div>
        </Card>
      ))}
    </div>
  );
};

// ─── 3. Compliance by Shift ────────────────────────────────────────────────
const ComplianceByShiftChart = ({ terminology, timeRange }: { terminology: QualityTerminology; timeRange: string }) => {
  const dataKey = timeRange === "Today" ? "today" : "thisWeek";
  return (
    <Card>
      <SectionTitle icon={Activity} title={`${terminology.complianceLabel} by Shift`} />
      <ResponsiveContainer width="100%" height={200} minWidth={0} minHeight={0}>
        <BarChart data={COMPLIANCE_BY_SHIFT_DATA} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="shift" tick={{ fontSize: 11, fill: "#94A3B8" }} />
          <YAxis domain={[80, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#94A3B8" }} />
          <Tooltip
            contentStyle={{ fontSize: 11, border: "1px solid #E2E8F0", borderRadius: 4 }}
            formatter={(v: number) => [`${v}%`, terminology.complianceLabel]}
          />
          <ReferenceLine y={90} stroke="#EF4444" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: "Target", fontSize: 9, fill: "#EF4444" }} />
          <Bar dataKey={dataKey} name={terminology.complianceLabel} radius={[3, 3, 0, 0]}>
            {COMPLIANCE_BY_SHIFT_DATA.map((entry, index) => (
              <Cell key={index} fill={entry[dataKey] >= 90 ? "#00775B" : entry[dataKey] >= 85 ? "#F59E0B" : "#EF4444"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ─── 4. Violation & Defect by Day ──────────────────────────────────────────
const ViolationDefectByDayChart = ({ terminology }: { terminology: QualityTerminology }) => (
  <Card>
    <SectionTitle icon={AlertTriangle} title={`${terminology.violationLabel}s & Defects by Day`} />
    <ResponsiveContainer width="100%" height={200} minWidth={0} minHeight={0}>
      <BarChart data={VIOLATION_DEFECT_BY_DAY_DATA} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} />
        <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
        <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #E2E8F0", borderRadius: 4 }} />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
        <Bar dataKey="violations" name={`${terminology.violationLabel}s`} fill="#F59E0B" fillOpacity={0.85} radius={[2, 2, 0, 0]} />
        <Bar dataKey="defects"    name="Defects"                          fill="#EF4444" fillOpacity={0.8}  radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

// ─── 5. Violation Type Stacked Bar — fully dynamic via terminology ──────────
const TYPE_COLORS = ["#EF4444", "#F59E0B", "#3B82F6", "#8B5CF6", "#06B6D4"];

const ViolationTypeStackedBar = ({ terminology }: { terminology: QualityTerminology }) => (
  <Card>
    <SectionTitle icon={Filter} title={`${terminology.violationLabel} Types by Day`} />
    <ResponsiveContainer width="100%" height={200} minWidth={0} minHeight={0}>
      <BarChart data={VIOLATION_TYPE_BY_DAY_DATA} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} />
        <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
        <Tooltip
          contentStyle={{ fontSize: 11, border: "1px solid #E2E8F0", borderRadius: 4 }}
          formatter={(value: number, key: string) => {
            const idx = ["v1","v2","v3","v4","v5"].indexOf(key);
            return [value, idx >= 0 ? terminology.violationTypes[idx] : key];
          }}
        />
        <Legend
          iconSize={8}
          wrapperStyle={{ fontSize: 10 }}
          formatter={(key: string) => {
            const idx = ["v1","v2","v3","v4","v5"].indexOf(key);
            return idx >= 0 ? terminology.violationTypes[idx] : key;
          }}
        />
        {(["v1","v2","v3","v4","v5"] as const).map((key, i) => (
          <Bar key={key} dataKey={key} stackId="a" fill={TYPE_COLORS[i]}
            radius={i === 4 ? [2, 2, 0, 0] : undefined} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

// ─── 6. Severity Trend ─────────────────────────────────────────────────────
const SeverityTrendChart = () => (
  <Card>
    <SectionTitle icon={AlertTriangle} title="Incident Severity Trend" />
    <ResponsiveContainer width="100%" height={200} minWidth={0} minHeight={0}>
      <AreaChart data={SEVERITY_TREND_DATA} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
        <defs>
          <linearGradient id="gMinor"    x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.7} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1} /></linearGradient>
          <linearGradient id="gMajor"    x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F59E0B" stopOpacity={0.7} /><stop offset="100%" stopColor="#F59E0B" stopOpacity={0.1} /></linearGradient>
          <linearGradient id="gCritical" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EF4444" stopOpacity={0.8} /><stop offset="100%" stopColor="#EF4444" stopOpacity={0.1} /></linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} />
        <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
        <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #E2E8F0", borderRadius: 4 }} />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
        <Area type="monotone" dataKey="minor"    stackId="1" fill="url(#gMinor)"    stroke="#3B82F6" strokeWidth={1.5} name="Minor"    />
        <Area type="monotone" dataKey="major"    stackId="1" fill="url(#gMajor)"    stroke="#F59E0B" strokeWidth={1.5} name="Major"    />
        <Area type="monotone" dataKey="critical" stackId="1" fill="url(#gCritical)" stroke="#EF4444" strokeWidth={1.5} name="Critical" />
      </AreaChart>
    </ResponsiveContainer>
  </Card>
);

// ─── 7. Zone Performance Table ─────────────────────────────────────────────
type SortKey = "zone" | "complianceRate" | "violations" | "peakHour" | "status";

const ZonePerformanceTable = ({
  terminology,
  selectedZone,
  onZoneSelect,
}: {
  terminology: QualityTerminology;
  selectedZone: string | null;
  onZoneSelect: (zone: string | null) => void;
}) => {
  const [sortKey, setSortKey]   = useState<SortKey>("violations");
  const [sortDir, setSortDir]   = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...ZONE_PERFORMANCE_TABLE_DATA].sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    safe:     { label: "Safe",     color: "text-emerald-700", bg: "bg-emerald-100" },
    warning:  { label: "Warning",  color: "text-amber-700",   bg: "bg-amber-100"   },
    critical: { label: "Critical", color: "text-red-700",     bg: "bg-red-100"     },
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUp className="w-3 h-3 text-neutral-300" />;
    return sortDir === "asc"
      ? <ArrowUp className="w-3 h-3 text-[#00775B]" />
      : <ArrowDown className="w-3 h-3 text-[#00775B]" />;
  };

  const TH = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      onClick={() => toggleSort(k)}
      className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-500 cursor-pointer hover:text-neutral-700 select-none"
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon k={k} />
      </div>
    </th>
  );

  return (
    <Card>
      <SectionTitle
        icon={MapPin}
        title={`${terminology.zoneLabel} Performance`}
        action={
          selectedZone && (
            <button
              onClick={() => onZoneSelect(null)}
              className="flex items-center gap-1 text-[10px] text-[#00775B] font-bold hover:underline"
            >
              <ChevronLeft className="w-3 h-3" /> All {terminology.zoneLabel}s
            </button>
          )
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <TH k="zone" label={terminology.zoneLabel} />
              <TH k="complianceRate" label={terminology.complianceLabel} />
              <TH k="violations" label={`${terminology.violationLabel}s`} />
              <TH k="peakHour" label="Peak Hour" />
              <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-500">Trend</th>
              <TH k="status" label="Status" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sorted.map((row) => {
              const sc = statusConfig[row.status];
              const isSelected = selectedZone === row.zone;
              return (
                <tr
                  key={row.zone}
                  onClick={() => onZoneSelect(isSelected ? null : row.zone)}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isSelected ? "bg-[#E5FFF9]" : "hover:bg-neutral-50"
                  )}
                >
                  <td className="px-3 py-2.5 font-medium text-neutral-800">{row.zone}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn(
                      "font-bold",
                      row.complianceRate >= 90 ? "text-emerald-700" : row.complianceRate >= 80 ? "text-amber-700" : "text-red-700"
                    )}>
                      {row.complianceRate}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600">{row.violations}</td>
                  <td className="px-3 py-2.5 text-neutral-500 font-mono">{row.peakHour}</td>
                  <td className="px-3 py-2.5">
                    {row.trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
                    {row.trend === "down" && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                    {row.trend === "flat" && <Minus className="w-3.5 h-3.5 text-neutral-400" />}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", sc.bg, sc.color)}>
                      {sc.label}
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

// ─── 8. Staffing Heatmap (D3) ─────────────────────────────────────────────
const StaffingHeatmap = () => (
  <Card>
    <SectionTitle icon={Users} title="Staffing & Activity Heatmap" />
    <D3StaffingHeatmap data={STAFFING_HEATMAP_QA} />
  </Card>
);

// ─── 9. Repeat Offender Table ──────────────────────────────────────────────
const RepeatOffenderTable = ({ terminology }: { terminology: QualityTerminology }) => {
  const offenders = PERSON_COMPLIANCE_DATA
    .filter((p) => p.status === "non-compliant")
    .slice(0, 5);
  return (
    <Card>
      <SectionTitle icon={Users} title="Repeat Offenders" />
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-500">Employee</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-500">{terminology.violationLabel}s</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-500">Compliance</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-500">Last Seen</th>
              <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {offenders.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50">
                <td className="px-3 py-2.5">
                  <div className="font-medium text-neutral-800">{p.name}</div>
                  <div className="text-[10px] text-neutral-400">{p.department}</div>
                </td>
                <td className="px-3 py-2.5 font-bold text-red-600">{p.violations}</td>
                <td className="px-3 py-2.5 font-bold text-red-600">{p.complianceRate}%</td>
                <td className="px-3 py-2.5 text-neutral-500 text-[10px]">{p.lastSeen}</td>
                <td className="px-3 py-2.5">
                  <button className="px-2 py-1 bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold rounded-sm hover:bg-red-100 transition-colors">
                    Flag
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// ─── 10. Incident Summary Table ────────────────────────────────────────────
const IncidentSummaryTable = () => {
  const [page, setPage]               = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const PER_PAGE = 5;

  const filtered = useMemo(() => {
    return INCIDENT_LOG_DATA.filter((i) => {
      const okStatus   = filterStatus   === "all" || i.status   === filterStatus;
      const okSeverity = filterSeverity === "all" || i.severity === filterSeverity;
      return okStatus && okSeverity;
    });
  }, [filterStatus, filterSeverity]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const severityConfig: Record<string, { color: string; bg: string }> = {
    critical: { color: "text-red-700",     bg: "bg-red-100"     },
    high:     { color: "text-orange-700",  bg: "bg-orange-100"  },
    medium:   { color: "text-amber-700",   bg: "bg-amber-100"   },
    low:      { color: "text-neutral-600", bg: "bg-neutral-100" },
  };

  const statusConfig: Record<string, { color: string; bg: string }> = {
    "open":        { color: "text-red-700",     bg: "bg-red-100"     },
    "in-progress": { color: "text-amber-700",   bg: "bg-amber-100"   },
    "resolved":    { color: "text-emerald-700", bg: "bg-emerald-100" },
  };

  const counts = {
    open:        INCIDENT_LOG_DATA.filter((i) => i.status === "open").length,
    "in-progress": INCIDENT_LOG_DATA.filter((i) => i.status === "in-progress").length,
    resolved:    INCIDENT_LOG_DATA.filter((i) => i.status === "resolved").length,
  };

  return (
    <Card>
      <SectionTitle icon={AlertTriangle} title="Incident Log" />
      {/* Summary badges */}
      <div className="flex gap-2 mb-3">
        {(["open", "in-progress", "resolved"] as const).map((s) => (
          <span
            key={s}
            onClick={() => { setFilterStatus(filterStatus === s ? "all" : s); setPage(1); }}
            className={cn(
              "px-2 py-1 rounded-full text-[10px] font-bold cursor-pointer border transition-colors",
              filterStatus === s
                ? s === "open"        ? "bg-red-600 text-white border-red-600"
                : s === "in-progress" ? "bg-amber-500 text-white border-amber-500"
                : "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
            )}
          >
            {s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")} ({counts[s]})
          </span>
        ))}
        <div className="ml-auto">
          <select
            value={filterSeverity}
            onChange={(e) => { setFilterSeverity(e.target.value); setPage(1); }}
            className="text-[10px] font-bold border border-neutral-200 rounded-sm px-2 py-1 text-neutral-600"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              {["ID", "Date", "Type", "Severity", "Zone", "Status", "Resolution"].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {paged.map((inc) => {
              const sev = severityConfig[inc.severity];
              const sta = statusConfig[inc.status];
              return (
                <tr key={inc.id} className="hover:bg-neutral-50">
                  <td className="px-3 py-2.5 font-mono font-bold text-neutral-700">{inc.id}</td>
                  <td className="px-3 py-2.5 text-neutral-500 whitespace-nowrap">{inc.date}</td>
                  <td className="px-3 py-2.5 text-neutral-700">{inc.type}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", sev.bg, sev.color)}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600">{inc.zone}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", sta.bg, sta.color)}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-neutral-500">{inc.resolutionTime}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
          <span className="text-[10px] text-neutral-400">
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded-sm border border-neutral-200 text-neutral-500 disabled:opacity-30 hover:bg-neutral-50"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded-sm border border-neutral-200 text-neutral-500 disabled:opacity-30 hover:bg-neutral-50"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

// ─── Main Export ───────────────────────────────────────────────────────────
export const ManagerView = ({ terminology, timeRange }: ManagerViewProps) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <LiveSummaryStrip terminology={terminology} />
      <ManagerKPICards terminology={terminology} />

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ComplianceByShiftChart terminology={terminology} timeRange={timeRange} />
        <ViolationDefectByDayChart terminology={terminology} />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ViolationTypeStackedBar terminology={terminology} />
        <SeverityTrendChart />
      </div>

      {/* Zone table — full width */}
      <ZonePerformanceTable
        terminology={terminology}
        selectedZone={selectedZone}
        onZoneSelect={setSelectedZone}
      />

      {/* Staffing heatmap — full width */}
      <StaffingHeatmap />

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RepeatOffenderTable terminology={terminology} />
        <IncidentSummaryTable />
      </div>
    </div>
  );
};
