import { ExecutiveSummaryBar } from "./components/director/ExecutiveSummaryBar";
import { SixMonthTrendChart } from "./components/director/SixMonthTrendChart";
import { AccessRiskSection } from "./components/director/AccessRiskSection";
import { CoverageEnrollmentSection } from "./components/director/CoverageEnrollmentSection";
import { ScorecardSection } from "./components/director/ScorecardSection";
import type { IdentityTerminology } from "./data/types";
import type { IdentityAppOption } from "../IdentityAnalytics";

interface Props {
  terminology: IdentityTerminology;
  timeRange: string;
  activeApp: IdentityAppOption;
}

export const IdentityDirectorView = ({ terminology, timeRange: _timeRange, activeApp: _activeApp }: Props) => (
  <div className="flex min-h-full flex-col gap-8 bg-neutral-50">
    <ExecutiveSummaryBar terminology={terminology} />
    <div className="grid gap-6 xl:grid-cols-[1.25fr,0.95fr]">
      <SixMonthTrendChart terminology={terminology} />
      <AccessRiskSection terminology={terminology} />
    </div>
    <div className="grid gap-6 xl:grid-cols-[0.95fr,1.25fr]">
      <CoverageEnrollmentSection terminology={terminology} />
      <ScorecardSection terminology={terminology} />
    </div>
  </div>
);
