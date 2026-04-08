import { KPISummaryRow } from "./components/manager/KPISummaryRow";
import { VolumeSection } from "./components/manager/VolumeSection";
import { EntryPointTable } from "./components/manager/EntryPointTable";
import { UnknownSummarySection } from "./components/manager/UnknownSummarySection";
import { IncidentSummarySection } from "./components/manager/IncidentSummarySection";
import { LPRVehicleSection } from "./components/manager/LPRVehicleSection";
import type { IdentityTerminology } from "./data/types";
import type { IdentityAppOption } from "../IdentityAnalytics";

interface Props {
  terminology: IdentityTerminology;
  timeRange: string;
  activeApp: IdentityAppOption;
}

export const IdentityManagerView = ({ terminology, timeRange, activeApp: _activeApp }: Props) => (
  <div className="flex min-h-full flex-col gap-3 bg-neutral-50">
    <KPISummaryRow terminology={terminology} />
    <VolumeSection terminology={terminology} timeRange={timeRange} />
    <div className="grid gap-3 xl:grid-cols-[1.45fr,0.9fr]">
      <EntryPointTable terminology={terminology} />
      <UnknownSummarySection terminology={terminology} />
    </div>
    <IncidentSummarySection terminology={terminology} />
    {terminology.isLPR && <LPRVehicleSection terminology={terminology} />}
  </div>
);
