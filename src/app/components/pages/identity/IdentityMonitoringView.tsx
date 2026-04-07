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
    <LiveStatusBar terminology={terminology} />
    <BlacklistUnknownPanel terminology={terminology} onEntityClick={onEntityClick} />
    <LiveEventFeedPanel terminology={terminology} onEntityClick={onEntityClick} />
    <ZoneActivityPanel terminology={terminology} onCameraClick={onCameraClick} onEntityClick={onEntityClick} />
    <UnknownTrackerPanel terminology={terminology} onTrackerClick={() => onEntityClick?.("unknown")} />
    <CrossCameraPanel terminology={terminology} onJourneyClick={onJourneyClick} />
    {!terminology.isLPR && <VIPTickerPanel terminology={terminology} />}
    {terminology.isLPR && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PlateAccuracyPanel terminology={terminology} />
        <VehicleAuthPanel terminology={terminology} />
      </div>
    )}
  </div>
);
