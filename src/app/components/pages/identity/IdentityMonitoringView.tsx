import { useState } from "react";
import { cn } from "@/app/lib/utils";
import {
  AlertTriangle,
  User,
  MapPin,
  ChevronRight,
  Navigation,
  X,
} from "lucide-react";
import type { IdentityTerminology } from "./data/types";
import type { IdentityAppOption } from "../IdentityAnalytics";

// ─── Types ────────────────────────────────────────────────────────────────────

type MatchStatus =
  | "BLACKLIST"
  | "UNKNOWN"
  | "WHITELIST"
  | "AUTHORIZED"
  | "VIP"
  | "UNREGISTERED";

type FeedFilter = "all" | "threats" | "unknowns" | "vip" | "authorized";

interface FeedItem {
  id: string;
  type: "FACE" | "PLATE";
  status: MatchStatus;
  displayName: string;
  subLabel?: string;
  camera: string;
  cameraId: string;
  time: string;
  confidence?: number;
  dwell?: number;
  recurring?: boolean;
  recurringDays?: number;
  actions: string[];
  isSticky?: boolean;
}

interface JourneyStop {
  camera: string;
  time: string;
  dwell: string;
  note?: string;
  status?: string;
}

// ─── Mock feed data ───────────────────────────────────────────────────────────

const FEED_ITEMS: FeedItem[] = [
  {
    id: "f1",
    type: "FACE",
    status: "BLACKLIST",
    displayName: "BL-003",
    camera: "Main Lobby",
    cameraId: "cam_main_lobby",
    time: "09:13:22",
    confidence: 94.7,
    actions: ["Acknowledge", "Dispatch Guard", "Lock Entry"],
    isSticky: true,
  },
  {
    id: "f2",
    type: "FACE",
    status: "UNKNOWN",
    displayName: "Unknown #88",
    camera: "South Entrance",
    cameraId: "cam_south_entrance",
    time: "09:13:55",
    dwell: 252,
    recurring: true,
    recurringDays: 4,
    actions: ["Enroll", "Escalate", "Track Journey"],
    isSticky: true,
  },
  {
    id: "f3",
    type: "FACE",
    status: "VIP",
    displayName: "VIP-007",
    camera: "North Entrance",
    cameraId: "cam_north_entrance",
    time: "09:12:45",
    confidence: 97.3,
    actions: ["Notify Host"],
  },
  {
    id: "f4",
    type: "FACE",
    status: "WHITELIST",
    displayName: "John Smith",
    subLabel: "Engineering · EMP-4821",
    camera: "Main Lobby",
    cameraId: "cam_main_lobby",
    time: "09:12:45",
    confidence: 96.1,
    actions: [],
  },
  {
    id: "f5",
    type: "PLATE",
    status: "AUTHORIZED",
    displayName: "KA05MJ4421",
    subLabel: "White Honda City · Rahul Sharma",
    camera: "Garage Entry A",
    cameraId: "cam_garage_entry_a",
    time: "09:13:05",
    confidence: 98.2,
    actions: [],
  },
  {
    id: "f6",
    type: "PLATE",
    status: "UNREGISTERED",
    displayName: "UP80MN1123",
    subLabel: "Unknown vehicle",
    camera: "Garage Entry A",
    cameraId: "cam_garage_entry_a",
    time: "09:14:06",
    confidence: 91.0,
    recurring: true,
    recurringDays: 4,
    actions: ["Add to Authorized", "Escalate", "Notify Security"],
  },
  {
    id: "f7",
    type: "FACE",
    status: "UNKNOWN",
    displayName: "Unknown #134",
    camera: "Garage Entry B",
    cameraId: "cam_garage_entry_b",
    time: "09:11:45",
    dwell: 88,
    recurring: true,
    recurringDays: 2,
    actions: ["Enroll", "Escalate"],
  },
  {
    id: "f8",
    type: "FACE",
    status: "UNKNOWN",
    displayName: "Unknown #201",
    camera: "Main Lobby",
    cameraId: "cam_main_lobby",
    time: "09:10:29",
    dwell: 12,
    actions: ["Enroll", "Mark as Visitor"],
  },
  {
    id: "f9",
    type: "FACE",
    status: "WHITELIST",
    displayName: "Sarah Johnson",
    subLabel: "HR Dept · EMP-2198",
    camera: "Reception",
    cameraId: "cam_reception",
    time: "09:09:14",
    confidence: 95.4,
    actions: [],
  },
  {
    id: "f10",
    type: "FACE",
    status: "WHITELIST",
    displayName: "Raj Patel",
    subLabel: "Finance · EMP-3312",
    camera: "North Entrance",
    cameraId: "cam_north_entrance",
    time: "09:08:55",
    confidence: 97.8,
    actions: [],
  },
];

const JOURNEY_DATA: Record<string, JourneyStop[]> = {
  f1: [
    { camera: "Parking Garage", time: "08:52", dwell: "4.2s", note: "🚗 KA05MJ4421 linked" },
    { camera: "South Entrance", time: "08:58", dwell: "42s", note: "⚠ Unknown alert (resolved)" },
    { camera: "North Entrance", time: "09:11", dwell: "2.1s" },
    { camera: "Main Lobby", time: "09:13", dwell: "8.3s", status: "ACTIVE", note: "⛔ Blacklist alert ACTIVE" },
  ],
  f2: [
    { camera: "South Entrance", time: "08:41", dwell: "31s" },
    { camera: "South Entrance", time: "09:13", dwell: "4m 12s", status: "ACTIVE", note: "Currently present — dwell growing" },
  ],
};

// ─── Zone map nodes ───────────────────────────────────────────────────────────

const ZONE_NODES = [
  { id: "cam_parking_garage",  label: "Parking",       x: 15, y: 78, level: "normal" },
  { id: "cam_south_entrance",  label: "South Ent.",    x: 28, y: 58, level: "unknown" },
  { id: "cam_north_entrance",  label: "North Ent.",    x: 62, y: 28, level: "normal" },
  { id: "cam_main_lobby",      label: "Main Lobby",    x: 78, y: 52, level: "critical" },
  { id: "cam_garage_entry_a",  label: "Garage A",      x: 18, y: 38, level: "unknown" },
  { id: "cam_garage_entry_b",  label: "Garage B",      x: 34, y: 20, level: "normal" },
  { id: "cam_reception",       label: "Reception",     x: 60, y: 70, level: "normal" },
  { id: "cam_west_corridor",   label: "West Corr.",    x: 48, y: 50, level: "normal" },
  { id: "cam_executive_floor", label: "Executive",     x: 88, y: 22, level: "normal" },
  { id: "cam_server_room",     label: "Server Room",   x: 84, y: 82, level: "offline" },
];

const LEVEL_COLOR: Record<string, string> = {
  critical: "#DC2626",
  unknown: "#D97706",
  vip: "#CA8A04",
  normal: "#00775B",
  offline: "#9CA3AF",
};

// Selected person's path order (for BL-003 example)
const BL_PATH = ["cam_parking_garage", "cam_south_entrance", "cam_north_entrance", "cam_main_lobby"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<
  MatchStatus,
  { label: string; textColor: string; border: string; bg: string; badgeBg: string; badgeText: string }
> = {
  BLACKLIST:    { label: "Blacklist",    textColor: "text-red-600",    border: "border-l-red-500",    bg: "bg-red-50/60",    badgeBg: "bg-red-100",    badgeText: "text-red-700" },
  UNKNOWN:      { label: "Unknown",     textColor: "text-amber-600",  border: "border-l-amber-400",  bg: "bg-amber-50/40",  badgeBg: "bg-amber-100",  badgeText: "text-amber-700" },
  WHITELIST:    { label: "Whitelist",   textColor: "text-emerald-700",border: "border-l-transparent",bg: "",                badgeBg: "bg-emerald-100",badgeText: "text-emerald-700" },
  AUTHORIZED:   { label: "Authorized",  textColor: "text-emerald-700",border: "border-l-transparent",bg: "",                badgeBg: "bg-emerald-100",badgeText: "text-emerald-700" },
  VIP:          { label: "VIP",         textColor: "text-yellow-700", border: "border-l-yellow-400", bg: "bg-yellow-50/40", badgeBg: "bg-yellow-100", badgeText: "text-yellow-700" },
  UNREGISTERED: { label: "Unregistered",textColor: "text-amber-600",  border: "border-l-amber-400",  bg: "bg-amber-50/40",  badgeBg: "bg-amber-100",  badgeText: "text-amber-700" },
};

function formatDwell(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// ─── Status bar pill ──────────────────────────────────────────────────────────

function StatusPill({
  count,
  label,
  colorClass,
  pulse = false,
}: {
  count: number | string;
  label: string;
  colorClass: string;
  pulse?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold", colorClass)}>
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
      )}
      <span>{count}</span>
      <span className="font-normal opacity-75">{label}</span>
    </div>
  );
}

// ─── Avatar placeholder ───────────────────────────────────────────────────────

function AvatarBox({ type, status }: { type: "FACE" | "PLATE"; status: MatchStatus }) {
  const bg =
    status === "BLACKLIST"
      ? "bg-red-100"
      : status === "VIP"
      ? "bg-yellow-100"
      : status === "UNKNOWN" || status === "UNREGISTERED"
      ? "bg-amber-100"
      : "bg-emerald-50";
  return (
    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-black/5", bg)}>
      {type === "PLATE" ? (
        <span className="text-[8px] font-bold text-neutral-500 text-center leading-tight tracking-tight">
          PLATE
        </span>
      ) : (
        <User className="w-5 h-5 text-neutral-400" />
      )}
    </div>
  );
}

// ─── Inline action button ─────────────────────────────────────────────────────

function ActionBtn({ label }: { label: string }) {
  const isDestructive =
    label === "Acknowledge" || label === "Dispatch Guard" || label === "Lock Entry";
  const isPrimary = label === "Enroll" || label === "Add to Authorized";
  return (
    <button
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors whitespace-nowrap",
        isDestructive && "border-red-300 text-red-600 hover:bg-red-50",
        isPrimary && "border-[#00775B] text-[#00775B] hover:bg-emerald-50",
        !isDestructive && !isPrimary && "border-neutral-300 text-neutral-600 hover:bg-neutral-100"
      )}
    >
      {label}
    </button>
  );
}

// ─── Feed card ────────────────────────────────────────────────────────────────

function FeedCard({
  item,
  selected,
  onClick,
}: {
  item: FeedItem;
  selected: boolean;
  onClick: () => void;
}) {
  const meta = STATUS_META[item.status];
  return (
    <div
      onClick={onClick}
      className={cn(
        "border-l-4 rounded-r-lg px-3 py-2.5 cursor-pointer transition-all border border-l-0 select-none",
        meta.border,
        meta.bg,
        selected
          ? "border-neutral-300 bg-white shadow-md ring-1 ring-[#00775B]/30"
          : "border-neutral-200 hover:bg-white hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-2.5">
        <AvatarBox type={item.type} status={item.status} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-neutral-900 truncate">{item.displayName}</span>
            <span
              className={cn(
                "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                meta.badgeBg,
                meta.badgeText
              )}
            >
              {meta.label}
            </span>
            {item.recurring && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">
                ▲ Recurring {item.recurringDays}d
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
            <MapPin className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
            <span className="text-[10px] text-neutral-500 truncate">{item.camera}</span>
            {item.confidence !== undefined && (
              <span className="text-[10px] text-neutral-400 shrink-0">· {item.confidence}%</span>
            )}
            {item.dwell !== undefined && (
              <span className="text-[10px] text-amber-600 font-semibold shrink-0">
                · dwell {formatDwell(item.dwell)}
              </span>
            )}
          </div>
          {item.actions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.actions.slice(0, 3).map((a) => (
                <ActionBtn key={a} label={a} />
              ))}
            </div>
          )}
        </div>
        <span className="text-[10px] text-neutral-400 shrink-0 mt-0.5">{item.time}</span>
      </div>
    </div>
  );
}

// ─── Center: Today's Summary ──────────────────────────────────────────────────

function TodaySummary() {
  const rows = [
    { label: "Blacklist Matches",     value: 1,    note: "1 unacknowledged", dot: "bg-red-500",    valueColor: "text-red-600" },
    { label: "Unknowns at Entry",     value: 11,   note: "3 recurring",      dot: "bg-amber-400",  valueColor: "text-amber-600" },
    { label: "Access Denials",        value: 4,    note: "",                 dot: "bg-orange-400", valueColor: "text-orange-600" },
    { label: "VIP Detections",        value: 2,    note: "1 on site now",    dot: "bg-yellow-400", valueColor: "text-yellow-600" },
    { label: "Total Identifications", value: 2840, note: "97.2% accuracy",   dot: "bg-emerald-500",valueColor: "text-emerald-700" },
  ];

  return (
    <div className="p-4 space-y-4">
      <div>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-3">
          Today's Threat Summary
        </p>
        <div className="divide-y divide-neutral-100">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", row.dot)} />
                <span className="text-xs text-neutral-700">{row.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-bold tabular-nums", row.valueColor)}>
                  {row.value.toLocaleString()}
                </span>
                {row.note && (
                  <span className="text-[10px] text-neutral-400">{row.note}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-red-50 rounded-xl p-3 border border-red-200">
        <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider mb-0.5">
          Most Active Threat Zone
        </p>
        <p className="text-sm font-bold text-red-700">Main Lobby</p>
        <p className="text-[11px] text-red-500 mt-0.5">
          1 blacklist hit · 12 access denials today
        </p>
      </div>

      <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
        <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-0.5">
          Longest Unknown Dwell
        </p>
        <p className="text-sm font-bold text-amber-800">Unknown #88 · South Entrance</p>
        <p className="text-[11px] text-amber-600 mt-0.5">
          4m 12s at entry point — recurring over 4 days
        </p>
      </div>

      <p className="text-[10px] text-neutral-400 text-center pt-2">
        Select a detection from the feed to view full details
      </p>
    </div>
  );
}

// ─── Center: Person / Vehicle detail ─────────────────────────────────────────

function PersonDetail({
  item,
  onClose,
}: {
  item: FeedItem;
  onClose: () => void;
}) {
  const meta = STATUS_META[item.status];
  const journey = JOURNEY_DATA[item.id];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn("flex items-start gap-3 p-4 border-b border-neutral-200", meta.bg)}>
        <div
          className={cn(
            "w-16 h-16 rounded-xl flex items-center justify-center shrink-0 border border-black/5",
            item.status === "BLACKLIST"
              ? "bg-red-100"
              : item.status === "VIP"
              ? "bg-yellow-100"
              : item.status === "UNKNOWN" || item.status === "UNREGISTERED"
              ? "bg-amber-100"
              : "bg-emerald-50"
          )}
        >
          {item.type === "PLATE" ? (
            <span className="text-[10px] font-bold text-neutral-500">PLATE</span>
          ) : (
            <User className="w-8 h-8 text-neutral-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-neutral-900">{item.displayName}</span>
            <span
              className={cn(
                "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full",
                meta.badgeBg,
                meta.badgeText
              )}
            >
              {meta.label}
            </span>
          </div>
          {item.subLabel && (
            <p className="text-[11px] text-neutral-500 mt-0.5">{item.subLabel}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {item.confidence !== undefined && (
              <span className="text-[10px] text-neutral-500">
                Match: <strong>{item.confidence}%</strong>
              </span>
            )}
            <span className="text-[10px] text-neutral-400">·</span>
            <span className="text-[10px] text-neutral-500">
              {item.camera} · {item.time}
            </span>
          </div>
          {item.recurring && (
            <p className="text-[10px] text-orange-600 font-semibold mt-1">
              ▲ Recurring — Seen on {item.recurringDays} of last 5 days
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-black/5 text-neutral-400 hover:text-neutral-600 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Alert / action block */}
      {(item.status === "BLACKLIST" || item.status === "UNREGISTERED") && item.actions.length > 0 && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
              Active Alert
            </span>
            <span className="ml-auto text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">
              CRITICAL
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.actions.map((a) => (
              <button
                key={a}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-red-300 text-red-700 hover:bg-red-100 transition-colors"
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      )}

      {item.status === "UNKNOWN" && item.actions.length > 0 && (
        <div className="mx-4 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
              Actions
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.actions.map((a) => (
              <button
                key={a}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors",
                  a === "Enroll"
                    ? "border-[#00775B] text-[#00775B] hover:bg-emerald-50"
                    : "border-amber-300 text-amber-700 hover:bg-amber-100"
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      )}

      {item.status === "VIP" && item.actions.length > 0 && (
        <div className="mx-4 mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex flex-wrap gap-1.5">
            {item.actions.map((a) => (
              <button
                key={a}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-yellow-300 text-yellow-700 hover:bg-yellow-100 transition-colors"
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Journey history */}
      {journey && (
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-3">
            Journey — Today
          </p>
          <div>
            {journey.map((stop, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-1 shrink-0",
                      stop.status === "ACTIVE"
                        ? "bg-red-500 ring-2 ring-red-200"
                        : "bg-neutral-300"
                    )}
                  />
                  {i < journey.length - 1 && (
                    <div className="w-px flex-1 bg-neutral-200 my-1" style={{ minHeight: 20 }} />
                  )}
                </div>
                <div className="pb-3 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-neutral-800">{stop.time}</span>
                    <span className="text-xs text-neutral-600">{stop.camera}</span>
                    <span className="text-[10px] text-neutral-400">{stop.dwell}</span>
                    {stop.status === "ACTIVE" && (
                      <span className="text-[9px] font-bold text-red-600 uppercase">
                        ← here now
                      </span>
                    )}
                  </div>
                  {stop.note && (
                    <p className="text-[10px] text-neutral-500 mt-0.5">{stop.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!journey && (
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Last Sighting
          </p>
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
            {item.camera} · {item.time}
          </div>
        </div>
      )}

      {/* Track Journey button */}
      <div className="px-4 pb-4 mt-auto pt-3 border-t border-neutral-100">
        <button className="w-full flex items-center justify-center gap-2 h-8 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 hover:border-[#00775B]/30 transition-all">
          <Navigation className="w-3.5 h-3.5 text-neutral-400" />
          Track Journey
          <ChevronRight className="w-3.5 h-3.5 ml-auto text-neutral-400" />
        </button>
      </div>
    </div>
  );
}

// ─── Zone map (SVG schematic) ─────────────────────────────────────────────────

function ZoneMap({ selectedCameraId }: { selectedCameraId?: string }) {
  const pathIds =
    selectedCameraId && BL_PATH.includes(selectedCameraId)
      ? BL_PATH.slice(0, BL_PATH.indexOf(selectedCameraId) + 1)
      : [];

  return (
    <div className="relative w-full" style={{ paddingBottom: "72%" }}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Floor plan outline */}
        <rect x="5" y="5" width="90" height="90" rx="2" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="0.6" />
        {/* Interior walls */}
        <line x1="5" y1="47" x2="95" y2="47" stroke="#E5E7EB" strokeWidth="0.4" strokeDasharray="3,2" />
        <line x1="50" y1="5" x2="50" y2="47" stroke="#E5E7EB" strokeWidth="0.4" strokeDasharray="3,2" />
        {/* Zone labels */}
        <text x="27" y="70" fontSize="3" fill="#D1D5DB" textAnchor="middle" fontFamily="sans-serif">WEST</text>
        <text x="72" y="70" fontSize="3" fill="#D1D5DB" textAnchor="middle" fontFamily="sans-serif">EAST</text>
        <text x="27" y="28" fontSize="3" fill="#D1D5DB" textAnchor="middle" fontFamily="sans-serif">GARAGE</text>

        {/* Path lines */}
        {pathIds.map((id, i) => {
          if (i === 0) return null;
          const from = ZONE_NODES.find((n) => n.id === pathIds[i - 1]);
          const to = ZONE_NODES.find((n) => n.id === id);
          if (!from || !to) return null;
          return (
            <line
              key={id}
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke="#00775B"
              strokeWidth="0.8"
              strokeDasharray="3,1.5"
              opacity="0.8"
            />
          );
        })}

        {/* Camera nodes */}
        {ZONE_NODES.map((node) => {
          const color = LEVEL_COLOR[node.level] ?? "#9CA3AF";
          const isSelected = node.id === selectedCameraId;
          const inPath = pathIds.includes(node.id);
          const dimmed = selectedCameraId && !inPath && !isSelected;

          return (
            <g key={node.id} transform={`translate(${node.x},${node.y})`} opacity={dimmed ? 0.25 : 1}>
              {isSelected && (
                <circle r="5.5" fill={color} opacity="0.18">
                  <animate attributeName="r" values="4;6.5;4" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.18;0.35;0.18" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle r={isSelected ? 3 : 2.2} fill={color} />
              <text
                y="6"
                fontSize="2.2"
                fill="#6B7280"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Journey default view ─────────────────────────────────────────────────────

const TOP_JOURNEYS = [
  { id: "f1", name: "BL-003",        cameras: 4, duration: "21m", status: "BLACKLIST"    as MatchStatus, note: "⛔ active alert" },
  { id: "f2", name: "Unknown #88",   cameras: 2, duration: "32m", status: "UNKNOWN"      as MatchStatus, note: "▲ recurring" },
  { id: "f6", name: "UP80MN1123",    cameras: 1, duration: "2m",  status: "UNREGISTERED" as MatchStatus, note: "▲ recurring" },
  { id: "f4", name: "John Smith",    cameras: 3, duration: "14m", status: "WHITELIST"    as MatchStatus, note: "" },
  { id: "f9", name: "Sarah Johnson", cameras: 2, duration: "8m",  status: "WHITELIST"    as MatchStatus, note: "" },
];

function JourneyDefaultView({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
        Today's Notable Journeys
      </p>
      <div className="space-y-1.5">
        {TOP_JOURNEYS.map((j) => {
          const meta = STATUS_META[j.status];
          return (
            <div
              key={j.id}
              onClick={() => onSelect(j.id)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl border border-neutral-200 hover:border-[#00775B]/30 hover:bg-emerald-50/30 cursor-pointer transition-all group"
            >
              <span className={cn("text-xs font-semibold flex-1 truncate", meta.textColor)}>
                {j.name}
              </span>
              <span className="text-[10px] text-neutral-400 shrink-0">
                {j.cameras} cams · {j.duration}
              </span>
              {j.note && (
                <span className="text-[9px] text-neutral-500 shrink-0">{j.note}</span>
              )}
              <ChevronRight className="w-3 h-3 text-neutral-300 group-hover:text-[#00775B] shrink-0 transition-colors" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  terminology: IdentityTerminology;
  timeRange: string;
  activeApp: IdentityAppOption;
  onEntityClick?: (type: "matched" | "unknown" | "blacklist") => void;
  onCameraClick?: (cameraId?: string) => void;
  onJourneyClick?: () => void;
}

export const IdentityMonitoringView = ({
  terminology: _terminology,
  timeRange: _timeRange,
  activeApp: _activeApp,
}: Props) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");

  const selectedItem = FEED_ITEMS.find((f) => f.id === selectedId) ?? null;
  const sticky = FEED_ITEMS.filter((f) => f.isSticky);
  const live = FEED_ITEMS.filter((f) => !f.isSticky);

  function filterItem(item: FeedItem): boolean {
    switch (feedFilter) {
      case "threats":    return item.status === "BLACKLIST" || item.status === "UNREGISTERED";
      case "unknowns":   return item.status === "UNKNOWN" || item.status === "UNREGISTERED";
      case "vip":        return item.status === "VIP";
      case "authorized": return item.status === "WHITELIST" || item.status === "AUTHORIZED";
      default:           return true;
    }
  }

  const filteredSticky = sticky.filter(filterItem);
  const filteredLive = live.filter(filterItem);

  const FILTERS: { id: FeedFilter; label: string; count: number }[] = [
    { id: "all",        label: "All",        count: FEED_ITEMS.length },
    { id: "threats",    label: "Threats",    count: FEED_ITEMS.filter((f) => f.status === "BLACKLIST" || f.status === "UNREGISTERED").length },
    { id: "unknowns",   label: "Unknowns",   count: FEED_ITEMS.filter((f) => f.status === "UNKNOWN" || f.status === "UNREGISTERED").length },
    { id: "vip",        label: "VIP",        count: FEED_ITEMS.filter((f) => f.status === "VIP").length },
    { id: "authorized", label: "Authorized", count: FEED_ITEMS.filter((f) => f.status === "WHITELIST" || f.status === "AUTHORIZED").length },
  ];

  const mapLegend = [
    { color: "bg-red-500",    label: "Critical" },
    { color: "bg-amber-400",  label: "Unknown"  },
    { color: "bg-emerald-600",label: "Normal"   },
    { color: "bg-neutral-400",label: "Offline"  },
  ];

  return (
    <div className="flex flex-col rounded-xl border border-neutral-200 overflow-hidden bg-white shadow-sm" style={{ minHeight: "75vh" }}>

      {/* ── Status Bar ── */}
      <div className="shrink-0 flex flex-wrap items-center gap-1 px-3 py-2 bg-[#021d18] text-xs border-b border-white/10">
        <StatusPill count={2} label="Active Threats"    colorClass="bg-red-900/50 text-red-300"    pulse />
        <span className="text-white/20 px-0.5">·</span>
        <StatusPill count={5} label="Unknowns at Entry" colorClass="bg-amber-900/40 text-amber-300" />
        <span className="text-white/20 px-0.5">·</span>
        <StatusPill count={1} label="VIP on Site"       colorClass="bg-yellow-900/40 text-yellow-300" />
        <span className="text-white/20 px-0.5">·</span>
        <StatusPill count="11/12" label="Cameras Online" colorClass="bg-emerald-900/40 text-emerald-300" />
        <span className="ml-auto text-[10px] text-white/40">
          Last updated: 3s ago · Auto-refresh ON
        </span>
      </div>

      {/* ── Three Columns ── */}
      <div className="flex flex-1 min-h-0 divide-x divide-neutral-200" style={{ minHeight: "calc(75vh - 40px)" }}>

        {/* LEFT: Live Detection Feed */}
        <div className="w-[30%] flex flex-col min-h-0 bg-neutral-50/40">
          {/* Filter bar */}
          <div className="shrink-0 flex items-center gap-0.5 px-2 py-2 border-b border-neutral-200 bg-white overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFeedFilter(f.id)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap transition-colors",
                  feedFilter === f.id
                    ? "bg-[#021d18] text-white"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "text-[9px] px-1 py-0.5 rounded-full min-w-[16px] text-center",
                    feedFilter === f.id
                      ? "bg-white/20 text-white"
                      : "bg-neutral-200 text-neutral-500"
                  )}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Scrollable feed */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {/* Sticky threats section */}
            {filteredSticky.length > 0 && (
              <>
                <div className="flex items-center gap-2 px-1">
                  <div className="h-px flex-1 bg-red-200" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-red-400">
                    Active Threats
                  </span>
                  <div className="h-px flex-1 bg-red-200" />
                </div>
                {filteredSticky.map((item) => (
                  <FeedCard
                    key={item.id}
                    item={item}
                    selected={selectedId === item.id}
                    onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                  />
                ))}
                <div className="flex items-center gap-2 px-1">
                  <div className="h-px flex-1 bg-neutral-200" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                    Live Feed
                  </span>
                  <div className="h-px flex-1 bg-neutral-200" />
                </div>
              </>
            )}

            {/* Live feed */}
            {filteredLive.map((item) => (
              <FeedCard
                key={item.id}
                item={item}
                selected={selectedId === item.id}
                onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
              />
            ))}

            {filteredSticky.length === 0 && filteredLive.length === 0 && (
              <p className="text-xs text-neutral-400 text-center py-10">
                No detections match this filter.
              </p>
            )}
          </div>
        </div>

        {/* CENTER: Person / Vehicle Detail */}
        <div className="w-[40%] flex flex-col min-h-0 bg-white">
          {/* Panel header */}
          <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-neutral-200">
            <span className="text-xs font-bold text-neutral-700">
              {selectedItem ? selectedItem.displayName : "Today's Summary"}
            </span>
            {selectedItem && (
              <button
                onClick={() => setSelectedId(null)}
                className="ml-auto flex items-center gap-1 text-[10px] text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {selectedItem ? (
              <PersonDetail item={selectedItem} onClose={() => setSelectedId(null)} />
            ) : (
              <TodaySummary />
            )}
          </div>
        </div>

        {/* RIGHT: Zone Map + Journey View */}
        <div className="w-[30%] flex flex-col min-h-0 overflow-y-auto">
          {/* Zone Map */}
          <div className="shrink-0 p-3 border-b border-neutral-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Zone Map
              </span>
              <span className="text-[9px] text-neutral-400">11/12 online</span>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden">
              <ZoneMap selectedCameraId={selectedItem?.cameraId} />
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {mapLegend.map((l) => (
                <div key={l.label} className="flex items-center gap-1">
                  <span className={cn("w-2 h-2 rounded-full", l.color)} />
                  <span className="text-[9px] text-neutral-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Journey View */}
          <div className="flex-1 p-3 bg-neutral-50/40">
            <JourneyDefaultView onSelect={(id) => setSelectedId(id)} />
          </div>
        </div>
      </div>
    </div>
  );
};
