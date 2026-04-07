import { LiveStatusBar } from "./components/monitoring/LiveStatusBar";
import { BlacklistUnknownPanel } from "./components/monitoring/BlacklistUnknownPanel";
import { LiveEventFeedPanel } from "./components/monitoring/LiveEventFeedPanel";
import { ZoneActivityPanel } from "./components/monitoring/ZoneActivityPanel";
import { UnknownTrackerPanel } from "./components/monitoring/UnknownTrackerPanel";
import { CrossCameraPanel } from "./components/monitoring/CrossCameraPanel";
import { VIPTickerPanel } from "./components/monitoring/VIPTickerPanel";
import { PlateAccuracyPanel } from "./components/monitoring/PlateAccuracyPanel";
import { VehicleAuthPanel } from "./components/monitoring/VehicleAuthPanel";
import type { IdentityTerminology } from "./data/types";
import type { IdentityAppOption } from "../IdentityAnalytics";

interface Props {
  terminology: IdentityTerminology;
  timeRange: string;
  activeApp: IdentityAppOption;
  onEntityClick?: (type: "matched" | "unknown" | "blacklist") => void;
  onCameraClick?: (cameraId?: string) => void;
  onJourneyClick?: () => void;
}

export const IdentityMonitoringView = ({
  terminology,
  timeRange: _timeRange,
  activeApp: _activeApp,
  onEntityClick,
  onCameraClick,
  onJourneyClick,
}: Props) => (
  <div className="flex flex-col gap-3">

    {/* ── 1. Always-visible system vitals bar ── */}
    <LiveStatusBar terminology={terminology} />

    {/* ── 2. Threat Overview — 3 clickable counters (Blacklist / Unknown / Denied) ── */}
    <BlacklistUnknownPanel
      terminology={terminology}
      onEntityClick={onEntityClick}
    />

    {/* ── 3. Primary operational split: Security Triage Feed 60% + Zone Activity 40% ── */}
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-start">
      <div className="lg:col-span-3">
        <LiveEventFeedPanel
          terminology={terminology}
          onEntityClick={onEntityClick}
        />
      </div>
      <div className="lg:col-span-2">
        <ZoneActivityPanel
          terminology={terminology}
          onCameraClick={onCameraClick}
          onEntityClick={onEntityClick}
        />
      </div>
    </div>

    {/* ── 4. Unknown Person Tracker — elevated to primary action panel ── */}
    <UnknownTrackerPanel
      terminology={terminology}
      onTrackerClick={() => onEntityClick?.("unknown")}
    />

    {/* ── 5. Movement Trail (renamed from Cross-Camera Tracking) ── */}
    <CrossCameraPanel
      terminology={terminology}
      onJourneyClick={onJourneyClick}
    />

    {/* ── 6. VIP Detections — FR only, collapsible secondary ── */}
    {!terminology.isLPR && (
      <VIPTickerPanel terminology={terminology} />
    )}

    {/* ── 7. LPR-specific panels ── */}
    {terminology.isLPR && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PlateAccuracyPanel terminology={terminology} />
        <VehicleAuthPanel terminology={terminology} />
      </div>
    )}

    {/*
      REMOVED FROM MONITORING VIEW:
      – IdentRatePanel:       Rate is in LiveStatusBar. Sparkline chart is a manager/engineering metric.
      – ListMembershipPanel:  Historical composition (Whitelist/VIP/Unknown breakdown). Manager metric.
      – ConfidenceHistPanel:  Camera quality histogram. Camera health shown as degraded camera count in status bar.
      – AccessDeniedPanel:    Total denied count integrated into Threat Overview. Bar chart is for manager view.
    */}
  </div>
);
