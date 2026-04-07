import { LiveStatusBar } from "./components/monitoring/LiveStatusBar";
import { PrimaryKPIRow } from "./components/monitoring/PrimaryKPIRow";
import { ComplianceOverviewRow } from "./components/monitoring/ComplianceOverviewRow";
import { ViolationInsightsPanel } from "./components/monitoring/ViolationInsightsPanel";
import { RepeatViolatorsTable } from "./components/monitoring/RepeatViolatorsTable";
import { HourlyCompliancePanel } from "./components/monitoring/HourlyCompliancePanel";
import { TimeToCompliancePanel } from "./components/monitoring/TimeToCompliancePanel";
import { ZoneCardsPanel } from "./components/monitoring/ZoneCardsPanel";
import { AlertFeedPanel } from "./components/monitoring/AlertFeedPanel";
import { BatchTickerPanel } from "./components/monitoring/BatchTickerPanel";
import { LIVE_STATUS } from "./data/mockData";
import type { QualityTerminology } from "./data/types";

interface Props {
  terminology: QualityTerminology;
  timeRange: string;
}

export const MonitoringView = ({ terminology, timeRange: _timeRange }: Props) => {
  return (
    <div className="flex flex-col gap-3 bg-neutral-50 min-h-full">
      {/* 1. Pinned live status bar */}
      <LiveStatusBar status={LIVE_STATUS} terminology={terminology} />

      {/* 2. Primary KPIs — Total Inspected / Defect Count / Rate / Density */}
      <PrimaryKPIRow terminology={terminology} />

      {/* 3. Compliant vs Non-Compliant + Compliance Rate trend (2-col row) */}
      <ComplianceOverviewRow terminology={terminology} />

      {/* 4. Violation type breakdown + count vs time (combined panel) */}
      <ViolationInsightsPanel terminology={terminology} />

      {/* 5. Repeat violators — full-width table, clickable rows */}
      <RepeatViolatorsTable terminology={terminology} />

      {/* 6. Hourly compliance line chart + Time to Compliance histogram (2-col row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <HourlyCompliancePanel terminology={terminology} />
        {terminology.isDefectApp
          ? <BatchTickerPanel terminology={terminology} />
          : <TimeToCompliancePanel terminology={terminology} />}
      </div>

      {/* 7. Zone overview table — click row for zone detail panel */}
      <ZoneCardsPanel terminology={terminology} />

      {/* 8. Alert feed — styled table matching Zone/Volume analytics */}
      <AlertFeedPanel terminology={terminology} />
    </div>
  );
};
