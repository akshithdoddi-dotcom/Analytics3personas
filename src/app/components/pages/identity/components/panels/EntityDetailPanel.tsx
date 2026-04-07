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
    { label: "Typical window", value: "08:30-09:20" },
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
  <div className="border-b border-neutral-100 bg-neutral-50 px-6 py-2">
    <p className="text-[12px] leading-[1.3] font-semibold uppercase tracking-[0.05em] text-neutral-500">{children}</p>
  </div>
);

const MembershipBadge = ({ membership }: { membership: "WHITELIST" | "UNKNOWN" | "BLACKLIST" | "VIP" }) => {
  const config = {
    WHITELIST: { label: "Verified", icon: Shield, className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    UNKNOWN: { label: "Unknown", icon: User, className: "border-slate-200 bg-slate-50 text-slate-700" },
    BLACKLIST: { label: "Watchlist", icon: ShieldAlert, className: "border-red-200 bg-red-50 text-red-700" },
    VIP: { label: "VIP", icon: Star, className: "border-purple-200 bg-purple-50 text-purple-700" },
  } as const;
  const Icon = config[membership].icon;
  return (
    <span className={cn("inline-flex h-10 items-center gap-1 rounded-[4px] border px-3 text-[12px] leading-[1.3] font-semibold uppercase tracking-[0.05em]", config[membership].className)}>
      <Icon className="h-3 w-3" />
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

  const nextEvidence = () => setCurrentIndex((value) => (value + 1) % evidence.length);
  const prevEvidence = () => setCurrentIndex((value) => (value - 1 + evidence.length) % evidence.length);

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={isLPR ? "Vehicle Detail" : "Entity Detail"}
      subtitle={entity.displayName}
      headerRight={
        evidence.length > 1 ? (
          <div className="flex items-center gap-1 rounded-[4px] border border-neutral-200 bg-neutral-50 px-1 py-1">
            <button onClick={prevEvidence} className="flex h-8 w-8 items-center justify-center rounded-[4px] text-neutral-500 transition-all duration-200 [transition-timing-function:var(--ease-snappy)] hover:bg-white hover:text-neutral-900 active:scale-[0.98]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[72px] text-center text-[12px] leading-[1.3] font-semibold text-neutral-600">
              {currentIndex + 1} / {evidence.length}
            </span>
            <button onClick={nextEvidence} className="flex h-8 w-8 items-center justify-center rounded-[4px] text-neutral-500 transition-all duration-200 [transition-timing-function:var(--ease-snappy)] hover:bg-white hover:text-neutral-900 active:scale-[0.98]">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : undefined
      }
    >
      <div className="border-b border-neutral-100 px-6 py-5">
        <div className="grid gap-4 lg:grid-cols-[1fr,176px]">
          <div className="min-w-0 order-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-neutral-900">{entity.displayName}</h3>
                  <MembershipBadge membership={entity.listMembership} />
                </div>
                <p className="mt-1 text-sm text-neutral-500">{entity.secondaryLine}</p>
              </div>
                <div className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-right">
                  <p className="text-[12px] leading-[1.3] font-semibold uppercase tracking-[0.05em] text-neutral-500">
                    Evidence Set
                  </p>
                  <p className="mt-1 text-[28px] leading-[1.2] font-bold font-data tabular-nums text-neutral-900">{evidence.length}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                { label: terminology.matchScoreLabel, value: `${entity.matchConfidence}%`, tone: isUnknown ? "text-amber-600" : isBlacklist ? "text-red-600" : "text-emerald-700" },
                { label: "Detection Confidence", value: `${entity.detectionConfidence}%`, tone: "text-neutral-900" },
                { label: "Journey Duration", value: `${entity.journeyMinutes} min`, tone: "text-neutral-900" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-md border border-neutral-200 bg-white px-4 py-4 shadow-sm">
                    <p className="text-[12px] leading-[1.3] font-semibold uppercase tracking-[0.05em] text-neutral-500">{stat.label}</p>
                    <p className={cn("mt-2 text-[28px] leading-[1.2] font-bold font-data tabular-nums", stat.tone)}>{stat.value}</p>
                  </div>
                ))}
              </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-[14px] leading-[1.5] text-neutral-500">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{entity.eventTime}</span>
              <span className="flex items-center gap-1"><Camera className="h-3.5 w-3.5" />{entity.eventCamera}</span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={onViewJourney}
                className="flex h-10 items-center gap-1.5 rounded-[4px] bg-[var(--primary-main)] px-5 text-[14px] font-semibold text-white transition-all duration-200 [transition-timing-function:var(--ease-snappy)] hover:-translate-y-px hover:bg-[var(--primary-hover)] hover:shadow-[0_0_20px_var(--primary-glow)] active:scale-[0.98]"
              >
                <Waypoints className="h-3.5 w-3.5" />
                View Full Journey
              </button>
              {isUnknown && (
                <button className="flex h-10 items-center gap-1.5 rounded-[4px] border border-neutral-200 bg-white px-5 text-[14px] font-semibold text-neutral-700 transition-all duration-200 [transition-timing-function:var(--ease-snappy)] hover:-translate-y-px hover:border-[var(--primary-main)] hover:text-[var(--primary-main)] hover:shadow-[0_0_20px_var(--primary-glow)] active:scale-[0.98]">
                  <UserPlus className="h-3.5 w-3.5" />
                  {isLPR ? "Register vehicle" : "Enroll person"}
                </button>
              )}
              <button className="flex h-10 items-center gap-1.5 rounded-[4px] border border-neutral-200 bg-white px-5 text-[14px] font-semibold text-neutral-700 transition-all duration-200 [transition-timing-function:var(--ease-snappy)] hover:-translate-y-px hover:border-[var(--primary-main)] hover:text-[var(--primary-main)] hover:shadow-[0_0_20px_var(--primary-glow)] active:scale-[0.98]">
                <Shield className="h-3.5 w-3.5" />
                Add to watchlist
              </button>
              <button className="flex h-10 items-center gap-1.5 rounded-[4px] border border-[var(--severity-critical)]/20 bg-[var(--severity-critical-light)] px-5 text-[14px] font-semibold text-[var(--severity-critical)] transition-all duration-200 [transition-timing-function:var(--ease-snappy)] hover:-translate-y-px hover:shadow-[0_0_20px_rgba(231,0,11,0.18)] active:scale-[0.98]">
                <Siren className="h-3.5 w-3.5" />
                Escalate
              </button>
            </div>
          </div>

          <div className="order-2 space-y-3">
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
              className="h-44 w-44"
            />
            <div className="grid grid-cols-2 gap-2">
              {evidence.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "rounded-md border p-1 text-left transition-all",
                    index === currentIndex
                      ? "border-[#00775B] bg-[#E5FFF9]"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  )}
                >
                  <IdentityEvidenceMedia
                    kind={isLPR ? "PLATE" : "FACE"}
                    seed={item.seed}
                    imageSrc={item.imageSrc}
                    confidence={item.confidence}
                    plateText={item.plate ?? entity.plateText}
                    className="h-20 w-full"
                  />
                  <div className="px-1 pb-1 pt-2">
                    <p className="truncate text-[10px] font-bold text-neutral-800">{item.label}</p>
                    <p className="truncate text-[9px] text-neutral-500">{item.sublabel}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SectionLabel>Current Evidence</SectionLabel>
      <div className="grid gap-4 border-b border-neutral-50 px-6 py-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] leading-[1.3] font-semibold uppercase tracking-[0.05em] text-neutral-500">Selected capture</p>
              <p className="mt-1 text-[20px] leading-[1.3] font-semibold text-neutral-800">{currentEvidence.label}</p>
              <p className="text-[14px] leading-[1.5] text-neutral-500">{currentEvidence.sublabel}</p>
            </div>
            <div className="flex gap-2">
              <button className="flex h-10 items-center gap-1.5 rounded-[4px] border border-neutral-200 bg-white px-4 text-[14px] font-semibold text-neutral-700 transition-all duration-200 [transition-timing-function:var(--ease-snappy)] hover:-translate-y-px hover:border-[var(--primary-main)] hover:text-[var(--primary-main)] hover:shadow-[0_0_20px_var(--primary-glow)] active:scale-[0.98]">
                <Download className="h-3 w-3" />
                HD Crop
              </button>
              <button className="flex h-10 items-center gap-1.5 rounded-[4px] border border-neutral-200 bg-white px-4 text-[14px] font-semibold text-neutral-700 transition-all duration-200 [transition-timing-function:var(--ease-snappy)] hover:-translate-y-px hover:border-[var(--primary-main)] hover:text-[var(--primary-main)] hover:shadow-[0_0_20px_var(--primary-glow)] active:scale-[0.98]">
                <Eye className="h-3 w-3" />
                Full Frame
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Frame", value: currentEvidence.frame, mono: true },
              { label: "In-frame duration", value: currentEvidence.duration, mono: true },
              { label: terminology.eventLabel, value: currentEvidence.label },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[12px] leading-[1.3] uppercase tracking-[0.05em] text-neutral-400">{item.label}</p>
                <p className={cn("mt-1 text-[14px] leading-[1.5] font-semibold text-neutral-800", item.mono && "font-data tabular-nums")}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-neutral-200 bg-white p-6">
          <p className="text-[12px] leading-[1.3] font-semibold uppercase tracking-[0.05em] text-neutral-500">Recognition summary</p>
          <div className="mt-3 space-y-3">
            {entity.stats.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 border-b border-neutral-100 pb-2 last:border-b-0 last:pb-0">
                <span className="text-[14px] leading-[1.5] text-neutral-500">{item.label}</span>
                <span className={cn("text-[14px] leading-[1.5] font-semibold text-neutral-900", item.mono && "font-data tabular-nums")}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionLabel>{evidence.length} Captures In Sequence</SectionLabel>
      <div className="border-b border-neutral-50 px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          {evidence.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-[4px] border px-3 text-[14px] font-semibold transition-all duration-200 [transition-timing-function:var(--ease-snappy)]",
                index === currentIndex
                  ? "border-[#00775B] bg-[#E5FFF9] text-[#00775B]"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
              )}
            >
              <span className="font-data tabular-nums">{index + 1}</span>
              <span>{item.label}</span>
                <span className="font-data tabular-nums text-[12px] text-neutral-400">{item.confidence}%</span>
              </button>
            ))}
          </div>
      </div>

      <SectionLabel>Linked Alerts & Actions</SectionLabel>
      <div className="space-y-2 px-6 py-4 pb-8">
        {entity.alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              "flex items-start gap-3 rounded-md border p-4",
              alert.severity === "HIGH" ? "border-red-200 bg-red-50" :
              alert.severity === "MEDIUM" ? "border-amber-200 bg-amber-50" :
              "border-neutral-200 bg-neutral-50"
            )}
          >
            <AlertTriangle className={cn(
              "mt-0.5 h-4 w-4 shrink-0",
              alert.severity === "HIGH" ? "text-red-600" :
              alert.severity === "MEDIUM" ? "text-amber-600" : "text-neutral-500"
            )} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[14px] leading-[1.5] font-semibold text-neutral-800">{alert.label}</span>
                {alert.status === "ACTIVE" && (
                  <span className="inline-flex h-8 items-center rounded-[4px] border border-red-200 bg-white px-2.5 text-[12px] leading-[1.3] font-semibold uppercase tracking-[0.05em] text-red-600">
                    Active
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-[12px] leading-[1.3] text-neutral-500">
                <span className="font-data tabular-nums">{alert.timestamp}</span>
                <span>{alert.status}</span>
              </div>
            </div>
            <button className="flex h-10 items-center gap-1.5 rounded-[4px] border border-neutral-200 bg-white px-4 text-[14px] font-semibold text-neutral-700 transition-all duration-200 [transition-timing-function:var(--ease-snappy)] hover:-translate-y-px hover:border-[var(--primary-main)] hover:text-[var(--primary-main)] hover:shadow-[0_0_20px_var(--primary-glow)] active:scale-[0.98]">
              <Ban className="h-3 w-3" />
              Acknowledge
            </button>
          </div>
        ))}
      </div>
    </SlidePanel>
  );
};
