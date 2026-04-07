import { LiveSummaryStrip } from "./components/manager/LiveSummaryStrip";
import { KPISummaryRow } from "./components/manager/KPISummaryRow";
import { VolumeSection } from "./components/manager/VolumeSection";
import { ListMembershipSection } from "./components/manager/ListMembershipSection";
import { EntryPointTable } from "./components/manager/EntryPointTable";
import { UnknownSummarySection } from "./components/manager/UnknownSummarySection";
import { ConfidenceHealthSection } from "./components/manager/ConfidenceHealthSection";
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
  <div className="flex min-h-full flex-col gap-6 bg-neutral-50">
    <LiveSummaryStrip terminology={terminology} />
    <KPISummaryRow terminology={terminology} />
    <div className="grid gap-6 xl:grid-cols-[1.35fr,0.95fr]">
      <VolumeSection terminology={terminology} timeRange={timeRange} />
      <ListMembershipSection terminology={terminology} />
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.45fr,0.9fr]">
      <EntryPointTable terminology={terminology} />
      <UnknownSummarySection terminology={terminology} />
    </div>
    <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
      <ConfidenceHealthSection terminology={terminology} />
      <IncidentSummarySection terminology={terminology} />
    </div>
    {terminology.isLPR && <LPRVehicleSection terminology={terminology} />}
  </div>
);
