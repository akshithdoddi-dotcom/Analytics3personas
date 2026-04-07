import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Ban,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Shield,
  ShieldAlert,
  Siren,
  Star,
  User,
  UserPlus,
  Waypoints,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { SlidePanel } from "./SlidePanel";
import { IdentityEvidenceMedia } from "../shared/IdentityEvidenceMedia";
import type { IdentityTerminology } from "../../data/types";

const REAL_FACE_IMAGES = [
  "https://images.pexels.com/photos/33738484/pexels-photo-33738484.jpeg?cs=srgb&dl=pexels-vika-glitter-392079-33738484.jpg&fm=jpg",
  "https://images.pexels.com/photos/14801453/pexels-photo-14801453.jpeg?cs=srgb&dl=pexels-kwizera-gadson-14801453.jpg&fm=jpg",
];

const REAL_LPR_IMAGES = [
  "https://images.pexels.com/photos/9331863/pexels-photo-9331863.jpeg?cs=srgb&dl=pexels-hasan-albari-1229861-9331863.jpg&fm=jpg",
  "https://images.pexels.com/photos/10182843/pexels-photo-10182843.jpeg?cs=srgb&dl=pexels-hson-10182843.jpg&fm=jpg",
];

const MATCHED_FACE_ENTITY = {
  displayName: "John Smith",
  secondaryLine: "Engineering · L3 restricted access",
  listMembership: "WHITELIST" as const,
  employeeId: "EMP-4821",
  eventTime: "2026-04-06 · 09:13:22 IST",
  eventCamera: "Main Lobby · CAM-LB-01",
  detectionConfidence: 96,
  matchConfidence: 94.7,
  journeyMinutes: 20.8,
  evidence: [
    { id: "m1", seed: "jsmith-face", imageSrc: REAL_FACE_IMAGES[0], label: "Main Lobby", sublabel: "CAM-LB-01 · 09:13", confidence: 95, frame: "14,402", duration: "8.3s" },
    { id: "m2", seed: "jsmith-face", imageSrc: REAL_FACE_IMAGES[0], label: "North Entrance", sublabel: "CAM-NE-01 · 09:11", confidence: 96, frame: "14,281", duration: "2.1s" },
    { id: "m3", seed: "jsmith-face", imageSrc: REAL_FACE_IMAGES[1], label: "South Entrance", sublabel: "CAM-SE-01 · 08:58", confidence: 93, frame: "13,918", duration: "42.0s" },
    { id: "m4", seed: "jsmith-face", imageSrc: REAL_FACE_IMAGES[1], label: "Parking Garage", sublabel: "CAM-PG-01 · 08:52", confidence: 92, frame: "13,440", duration: "4.2s" },
  ],
  stats: [
    { label: "Department", value: "Engineering" },
    { label: "Employee ID", value: "EMP-4821", mono: true },
    { label: "Access level", value: "L3 - Restricted Zones" },
    { label: "Monthly appearances", value: "312", mono: true },
  ],
  alerts: [
    { id: "a1", label: "Escorted access required", severity: "MEDIUM" as const, timestamp: "09:13:22", status: "ACTIVE" as const },
    { id: "a2", label: "Unknown at entry resolved", severity: "LOW" as const, timestamp: "08:58:10", status: "RESOLVED" as const },
  ],
};

const UNKNOWN_FACE_ENTITY = {
  displayName: "Unknown #88",
  secondaryLine: "Recurring unrecognized individual",
  listMembership: "UNKNOWN" as const,
  eventTime: "2026-04-06 · 09:13:55 IST",
  eventCamera: "South Entrance · CAM-SE-01",
  detectionConfidence: 64,
  matchConfidence: 61.2,
  journeyMinutes: 32,
  evidence: [
    { id: "u1", seed: "unknown-88", imageSrc: REAL_FACE_IMAGES[1], label: "South Entrance", sublabel: "CAM-SE-01 · 09:13", confidence: 64, frame: "22,810", duration: "42.0s" },
    { id: "u2", seed: "unknown-88", imageSrc: REAL_FACE_IMAGES[0], label: "Main Lobby", sublabel: "CAM-LB-01 · 08:58", confidence: 61, frame: "22,441", duration: "18.3s" },
    { id: "u3", seed: "unknown-88", imageSrc: REAL_FACE_IMAGES[1], label: "Service Ramp", sublabel: "CAM-SR-01 · 08:41", confidence: 59, frame: "21,914", duration: "27.1s" },
    { id: "u4", seed: "unknown-88", imageSrc: REAL_FACE_IMAGES[0], label: "South Entrance", sublabel: "CAM-SE-01 · Yesterday", confidence: 67, frame: "19,100", duration: "21.4s" },
  ],
  stats: [
    { label: "First seen", value: "2026-04-02 · 08:41" },
    { label: "Days seen", value: "4", mono: true },
    { label: "Typical window", value: "08:30–09:20" },
    { label: "Avg dwell", value: "38.2s", mono: true },
  ],
  alerts: [
    { id: "a3", label: "Unknown at entry", severity: "MEDIUM" as const, timestamp: "09:13:55", status: "ACTIVE" as const },
  ],
};

const MATCHED_PLATE_ENTITY = {
  displayName: "KA05 MJ 4421",
  secondaryLine: "Authorized supplier vehicle · Permit L3",
  listMembership: "WHITELIST" as const,
  eventTime: "2026-04-06 · 09:13:22 IST",
  eventCamera: "Garage Entry A · CAM-GA-01",
  detectionConfidence: 98,
  matchConfidence: 96.8,
  journeyMinutes: 14.4,
  plateText: "KA05MJ4421",
  evidence: [
    { id: "p1", seed: "ka05mj4421", imageSrc: REAL_LPR_IMAGES[0], label: "Garage Entry A", sublabel: "CAM-GA-01 · 09:13", confidence: 97, frame: "7,912", duration: "3.2s", plate: "KA05MJ4421" },
    { id: "p2", seed: "ka05mj4421", imageSrc: REAL_LPR_IMAGES[0], label: "Parking Ramp", sublabel: "CAM-PR-02 · 09:10", confidence: 96, frame: "7,401", duration: "4.1s", plate: "KA05MJ4421" },
    { id: "p3", seed: "ka05mj4421", imageSrc: REAL_LPR_IMAGES[1], label: "Loading Bay", sublabel: "CAM-LB-02 · 09:02", confidence: 95, frame: "6,989", duration: "5.4s", plate: "KA05MJ4421" },
  ],
  stats: [
    { label: "Vehicle type", value: "White delivery van" },
    { label: "Permit ID", value: "PERM-1841", mono: true },
    { label: "Owner", value: "BluePeak Logistics" },
    { label: "Visits this month", value: "24", mono: true },
  ],
  alerts: [
    { id: "a4", label: "Authorized vehicle verified", severity: "LOW" as const, timestamp: "09:13:22", status: "ACTIVE" as const },
  ],
};

const UNKNOWN_PLATE_ENTITY = {
  displayName: "Unknown Plate #88",
  secondaryLine: "Unregistered vehicle observed across 3 zones",
  listMembership: "UNKNOWN" as const,
  eventTime: "2026-04-06 · 09:13:55 IST",
  eventCamera: "Garage Entry B · CAM-GB-01",
  detectionConfidence: 91,
  matchConfidence: 63,
  journeyMinutes: 18.7,
  plateText: "UP80MN1123",
  evidence: [
    { id: "up1", seed: "up80mn1123", imageSrc: REAL_LPR_IMAGES[1], label: "Garage Entry B", sublabel: "CAM-GB-01 · 09:13", confidence: 91, frame: "10,284", duration: "3.0s", plate: "UP80MN1123" },
    { id: "up2", seed: "up80mn1123", imageSrc: REAL_LPR_IMAGES[0], label: "Service Ramp", sublabel: "CAM-SR-01 · 09:05", confidence: 88, frame: "9,882", duration: "4.7s", plate: "UP80MN1123" },
    { id: "up3", seed: "up80mn1123", imageSrc: REAL_LPR_IMAGES[1], label: "Basement Store", sublabel: "CAM-BS-01 · 08:57", confidence: 86, frame: "9,410", duration: "6.1s", plate: "UP80MN1123" },
  ],
  stats: [
    { label: "First seen", value: "2026-04-04 · 11:12" },
    { label: "Days seen", value: "3", mono: true },
    { label: "Gate attempts", value: "5", mono: true },
    { label: "Best OCR score", value: "63%", mono: true },
  ],
  alerts: [
    { id: "a5", label: "Unregistered plate attempt", severity: "MEDIUM" as const, timestamp: "09:13:55", status: "ACTIVE" as const },
  ],
};

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <div className="border-b border-t border-neutral-100 bg-neutral-50 px-5 py-2">
    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400">{children}</p>
  </div>
);

const StatBox = ({
  label,
  value,
  tone = "text-neutral-900",
}: {
  label: string;
  value: string;
  tone?: string;
}) => (
  <div className="rounded-[4px] border border-neutral-200 bg-white px-4 py-3">
    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">{label}</p>
    <p className={cn("mt-1.5 text-[24px] leading-none font-black font-data tabular-nums", tone)}>{value}</p>
  </div>
);

const MembershipBadge = ({ membership }: { membership: "WHITELIST" | "UNKNOWN" | "BLACKLIST" | "VIP" }) => {
  const config = {
    WHITELIST: { label: "Verified", icon: Shield, className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    UNKNOWN: { label: "Unknown", icon: User, className: "border-neutral-300 bg-neutral-100 text-neutral-600" },
    BLACKLIST: { label: "Watchlist", icon: ShieldAlert, className: "border-red-200 bg-red-50 text-red-700" },
    VIP: { label: "VIP", icon: Star, className: "border-purple-200 bg-purple-50 text-purple-700" },
  } as const;
  const Icon = config[membership].icon;
  return (
    <span className={cn("inline-flex h-6 items-center gap-1 rounded-[2px] border px-2 text-[10px] font-black uppercase tracking-[0.08em]", config[membership].className)}>
      <Icon className="h-2.5 w-2.5" />
      {config[membership].label}
    </span>
  );
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  entityType?: "matched" | "unknown" | "blacklist";
  onViewJourney?: () => void;
  terminology: IdentityTerminology;
}

export const EntityDetailPanel = ({
  isOpen,
  onClose,
  entityType = "matched",
  onViewJourney,
  terminology,
}: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isLPR = terminology.isLPR;
  const isUnknown = entityType === "unknown";
  const isBlacklist = entityType === "blacklist";

  const entity = useMemo(() => {
    const base = isLPR
      ? (isUnknown ? UNKNOWN_PLATE_ENTITY : MATCHED_PLATE_ENTITY)
      : (isUnknown ? UNKNOWN_FACE_ENTITY : MATCHED_FACE_ENTITY);

    if (!isBlacklist) return base;

    return {
      ...base,
      displayName: isLPR ? "TN09QX7001" : "Watchlist Subject BL-003",
      secondaryLine: isLPR ? "BOLO vehicle · gate block required" : "Blacklist hit · security response recommended",
      listMembership: "BLACKLIST" as const,
      alerts: [
        { id: "b1", label: isLPR ? "Stolen plate match" : "Blacklist match", severity: "HIGH" as const, timestamp: "09:13:22", status: "ACTIVE" as const },
      ],
    };
  }, [isBlacklist, isLPR, isUnknown]);

  const evidence = entity.evidence;
  const currentEvidence = evidence[currentIndex] ?? evidence[0];

  useEffect(() => {
    setCurrentIndex(0);
  }, [entityType, terminology.identityType, isOpen]);

  const nextEvidence = () => setCurrentIndex((v) => (v + 1) % evidence.length);
  const prevEvidence = () => setCurrentIndex((v) => (v - 1 + evidence.length) % evidence.length);

  const alertSeverityStyle = (severity: "HIGH" | "MEDIUM" | "LOW") => {
    if (severity === "HIGH") return "border-red-200 bg-red-50/40";
    if (severity === "MEDIUM") return "border-amber-200 bg-white";
    return "border-neutral-200 bg-neutral-50/60";
  };

  const alertIconStyle = (severity: "HIGH" | "MEDIUM" | "LOW") => {
    if (severity === "HIGH") return "text-red-600";
    if (severity === "MEDIUM") return "text-amber-500";
    return "text-neutral-400";
  };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={isLPR ? "Vehicle Detail" : "Entity Detail"}
      subtitle={entity.displayName}
      headerRight={
        evidence.length > 1 ? (
          <div className="flex items-center gap-1 rounded-[4px] border border-neutral-200 bg-neutral-50 px-1 py-1">
            <button onClick={prevEvidence} className="flex h-7 w-7 items-center justify-center rounded-[4px] text-neutral-400 transition-all hover:bg-white hover:text-neutral-800 active:scale-[0.97]">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[60px] text-center text-[11px] font-bold text-neutral-600 font-data tabular-nums">
              {currentIndex + 1} / {evidence.length}
            </span>
            <button onClick={nextEvidence} className="flex h-7 w-7 items-center justify-center rounded-[4px] text-neutral-400 transition-all hover:bg-white hover:text-neutral-800 active:scale-[0.97]">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : undefined
      }
    >

      {/* ── Hero: Entity summary + evidence media ── */}
      <div className="bg-white border-b border-neutral-100 px-5 py-5">
        <div className="space-y-5">

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[18px] font-black text-neutral-900 leading-none">{entity.displayName}</h3>
              <MembershipBadge membership={entity.listMembership} />
            </div>
            <p className="mt-1 text-[12px] text-neutral-500">{entity.secondaryLine}</p>

            <div className="mt-3 flex items-center gap-4 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                <span className="font-data tabular-nums">{entity.eventTime}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Camera className="h-3 w-3" />
                {entity.eventCamera}
              </span>
            </div>

            {/* Three key stats */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <StatBox
                label={terminology.matchScoreLabel}
                value={`${entity.matchConfidence}%`}
                tone={isUnknown ? "text-amber-600" : isBlacklist ? "text-red-700" : "text-emerald-700"}
              />
              <StatBox label="Detection" value={`${entity.detectionConfidence}%`} />
              <StatBox label="Journey" value={`${entity.journeyMinutes}m`} />
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={onViewJourney}
                className="flex h-9 items-center gap-1.5 rounded-[4px] bg-[#00775B] px-4 text-[12px] font-bold text-white transition-all hover:-translate-y-px hover:bg-[#00956D] hover:shadow-[0_0_20px_rgba(0,119,91,0.35)] active:scale-[0.98]"
              >
                <Waypoints className="h-3.5 w-3.5" />
                View Full Journey
              </button>
              {isUnknown && (
                <button className="flex h-9 items-center gap-1.5 rounded-[4px] border border-neutral-200 bg-white px-4 text-[12px] font-bold text-neutral-700 transition-all hover:-translate-y-px hover:border-[#00775B] hover:text-[#00775B] hover:shadow-[0_0_20px_rgba(0,119,91,0.2)] active:scale-[0.98]">
                  <UserPlus className="h-3.5 w-3.5" />
                  {isLPR ? "Register vehicle" : "Enroll person"}
                </button>
              )}
              <button className="flex h-9 items-center gap-1.5 rounded-[4px] border border-neutral-200 bg-white px-4 text-[12px] font-bold text-neutral-700 transition-all hover:-translate-y-px hover:border-[#00775B] hover:text-[#00775B] hover:shadow-[0_0_20px_rgba(0,119,91,0.2)] active:scale-[0.98]">
                <Shield className="h-3.5 w-3.5" />
                Add to watchlist
              </button>
              <button className="flex h-9 items-center gap-1.5 rounded-[4px] border border-red-200 bg-red-50/40 px-4 text-[12px] font-bold text-red-700 transition-all hover:-translate-y-px hover:shadow-[0_0_20px_rgba(231,0,11,0.15)] active:scale-[0.98]">
                <Siren className="h-3.5 w-3.5" />
                Escalate
              </button>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[192px,1fr]">
            <IdentityEvidenceMedia
              kind={isLPR ? "PLATE" : "FACE"}
              seed={currentEvidence.seed}
              imageSrc={currentEvidence.imageSrc}
              confidence={currentEvidence.confidence}
              label={currentEvidence.label}
              sublabel={currentEvidence.sublabel}
              plateText={currentEvidence.plate ?? entity.plateText}
              size="lg"
              live
              className="h-44 w-full max-w-[192px]"
            />
            <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-4">
              {evidence.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "rounded-[4px] border p-0.5 text-left transition-all overflow-hidden",
                    index === currentIndex
                      ? "border-[#00775B] shadow-[0_0_0_1px_#00775B]"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  )}
                >
                  <IdentityEvidenceMedia
                    kind={isLPR ? "PLATE" : "FACE"}
                    seed={item.seed}
                    imageSrc={item.imageSrc}
                    confidence={item.confidence}
                    plateText={item.plate ?? entity.plateText}
                    className="h-16 w-full"
                  />
                  <div className="px-1 pb-1 pt-1">
                    <p className="truncate text-[9px] font-bold text-neutral-700">{item.label}</p>
                    <p className="truncate text-[8px] text-neutral-400 font-data">{item.sublabel}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Current Evidence detail ── */}
      <SectionLabel>Current Evidence — {currentEvidence.label}</SectionLabel>
      <div className="px-5 py-4 bg-white border-b border-neutral-100">
        <div className="grid gap-3 lg:grid-cols-[1.2fr,0.8fr]">

          {/* Capture info */}
          <div className="rounded-[4px] border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Selected capture</p>
                <p className="mt-1 text-[16px] font-bold text-neutral-800">{currentEvidence.label}</p>
                <p className="text-[11px] text-neutral-500 font-data tabular-nums">{currentEvidence.sublabel}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="flex h-8 items-center gap-1.5 rounded-[4px] border border-neutral-200 bg-white px-3 text-[11px] font-bold text-neutral-600 transition-all hover:border-[#00775B] hover:text-[#00775B] active:scale-[0.98]">
                  <Download className="h-3 w-3" />
                  HD Crop
                </button>
                <button className="flex h-8 items-center gap-1.5 rounded-[4px] border border-neutral-200 bg-white px-3 text-[11px] font-bold text-neutral-600 transition-all hover:border-[#00775B] hover:text-[#00775B] active:scale-[0.98]">
                  <Eye className="h-3 w-3" />
                  Full Frame
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-neutral-200 pt-3">
              {[
                { label: "Frame", value: currentEvidence.frame, mono: true },
                { label: "In-frame duration", value: currentEvidence.duration, mono: true },
                { label: terminology.eventLabel, value: currentEvidence.label },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-neutral-400">{item.label}</p>
                  <p className={cn("mt-1 text-[13px] font-bold text-neutral-800", item.mono && "font-data tabular-nums")}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recognition summary */}
          <div className="rounded-[4px] border border-neutral-200 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Recognition Summary</p>
            <div className="mt-3 divide-y divide-neutral-100">
              {entity.stats.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0">
                  <span className="text-[12px] text-neutral-500">{item.label}</span>
                  <span className={cn("text-[12px] font-bold text-neutral-900", item.mono && "font-data tabular-nums")}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Capture sequence ── */}
      <SectionLabel>{evidence.length} Captures In Sequence</SectionLabel>
      <div className="border-b border-neutral-100 bg-white px-5 py-3">
        <div className="flex flex-wrap gap-1.5">
          {evidence.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-[4px] border px-3 text-[11px] font-bold transition-all",
                index === currentIndex
                  ? "border-[#00775B] bg-[#E5FFF9] text-[#00775B]"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
              )}
            >
              <span className="font-data tabular-nums text-[10px]">{index + 1}</span>
              <span>{item.label}</span>
              <span className="font-data tabular-nums text-[10px] text-neutral-400">{item.confidence}%</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Linked alerts ── */}
      <SectionLabel>Linked Alerts &amp; Actions</SectionLabel>
      <div className="space-y-2 px-5 py-4 pb-10 bg-white">
        {entity.alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              "flex items-start gap-3 rounded-[4px] border p-4",
              alertSeverityStyle(alert.severity)
            )}
          >
            <AlertTriangle className={cn("mt-0.5 h-4 w-4 shrink-0", alertIconStyle(alert.severity))} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-bold text-neutral-800">{alert.label}</span>
                {alert.status === "ACTIVE" && (
                  <span className="inline-flex h-5 items-center rounded-[2px] bg-red-600 px-1.5 text-[9px] font-black uppercase tracking-wide text-white">
                    Active
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-neutral-400">
                <span className="font-data tabular-nums">{alert.timestamp}</span>
                <span className="capitalize">{alert.status.toLowerCase()}</span>
              </div>
            </div>
            <button className="shrink-0 flex h-8 items-center gap-1.5 rounded-[4px] border border-neutral-200 bg-white px-3 text-[11px] font-bold text-neutral-600 transition-all hover:border-[#00775B] hover:text-[#00775B] active:scale-[0.98]">
              <Ban className="h-3 w-3" />
              Acknowledge
            </button>
          </div>
        ))}
      </div>
    </SlidePanel>
  );
};
