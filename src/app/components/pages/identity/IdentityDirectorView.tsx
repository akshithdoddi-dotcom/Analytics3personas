import { ExecutiveSummaryBar } from "./components/director/ExecutiveSummaryBar";
import { SixMonthTrendChart } from "./components/director/SixMonthTrendChart";
import { AccessRiskSection } from "./components/director/AccessRiskSection";
import { ScorecardSection } from "./components/director/ScorecardSection";
import type { IdentityTerminology } from "./data/types";
import type { IdentityAppOption } from "../IdentityAnalytics";

interface Props {
  terminology: IdentityTerminology;
  timeRange: string;
  activeApp: IdentityAppOption;
}

export const IdentityDirectorView = ({ terminology, timeRange: _timeRange, activeApp: _activeApp }: Props) => (
  <div className="flex min-h-full flex-col gap-4 bg-neutral-50">
    <ExecutiveSummaryBar terminology={terminology} />
    <SixMonthTrendChart terminology={terminology} />
    <AccessRiskSection terminology={terminology} />
    <ScorecardSection terminology={terminology} />
  </div>
);
