import { LiveSummaryStrip } from "./components/manager/LiveSummaryStrip";
import { KPISummaryRow } from "./components/manager/KPISummaryRow";
import { ComplianceTrendSection } from "./components/manager/ComplianceTrendSection";
import { ZonePerformanceTable } from "./components/manager/ZonePerformanceTable";
import { RepeatViolatorsSection } from "./components/manager/RepeatViolatorsSection";
import type { QualityTerminology } from "./data/types";

interface Props {
  terminology: QualityTerminology;
  timeRange: string;
}

export const ManagerView = ({ terminology, timeRange }: Props) => (
  <div className="flex flex-col gap-3 bg-neutral-50 min-h-full">
    <LiveSummaryStrip terminology={terminology} />
    <KPISummaryRow terminology={terminology} />
    <ComplianceTrendSection terminology={terminology} timeRange={timeRange} />
    <ZonePerformanceTable terminology={terminology} />
    <RepeatViolatorsSection terminology={terminology} />
  </div>
);
