import { useState } from "react";
import { cn } from "@/app/lib/utils";
import {
  ShieldAlert, UserX, Ban, MapPin, Clock, Check, ArrowUpRight,
  Fingerprint, Car, Navigation2, Radio, Zap, Lock, UserPlus,
  BookmarkPlus, Shield, X, Eye,
} from "lucide-react";
import { IdentityEvidenceMedia } from "./components/shared/IdentityEvidenceMedia";
import { IDENTITY_LIVE_STATUS, IDENTITY_ZONES, IDENTITY_ALERTS, UNKNOWN_TRACKERS } from "./data/mockData";
import type { IdentityTerminology } from "./data/types";
import type { IdentityAppOption } from "../IdentityAnalytics";

// ─── Types ────────────────────────────────────────────────────────────────────

type MatchStatus = "BLACKLIST" | "UNKNOWN" | "WHITELIST" | "AUTHORIZED" | "VIP" | "UNREGISTERED";
type FeedFilter = "all" | "threats" | "unknowns" | "vip" | "authorized";
type ActionState = "idle" | "confirming" | "success";

interface FeedPerson {
  id: string;
  identType: "FACE" | "PLATE";
  status: MatchStatus;
  displayName: string;
  subLabel?: string;
  camera: string;
  cameraId: string;
  zone: string;
  time: string;
  confidence?: number;
  dwell?: number;
  recurringDays?: number;
  imageSrc?: string;
  plateText?: string;
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  department?: string;
  employeeId?: string;
  enrollDate?: string;
  totalAppearances?: number;
}

interface JourneyStop {
  camera: string;
  zone: string;
  time: string;
  dwellText: string;
  isCurrent?: boolean;
  alertNote?: string;
  linkedPlate?: string;
}

// ─── Mock feed data ───────────────────────────────────────────────────────────

const FEED_PEOPLE: FeedPerson[] = [
  {
    id: "f1", identType: "FACE", status: "BLACKLIST",
    displayName: "BL-003", subLabel: "Confirmed blacklist match — Immediate action required",
    camera: "Cam 01", cameraId: "cam_main_lobby", zone: "Main Lobby",
    time: "09:13:22", confidence: 94.7, severity: "CRITICAL",
    imageSrc: "https://i.pravatar.cc/160?u=bl003-subjectx",
  },
  {
    id: "f2", identType: "FACE", status: "UNKNOWN",
    displayName: "Unknown #88", subLabel: "Recurring — 4 of last 5 days · 4m 12s dwell",
    camera: "Cam 05", cameraId: "cam_south_entrance", zone: "South Entrance",
    time: "09:13:55", dwell: 252, recurringDays: 4, severity: "MEDIUM",
    imageSrc: "https://i.pravatar.cc/160?u=unk088-recurringz",
  },
  {
    id: "f3", identType: "FACE", status: "VIP",
    displayName: "VIP-007", subLabel: "Executive — Escort protocol suggested",
    camera: "Cam 03", cameraId: "cam_north_entrance", zone: "North Entrance",
    time: "09:12:45", confidence: 97.3, severity: "LOW",
    imageSrc: "https://i.pravatar.cc/160?u=vip007-exec99",
  },
  {
    id: "f4", identType: "FACE", status: "WHITELIST",
    displayName: "John Smith", subLabel: "Engineering · L3 Access",
    camera: "Cam 01", cameraId: "cam_main_lobby", zone: "Main Lobby",
    time: "09:12:45", confidence: 96.1,
    imageSrc: "https://i.pravatar.cc/160?u=john-smith-4821",
    department: "Engineering", employeeId: "EMP-4821",
    enrollDate: "2025-08-14", totalAppearances: 312,
  },
  {
    id: "f5", identType: "PLATE", status: "AUTHORIZED",
    displayName: "KA05MJ4421", subLabel: "White Honda City · Rahul Sharma",
    camera: "Cam 08", cameraId: "cam_garage_entry_a", zone: "Garage Entry A",
    time: "09:13:05", confidence: 98.2, plateText: "KA05MJ4421",
    department: "Finance", employeeId: "EMP-2231",
    enrollDate: "2024-11-02", totalAppearances: 88,
  },
  {
    id: "f6", identType: "PLATE", status: "UNREGISTERED",
    displayName: "UP80MN1123", subLabel: "Unknown vehicle · Entry blocked",
    camera: "Cam 08", cameraId: "cam_garage_entry_a", zone: "Garage Entry A",
    time: "09:14:06", confidence: 91.0, recurringDays: 4, severity: "MEDIUM",
    plateText: "UP80MN1123",
  },
  {
    id: "f7", identType: "FACE", status: "UNKNOWN",
    displayName: "Unknown #134", subLabel: "Recurring over 2 days · Garage area",
    camera: "Cam 09", cameraId: "cam_garage_entry_b", zone: "Garage Entry B",
    time: "09:11:45", dwell: 88, recurringDays: 2, severity: "MEDIUM",
    imageSrc: "https://i.pravatar.cc/160?u=unk134-garagek",
  },
  {
    id: "f8", identType: "FACE", status: "WHITELIST",
    displayName: "Sarah Johnson", subLabel: "Human Resources · L2 Access",
    camera: "Cam 12", cameraId: "cam_reception", zone: "Reception",
    time: "09:09:14", confidence: 95.4,
    imageSrc: "https://i.pravatar.cc/160?u=sarah-johnson-2198",
    department: "Human Resources", employeeId: "EMP-2198",
    enrollDate: "2024-03-20", totalAppearances: 187,
  },
];

const JOURNEY_DATA: Record<string, JourneyStop[]> = {
  f1: [
    { camera: "Cam 11", zone: "Parking Garage",  time: "08:52", dwellText: "4.2s", linkedPlate: "KA05MJ4421" },
    { camera: "Cam 05", zone: "South Entrance",  time: "08:58", dwellText: "42s",  alertNote: "Unknown alert (resolved)" },
    { camera: "Cam 03", zone: "North Entrance",  time: "09:11", dwellText: "2.1s" },
    { camera: "Cam 01", zone: "Main Lobby",      time: "09:13", dwellText: "8.3s", isCurrent: true, alertNote: "Blacklist alert ACTIVE" },
  ],
  f2: [
    { camera: "Cam 05", zone: "South Entrance",  time: "08:41", dwellText: "31s" },
    { camera: "Cam 01", zone: "Main Lobby",      time: "09:05", dwellText: "18s" },
    { camera: "Cam 05", zone: "South Entrance",  time: "09:13", dwellText: "4m 12s", isCurrent: true, alertNote: "Dwell time growing" },
  ],
  f3: [
    { camera: "Cam 03", zone: "North Entrance",  time: "09:12", dwellText: "2.8s", isCurrent: true, alertNote: "VIP — escort recommended" },
  ],
  f4: [
    { camera: "Cam 11", zone: "Parking Garage",  time: "08:52", dwellText: "3.1s", linkedPlate: "KA05MJ4421" },
    { camera: "Cam 03", zone: "North Entrance",  time: "09:11", dwellText: "1.8s" },
    { camera: "Cam 01", zone: "Main Lobby",      time: "09:12", dwellText: "3.0s", isCurrent: true },
  ],
  f5: [
    { camera: "Cam 08", zone: "Garage Entry A",  time: "09:13", dwellText: "2.1s", isCurrent: true, alertNote: "ENTRY authorised" },
  ],
  f6: [
    { camera: "Cam 08", zone: "Garage Entry A",  time: "09:14", dwellText: "—", isCurrent: true, alertNote: "Entry BLOCKED — unregistered" },
  ],
  f7: [
    { camera: "Cam 09", zone: "Garage Entry B",  time: "09:08", dwellText: "22s" },
    { camera: "Cam 09", zone: "Garage Entry B",  time: "09:11", dwellText: "1m 28s", isCurrent: true, alertNote: "Recurring unknown" },
  ],
  f8: [
    { camera: "Cam 03", zone: "North Entrance",  time: "09:06", dwellText: "2.2s" },
    { camera: "Cam 12", zone: "Reception",       time: "09:09", dwellText: "1.5s", isCurrent: true },
  ],
};

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<MatchStatus, {
  label: string; badgeBg: string; badgeText: string;
  borderColor: string; rowBg: string; textColor: string; dotColor: string;
}> = {
  BLACKLIST:    { label: "Blacklist",    badgeBg: "bg-red-600",     badgeText: "text-white",      borderColor: "border-l-red-500",    rowBg: "bg-red-50/50",    textColor: "text-red-700",    dotColor: "bg-red-500"    },
  UNKNOWN:      { label: "Unknown",     badgeBg: "bg-amber-500",   badgeText: "text-white",      borderColor: "border-l-amber-400",  rowBg: "bg-amber-50/40",  textColor: "text-amber-700",  dotColor: "bg-amber-400"  },
  UNREGISTERED: { label: "Unregistered",badgeBg: "bg-amber-500",   badgeText: "text-white",      borderColor: "border-l-amber-400",  rowBg: "bg-amber-50/40",  textColor: "text-amber-700",  dotColor: "bg-amber-400"  },
  VIP:          { label: "VIP",         badgeBg: "bg-yellow-400",  badgeText: "text-yellow-900", borderColor: "border-l-yellow-400", rowBg: "bg-yellow-50/30", textColor: "text-yellow-700", dotColor: "bg-yellow-400" },
  WHITELIST:    { label: "Authorised",  badgeBg: "bg-emerald-600", badgeText: "text-white",      borderColor: "border-l-transparent",rowBg: "bg-white",         textColor: "text-emerald-700",dotColor: "bg-emerald-500"},
  AUTHORIZED:   { label: "Authorised",  badgeBg: "bg-emerald-600", badgeText: "text-white",      borderColor: "border-l-transparent",rowBg: "bg-white",         textColor: "text-emerald-700",dotColor: "bg-emerald-500"},
};

function fmtDwell(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60), s = sec % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

// ─── Status Bar ───────────────────────────────────────────────────────────────

function StatusPill({ label, colorClass, pulse }: { label: string; colorClass: string; pulse?: boolean }) {
  return (
    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold", colorClass)}>
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />}
      <span>{label}</span>
    </div>
  );
}

// ─── Summary cards ────────────────────────────────────────────────────────────

function SummaryCards({ onFilter }: { onFilter: (f: FeedFilter) => void }) {
  const status = IDENTITY_LIVE_STATUS;
  const totalDenied = IDENTITY_ZONES.reduce((s, z) => s + z.denied, 0);
  const topDeniedZone = [...IDENTITY_ZONES].sort((a, b) => b.denied - a.denied)[0];
  const blAlert = IDENTITY_ALERTS.find(a => a.type === "BLACKLIST_MATCH" && a.status === "ACTIVE");

  const cards = [
    {
      icon: ShieldAlert, label: "Blacklist Hits", value: status.blacklist_matches,
      sub: blAlert ? `${blAlert.zone} · ${blAlert.timestamp}` : "No active hits",
      badge: status.blacklist_matches > 0 ? "ACTIVE" : null,
      badgeClass: "bg-red-600 text-white animate-pulse",
      valueClass: status.blacklist_matches > 0 ? "text-red-700" : "text-neutral-800",
      cardClass: status.blacklist_matches > 0 ? "border-red-200 bg-red-50/60 hover:shadow-md hover:-translate-y-px" : "border-neutral-100",
      iconClass: status.blacklist_matches > 0 ? "text-red-500" : "text-neutral-300",
      clickable: status.blacklist_matches > 0, filter: "threats" as FeedFilter,
      cta: status.blacklist_matches > 0 ? "View threat" : null, ctaClass: "text-red-600",
    },
    {
      icon: UserX, label: "Unknowns Active", value: UNKNOWN_TRACKERS.length,
      sub: "Longest tracked: 5h 19m",
      badge: UNKNOWN_TRACKERS.length > 3 ? "MONITOR" : null,
      badgeClass: "bg-amber-500 text-white",
      valueClass: UNKNOWN_TRACKERS.length > 3 ? "text-amber-600" : "text-neutral-800",
      cardClass: UNKNOWN_TRACKERS.length > 3 ? "border-amber-200 bg-amber-50/40 hover:shadow-md hover:-translate-y-px" : "border-neutral-100",
      iconClass: UNKNOWN_TRACKERS.length > 0 ? "text-amber-500" : "text-neutral-300",
      clickable: UNKNOWN_TRACKERS.length > 0, filter: "unknowns" as FeedFilter,
      cta: UNKNOWN_TRACKERS.length > 0 ? "Track unknowns" : null, ctaClass: "text-amber-600",
    },
    {
      icon: Ban, label: "Access Denied Today", value: totalDenied,
      sub: topDeniedZone ? `Highest: ${topDeniedZone.zone_name} (${topDeniedZone.denied})` : "No denials",
      badge: totalDenied > 10 ? "ELEVATED" : null,
      badgeClass: "bg-orange-100 text-orange-700 border border-orange-200",
      valueClass: totalDenied > 10 ? "text-orange-600" : "text-neutral-800",
      cardClass: totalDenied > 10 ? "border-orange-200 bg-orange-50/20" : "border-neutral-100",
      iconClass: totalDenied > 10 ? "text-orange-500" : "text-neutral-300",
      clickable: false, filter: "all" as FeedFilter, cta: null, ctaClass: "",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <button key={c.label}
            onClick={() => c.clickable && onFilter(c.filter)}
            className={cn(
              "bg-white rounded-[4px] border p-3.5 flex flex-col gap-2 text-left w-full transition-all group",
              c.cardClass, c.clickable ? "cursor-pointer" : "cursor-default"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Icon className={cn("w-3.5 h-3.5", c.iconClass)} />
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400">{c.label}</span>
              </div>
              {c.badge && (
                <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded-[2px] uppercase tracking-wide", c.badgeClass)}>
                  {c.badge}
                </span>
              )}
            </div>
            <span className={cn("text-4xl font-black tabular-nums leading-none tracking-tight", c.valueClass)}>
              {c.value}
            </span>
            <p className="text-[10px] text-neutral-400 leading-snug truncate">{c.sub}</p>
            {c.cta && (
              <div className={cn("flex items-center gap-1 text-[10px] font-bold transition-all group-hover:gap-1.5", c.ctaClass)}>
                {c.cta} <ArrowUpRight className="w-3 h-3" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Feed Card ────────────────────────────────────────────────────────────────

function FeedCard({ person, selected, onClick }: { person: FeedPerson; selected: boolean; onClick: () => void }) {
  const cfg = STATUS_CFG[person.status];

  return (
    <div
      onClick={onClick}
      className={cn(
        "border-l-4 rounded-r-lg border border-l-0 cursor-pointer transition-all select-none",
        cfg.borderColor, cfg.rowBg,
        selected
          ? "border-[#00775B]/40 shadow-md ring-1 ring-[#00775B]/20 bg-white"
          : "border-neutral-100 hover:border-neutral-200 hover:shadow-sm hover:bg-white"
      )}
    >
      <div className="flex items-stretch">
        {/* Thumbnail */}
        <div className="shrink-0 overflow-hidden" style={{ width: 56, height: 56 }}>
          <IdentityEvidenceMedia
            kind={person.identType}
            seed={person.id}
            imageSrc={person.imageSrc}
            plateText={person.plateText}
            className="w-full h-full rounded-none border-0"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 px-2.5 py-2 flex flex-col justify-center gap-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[12px] font-bold text-neutral-900 leading-tight">{person.displayName}</span>
            <span className={cn("text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-[2px]", cfg.badgeBg, cfg.badgeText)}>
              {cfg.label}
            </span>
            {person.recurringDays && (
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-[2px] bg-orange-100 text-orange-700">
                ↻ {person.recurringDays}d
              </span>
            )}
            {person.status === "BLACKLIST" && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-auto shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <MapPin className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
            <span className="text-[10px] text-neutral-500">{person.zone}</span>
            {person.dwell !== undefined && (
              <span className={cn("text-[10px] font-semibold ml-auto shrink-0 tabular-nums",
                person.dwell > 120 ? "text-red-500" : "text-amber-600")}>
                {fmtDwell(person.dwell)} dwell
              </span>
            )}
            {person.confidence !== undefined && person.dwell === undefined && (
              <span className={cn("text-[10px] font-bold tabular-nums ml-auto shrink-0",
                person.confidence >= 95 ? "text-emerald-600" : person.confidence >= 80 ? "text-amber-600" : "text-red-500"
              )}>
                {person.confidence}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-neutral-300 shrink-0" />
            <span className="text-[10px] text-neutral-400">{person.time} · {person.camera}</span>
          </div>
        </div>

        {/* View button */}
        <div className="shrink-0 flex items-center pr-2.5">
          <div className={cn(
            "w-7 h-7 rounded-[4px] flex items-center justify-center transition-colors border",
            selected
              ? "bg-[#00775B] border-[#00775B] text-white"
              : "border-neutral-200 text-neutral-400 hover:border-[#00775B] hover:text-[#00775B]"
          )}>
            <Eye className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Action Button with confirm flow ─────────────────────────────────────────

function ActionBtn({
  icon: Icon, label, variant, stateKey, states, setAction, successMsg, confirmMsg,
}: {
  icon: React.ElementType; label: string; variant: "primary" | "danger" | "warning" | "neutral";
  stateKey: string; states: Record<string, ActionState>;
  setAction: (k: string, s: ActionState) => void;
  successMsg: string; confirmMsg: string;
}) {
  const state = states[stateKey] ?? "idle";
  const cls = {
    primary: "border-[#00775B] text-[#00775B] hover:bg-[#00775B]/5",
    danger:  "border-red-400 text-red-600 hover:bg-red-50",
    warning: "border-orange-400 text-orange-600 hover:bg-orange-50",
    neutral: "border-neutral-200 text-neutral-600 hover:bg-neutral-50",
  }[variant];

  if (state === "success") return (
    <div className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-[4px] bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold w-full">
      <Check className="w-3 h-3 shrink-0 mt-0.5" />
      <span>{successMsg}</span>
    </div>
  );

  if (state === "confirming") return (
    <div className="flex items-center gap-2 flex-wrap px-0.5">
      <span className="text-[10px] text-neutral-700 font-medium">{confirmMsg}</span>
      <button onClick={() => setAction(stateKey, "success")}
        className="px-2.5 py-1 rounded-[4px] bg-[#021d18] text-white text-[10px] font-bold hover:bg-neutral-900 transition-colors">
        Confirm
      </button>
      <button onClick={() => setAction(stateKey, "idle")}
        className="px-2 py-1 rounded-[4px] border border-neutral-200 text-neutral-500 text-[10px] font-semibold hover:bg-neutral-50 transition-colors">
        Cancel
      </button>
    </div>
  );

  return (
    <button onClick={() => setAction(stateKey, "confirming")}
      className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] border text-[10px] font-semibold transition-colors", cls)}>
      <Icon className="w-3 h-3" /> {label}
    </button>
  );
}

// ─── Journey SVG ──────────────────────────────────────────────────────────────

function JourneyMapSVG({ stops }: { stops: JourneyStop[] }) {
  if (!stops.length) return null;
  const pad = 14, w = 100;
  const step = stops.length === 1 ? 0 : (w - pad * 2) / (stops.length - 1);

  return (
    <div className="w-full rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden" style={{ height: 88 }}>
      <svg viewBox="0 0 100 88" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
        {/* Background grid */}
        {[22, 44, 66].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
        ))}

        {/* Connection line */}
        {stops.length > 1 && stops.map((_, i) => {
          if (!i) return null;
          const x1 = pad + (i - 1) * step, x2 = pad + i * step;
          return <line key={i} x1={x1} y1={44} x2={x2} y2={44} stroke="#00775B" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.65" />;
        })}

        {/* Arrow heads */}
        {stops.length > 1 && stops.map((_, i) => {
          if (!i) return null;
          const mx = pad + (i - 0.5) * step;
          return <polygon key={`a${i}`} points={`${mx - 1},${44 - 1.8} ${mx + 2},${44} ${mx - 1},${44 + 1.8}`} fill="#00775B" opacity="0.55" />;
        })}

        {/* Nodes */}
        {stops.map((stop, i) => {
          const x = pad + i * step;
          const isCurr = stop.isCurrent;
          const fill = isCurr ? "#DC2626" : i === 0 ? "#6B7280" : "#00775B";
          return (
            <g key={i}>
              {isCurr && (
                <circle cx={x} cy={44} r="8" fill="#DC2626" opacity="0.12">
                  <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.12;0.25;0.12" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={x} cy={44} r={isCurr ? 5 : 3.5} fill={fill} stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
              {isCurr && <circle cx={x} cy={44} r="2.5" fill="white" opacity="0.85">
                <animate attributeName="opacity" values="0.85;0.35;0.85" dur="1.5s" repeatCount="indefinite" />
              </circle>}
              {/* Zone label */}
              <text x={x} y={32} textAnchor="middle" fontSize="4" fill="rgba(255,255,255,0.55)" fontFamily="sans-serif">
                {stop.zone.length > 11 ? stop.zone.slice(0, 10) + "…" : stop.zone}
              </text>
              {/* Time */}
              <text x={x} y={57} textAnchor="middle" fontSize="3.5" fill="rgba(255,255,255,0.35)" fontFamily="monospace">
                {stop.time}
              </text>
              {/* Dwell */}
              <text x={x} y={64} textAnchor="middle" fontSize="3" fill={isCurr ? "#FCA5A5" : "rgba(255,255,255,0.25)"} fontFamily="monospace">
                {stop.dwellText}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Entity Detail Panel ──────────────────────────────────────────────────────

function EntityDetailPanel({ person, onClose }: { person: FeedPerson; onClose: () => void }) {
  const cfg = STATUS_CFG[person.status];
  const [actionStates, setActionStates] = useState<Record<string, ActionState>>({});
  const journey = JOURNEY_DATA[person.id] ?? [];
  const isLPR = person.identType === "PLATE";
  const isBlacklist = person.status === "BLACKLIST";
  const isUnknown = person.status === "UNKNOWN" || person.status === "UNREGISTERED";
  const isVIP = person.status === "VIP";
  const isAuthorised = person.status === "WHITELIST" || person.status === "AUTHORIZED";

  const setAction = (key: string, state: ActionState) => {
    setActionStates(prev => ({ ...prev, [key]: state }));
    if (state === "success") setTimeout(() => setActionStates(prev => ({ ...prev, [key]: "idle" })), 4000);
  };

  return (
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">

      {/* Panel header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-100 bg-neutral-50/50">
        {isLPR ? <Car className="w-3.5 h-3.5 text-[#00775B]" /> : <Fingerprint className="w-3.5 h-3.5 text-[#00775B]" />}
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
          {isLPR ? "Vehicle Detail" : "Entity Detail"}
        </span>
        <button onClick={onClose} className="ml-auto p-1 rounded hover:bg-neutral-200 text-neutral-400 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Media + identity block */}
      <div className="flex gap-3 p-4 border-b border-neutral-100">
        <IdentityEvidenceMedia
          kind={person.identType}
          seed={person.id}
          imageSrc={person.imageSrc}
          plateText={person.plateText}
          confidence={person.confidence}
          label={person.displayName}
          sublabel={person.zone}
          live={isBlacklist || isUnknown}
          size="sm"
          className={isLPR ? "w-[130px] h-[76px]" : "w-[96px] h-[96px]"}
        />

        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {/* Name + badge */}
          <div className="flex items-start gap-2 flex-wrap">
            <span className="text-[15px] font-black text-neutral-900 leading-tight">{person.displayName}</span>
            <span className={cn("text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] shrink-0 mt-0.5", cfg.badgeBg, cfg.badgeText)}>
              {cfg.label}
            </span>
          </div>

          {person.subLabel && <p className="text-[11px] text-neutral-500 leading-snug">{person.subLabel}</p>}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-1">
            {person.confidence !== undefined && (
              <InfoCell label={isLPR ? "OCR Confidence" : "Match Confidence"} value={`${person.confidence}%`}
                valueClass={person.confidence >= 95 ? "text-emerald-600" : person.confidence >= 80 ? "text-amber-600" : "text-red-500"} />
            )}
            <InfoCell label="Zone" value={person.zone} />
            <InfoCell label="Camera" value={person.camera} />
            <InfoCell label="Detected" value={person.time} />
            {person.dwell !== undefined && (
              <InfoCell label="Dwell Time" value={fmtDwell(person.dwell)}
                valueClass={person.dwell > 120 ? "text-red-600 font-bold" : "text-amber-600 font-bold"} />
            )}
            {person.recurringDays && (
              <InfoCell label="Recurring" value={`${person.recurringDays} of last 5 days`} valueClass="text-orange-600 font-bold" />
            )}
            {person.department && <InfoCell label="Department" value={person.department} />}
            {person.employeeId && <InfoCell label="Employee ID" value={person.employeeId} />}
            {person.enrollDate && <InfoCell label="Enrolled" value={person.enrollDate} />}
            {person.totalAppearances && <InfoCell label="This Month" value={`${person.totalAppearances} detections`} />}
          </div>
        </div>
      </div>

      {/* Actions */}
      {!isAuthorised && (
        <div className="px-4 py-3 border-b border-neutral-100 space-y-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Respond</p>
          <div className="flex flex-col gap-2">
            {isBlacklist && <>
              <ActionBtn icon={Check}    label="Acknowledge Alert"  variant="danger"  stateKey="ack"      states={actionStates} setAction={setAction}
                successMsg={`Alert acknowledged — logged to incident report at ${person.time}`}
                confirmMsg="Acknowledge this blacklist match and log to incident report?" />
              <ActionBtn icon={Radio}   label="Dispatch Guard"     variant="danger"  stateKey="dispatch" states={actionStates} setAction={setAction}
                successMsg={`Guard dispatched to ${person.zone} — ETA 2 minutes`}
                confirmMsg={`Send nearest guard to ${person.zone}?`} />
              <ActionBtn icon={Lock}    label="Lock Entry Point"   variant="warning" stateKey="lock"     states={actionStates} setAction={setAction}
                successMsg={`${person.zone} is now LOCKED — all access suspended`}
                confirmMsg={`Lock all access at ${person.zone}? This will block all entries.`} />
            </>}
            {isUnknown && <>
              <ActionBtn icon={UserPlus}     label="Enroll Identity"    variant="primary" stateKey="enroll"   states={actionStates} setAction={setAction}
                successMsg="Enrollment form opened — assign name, department and access level"
                confirmMsg="Start identity enrollment for this individual?" />
              <ActionBtn icon={BookmarkPlus} label="Add to Watchlist"   variant="neutral" stateKey="watch"    states={actionStates} setAction={setAction}
                successMsg="Added to active watchlist — you will be alerted on next detection"
                confirmMsg="Add this individual to the security watchlist?" />
              <ActionBtn icon={Shield}       label="Mark as Visitor"    variant="neutral" stateKey="visitor"  states={actionStates} setAction={setAction}
                successMsg="Marked as authorised visitor — temporary access badge issued"
                confirmMsg="Grant temporary visitor access to this individual?" />
              <ActionBtn icon={Zap}          label="Escalate to Supervisor" variant="danger"  stateKey="esc"  states={actionStates} setAction={setAction}
                successMsg="Escalated — security supervisor notified via SMS and app push"
                confirmMsg="Escalate this case to the security supervisor?" />
            </>}
            {isVIP && <>
              <ActionBtn icon={Radio}       label="Notify Host"     variant="primary" stateKey="notify" states={actionStates} setAction={setAction}
                successMsg="Host notified via SMS and app push notification — awaiting acknowledgement"
                confirmMsg="Send VIP arrival notification to assigned host?" />
              <ActionBtn icon={Navigation2} label="Log on Site"     variant="neutral" stateKey="log"    states={actionStates} setAction={setAction}
                successMsg="VIP presence logged in site register with timestamp"
                confirmMsg="Log VIP presence in the site register?" />
            </>}
          </div>
        </div>
      )}

      {/* Journey Map */}
      {journey.length > 0 && (
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <Navigation2 className="w-3.5 h-3.5 text-[#00775B]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Journey — Today</span>
            <span className="ml-auto text-[10px] text-neutral-400 tabular-nums">
              {journey.length} stop{journey.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* SVG path map */}
          <JourneyMapSVG stops={journey} />

          {/* Timeline list */}
          <div className="mt-3 space-y-0">
            {journey.map((stop, i) => (
              <div key={i} className={cn(
                "flex items-start gap-3 py-2 px-2 rounded-lg transition-colors",
                stop.isCurrent ? "bg-red-50/70" : "hover:bg-neutral-50"
              )}>
                {/* Dot + line */}
                <div className="flex flex-col items-center shrink-0 pt-1" style={{ width: 16 }}>
                  <div className={cn(
                    "w-3 h-3 rounded-full border-2 border-white shadow",
                    stop.isCurrent ? "bg-red-500 shadow-red-200" : i === 0 ? "bg-neutral-300" : "bg-[#00775B]"
                  )} />
                  {i < journey.length - 1 && (
                    <div className="w-px flex-1 bg-neutral-200 my-1" style={{ minHeight: 12 }} />
                  )}
                </div>

                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-neutral-800">{stop.zone}</span>
                    {stop.isCurrent && (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-600 uppercase">
                        <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" /> Live
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-neutral-400 flex-wrap">
                    <span className="tabular-nums font-mono">{stop.time}</span>
                    <span>·</span>
                    <span>dwell {stop.dwellText}</span>
                    <span>·</span>
                    <span className="text-neutral-300">{stop.camera}</span>
                    {stop.linkedPlate && (
                      <><span>·</span><span className="text-neutral-500">🚗 {stop.linkedPlate}</span></>
                    )}
                  </div>
                  {stop.alertNote && (
                    <p className={cn("text-[10px] mt-0.5 font-medium",
                      stop.alertNote.includes("ACTIVE") || stop.alertNote.includes("BLOCKED")
                        ? "text-red-500" : "text-amber-600"
                    )}>
                      {stop.alertNote}
                    </p>
                  )}
                </div>

                <span className="text-[10px] text-neutral-300 shrink-0 tabular-nums font-mono">{stop.time}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
            <span className="text-[10px] text-neutral-400">
              {journey.length} cameras · {journey[0].time} → {journey[journey.length - 1].time}
            </span>
            <button className="flex items-center gap-1 text-[10px] font-semibold text-[#00775B] hover:underline transition-colors">
              Export <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <p className="text-[9px] text-neutral-400 uppercase tracking-wider font-bold">{label}</p>
      <p className={cn("text-[11px] font-semibold text-neutral-700 mt-0.5", valueClass)}>{value}</p>
    </div>
  );
}

// ─── Default right panel ──────────────────────────────────────────────────────

function TodaySummary() {
  const status = IDENTITY_LIVE_STATUS;
  const totalDenied = IDENTITY_ZONES.reduce((s, z) => s + z.denied, 0);

  return (
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-100 bg-neutral-50/50">
        <Shield className="w-3.5 h-3.5 text-[#00775B]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Today's Summary</span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 3s ago
        </span>
      </div>

      <div className="divide-y divide-neutral-50">
        {[
          { dot: "bg-red-500",    label: "Blacklist Matches",     value: status.blacklist_matches, sub: "1 unacknowledged",  vc: "text-red-600"    },
          { dot: "bg-amber-400",  label: "Unknowns at Entry",     value: UNKNOWN_TRACKERS.length,  sub: "2 recurring",       vc: "text-amber-600"  },
          { dot: "bg-orange-400", label: "Access Denials Today",  value: totalDenied,              sub: "Main Lobby highest", vc: "text-orange-600" },
          { dot: "bg-yellow-400", label: "VIP Detections",        value: status.vip_matches,       sub: "1 on site now",     vc: "text-yellow-600" },
          { dot: "bg-emerald-500",label: "Total Identifications", value: 2840,                     sub: "97.2% accuracy",    vc: "text-emerald-700"},
        ].map(r => (
          <div key={r.label} className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full shrink-0", r.dot)} />
              <span className="text-xs text-neutral-700">{r.label}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn("text-base font-black tabular-nums leading-none", r.vc)}>{r.value.toLocaleString()}</span>
              <span className="text-[10px] text-neutral-400">{r.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 p-3 border-t border-neutral-100 bg-neutral-50/30">
        <div className="bg-red-50 rounded-lg p-2.5 border border-red-100">
          <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Most Active Threat Zone</p>
          <p className="text-xs font-bold text-red-700 mt-0.5">Main Lobby</p>
          <p className="text-[10px] text-red-500 mt-0.5">1 blacklist · 12 denials</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-100">
          <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Longest Unknown Dwell</p>
          <p className="text-xs font-bold text-amber-800 mt-0.5">Unknown #88</p>
          <p className="text-[10px] text-amber-600 mt-0.5">South Entrance · 4m 12s</p>
        </div>
      </div>

      <p className="px-4 py-3 text-[10px] text-neutral-400 text-center border-t border-neutral-100">
        Select a detection from the feed to view full entity detail and journey map
      </p>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

type SortMode = "newest" | "priority";

interface Props {
  terminology: IdentityTerminology;
  timeRange: string;
  activeApp: IdentityAppOption;
  onEntityClick?: (type: "matched" | "unknown" | "blacklist") => void;
  onCameraClick?: (cameraId?: string) => void;
  onJourneyClick?: () => void;
}

export const IdentityMonitoringView = ({ terminology: _t }: Props) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [sort, setSort] = useState<SortMode>("priority");

  const status = IDENTITY_LIVE_STATUS;
  const selectedPerson = FEED_PEOPLE.find(p => p.id === selectedId) ?? null;

  const SEV: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

  const filteredFeed = FEED_PEOPLE
    .filter(p => {
      switch (feedFilter) {
        case "threats":    return p.status === "BLACKLIST" || p.status === "UNREGISTERED";
        case "unknowns":   return p.status === "UNKNOWN"   || p.status === "UNREGISTERED";
        case "vip":        return p.status === "VIP";
        case "authorized": return p.status === "WHITELIST"  || p.status === "AUTHORIZED";
        default:           return true;
      }
    })
    .sort((a, b) =>
      sort === "priority"
        ? (SEV[a.severity ?? "LOW"] ?? 3) - (SEV[b.severity ?? "LOW"] ?? 3)
        : b.time.localeCompare(a.time)
    );

  const TABS: { id: FeedFilter; label: string; count: number }[] = [
    { id: "all",        label: "All",        count: FEED_PEOPLE.length },
    { id: "threats",    label: "Threats",    count: FEED_PEOPLE.filter(p => ["BLACKLIST","UNREGISTERED"].includes(p.status)).length },
    { id: "unknowns",   label: "Unknowns",   count: FEED_PEOPLE.filter(p => ["UNKNOWN","UNREGISTERED"].includes(p.status)).length },
    { id: "vip",        label: "VIP",        count: FEED_PEOPLE.filter(p => p.status === "VIP").length },
    { id: "authorized", label: "Authorised", count: FEED_PEOPLE.filter(p => ["WHITELIST","AUTHORIZED"].includes(p.status)).length },
  ];

  return (
    <div className="flex flex-col gap-3">

      {/* Status Bar */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-[4px] bg-[#021d18] border border-white/5">
        <StatusPill label="2 Active Threats"    colorClass="bg-red-900/50 text-red-300"    pulse />
        <span className="text-white/20 mx-0.5">·</span>
        <StatusPill label="4 Unknowns at Entry" colorClass="bg-amber-900/40 text-amber-300" />
        <span className="text-white/20 mx-0.5">·</span>
        <StatusPill label="1 VIP on Site"        colorClass="bg-yellow-900/40 text-yellow-300" />
        <span className="text-white/20 mx-0.5">·</span>
        <StatusPill label={`${status.cameras_online}/${status.cameras_total} Cameras`} colorClass="bg-emerald-900/40 text-emerald-300" />
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-white/40 font-mono">LIVE · 3s ago</span>
        </div>
      </div>

      {/* Summary cards */}
      <SummaryCards onFilter={setFeedFilter} />

      {/* Two-column layout */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 420px", alignItems: "start" }}>

        {/* LEFT: Feed */}
        <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">

          {/* Feed header */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-100 bg-neutral-50/50">
            <Radio className="w-3.5 h-3.5 text-[#00775B]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Security Triage Feed</span>
            <div className="flex items-center gap-1 ml-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600 font-bold">LIVE</span>
            </div>
          </div>

          {/* Filter + sort */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-neutral-100 flex-wrap">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setFeedFilter(tab.id)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-[4px] text-[10px] font-bold transition-colors whitespace-nowrap",
                  feedFilter === tab.id ? "bg-[#021d18] text-white" : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                )}>
                {tab.label}
                <span className={cn("text-[9px] px-1 py-px rounded-[2px] min-w-[16px] text-center tabular-nums",
                  feedFilter === tab.id ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-500")}>
                  {tab.count}
                </span>
              </button>
            ))}
            <div className="flex items-center gap-0 ml-auto border border-neutral-200 rounded-[4px] overflow-hidden">
              {(["priority", "newest"] as SortMode[]).map(s => (
                <button key={s} onClick={() => setSort(s)}
                  className={cn(
                    "px-2 py-1 text-[9px] font-bold capitalize transition-colors",
                    sort === s ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-neutral-700"
                  )}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Feed list */}
          <div className="divide-y divide-neutral-100 overflow-y-auto" style={{ maxHeight: "calc(100vh - 360px)" }}>
            {filteredFeed.length === 0 ? (
              <p className="py-10 text-center text-xs text-neutral-400">No detections match this filter.</p>
            ) : filteredFeed.map(person => (
              <div key={person.id} className="p-2">
                <FeedCard
                  person={person}
                  selected={selectedId === person.id}
                  onClick={() => setSelectedId(p => p === person.id ? null : person.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Always-visible summary */}
        <div className="flex flex-col gap-3">
          <TodaySummary />
        </div>
      </div>

      {/* Entity Detail — slide-in modal overlay */}
      {selectedPerson && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setSelectedId(null)}
          />
          {/* Panel — slides in from right */}
          <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-white shadow-2xl border-l border-neutral-200 overflow-y-auto"
            style={{ width: 460 }}>
            <EntityDetailPanel person={selectedPerson} onClose={() => setSelectedId(null)} />
          </div>
        </>
      )}
    </div>
  );
};
