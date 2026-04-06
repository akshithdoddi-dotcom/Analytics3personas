import { useState } from "react";
import type { Persona } from "@/app/components/dashboard/PersonaSwitcher";
import { IdentityHeader } from "./identity/IdentityHeader";
import { IdentityMonitoringView } from "./identity/IdentityMonitoringView";
import { IdentityManagerView } from "./identity/IdentityManagerView";
import { IdentityDirectorView } from "./identity/IdentityDirectorView";

// ─── Terminology ──────────────────────────────────────────────────────────────

export interface IdentityTerminology {
  appLabel:        string; // "Facial Recognition" | "License Plate Recognition"
  entityLabel:     string; // "Individual" | "Vehicle"
  identLabel:      string; // "Face Match" | "Plate Read"
  authorizedLabel: string; // "Whitelist" | "Authorized"
  blacklistLabel:  string; // "Blacklist" | "Stolen"
  unknownLabel:    string; // "Unknown Face" | "Unregistered Plate"
  matchScoreLabel: string; // "Face Similarity" | "OCR Confidence"
  isLPR:           boolean;
}

// Derived from the selected app ID
function getTerminology(appId: string): IdentityTerminology {
  const isLPR = appId.startsWith("lpr");
  if (isLPR) {
    return {
      appLabel:        "License Plate Recognition",
      entityLabel:     "Vehicle",
      identLabel:      "Plate Read",
      authorizedLabel: "Authorized",
      blacklistLabel:  "Stolen",
      unknownLabel:    "Unregistered Plate",
      matchScoreLabel: "OCR Confidence",
      isLPR:           true,
    };
  }
  return {
    appLabel:        "Facial Recognition",
    entityLabel:     "Individual",
    identLabel:      "Face Match",
    authorizedLabel: "Whitelist",
    blacklistLabel:  "Blacklist",
    unknownLabel:    "Unknown Face",
    matchScoreLabel: "Face Similarity",
    isLPR:           false,
  };
}

// ─── Default time ranges per persona ─────────────────────────────────────────

const DEFAULT_TIME_RANGE: Record<Persona, string> = {
  monitoring: "1h",
  manager:    "Today",
  director:   "This Month",
};

// ─── Main component ───────────────────────────────────────────────────────────

interface IdentityAnalyticsProps {
  persona: Persona;
}

export const IdentityAnalytics = ({ persona }: IdentityAnalyticsProps) => {
  const [activeAppId, setActiveAppId] = useState("facial-hq");
  const [timeRange, setTimeRange]     = useState(DEFAULT_TIME_RANGE[persona]);

  const terminology = getTerminology(activeAppId);

  return (
    <div className="p-4 md:p-6">
      <IdentityHeader
        persona={persona}
        terminology={terminology}
        activeAppId={activeAppId}
        onAppChange={setActiveAppId}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />

      {persona === "monitoring" && (
        <IdentityMonitoringView terminology={terminology} timeRange={timeRange} />
      )}

      {persona === "manager" && (
        <IdentityManagerView terminology={terminology} timeRange={timeRange} />
      )}

      {persona === "director" && (
        <IdentityDirectorView terminology={terminology} timeRange={timeRange} />
      )}
    </div>
  );
};
