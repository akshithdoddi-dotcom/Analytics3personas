import { useState, useEffect } from "react";
import { ALL_INCIDENTS, Incident, SEVERITY_DISTRIBUTION, INCIDENT_TIMELINE, RESOLVED_INCIDENTS_LIST, SLA_DISTRIBUTION_DATA } from "@/app/data/mockData";
import { IncidentCard } from "@/app/components/dashboard/IncidentCard";
import { Persona } from "../dashboard/PersonaSwitcher";
import { ShieldCheck, AlertTriangle, TrendingDown, Clock, Activity, CheckCircle2, History, Video, VideoOff, Timer } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, BarChart, Bar } from "recharts";
import { AnalyticsHeader } from "./AnalyticsHeader";
import { MonitoringStaffTriageDashboard } from "./MonitoringStaffTriageDashboard";
import { AnalyticsIncidentCard, AnalyticsIncident } from "./AnalyticsIncidentCard";
import { ChevronDown } from "lucide-react";

function useGridColumns() {
  const [columns, setColumns] = useState(4); 

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Adjust columns based on sidebar presence (approx 250px)
      if (width >= 1536) setColumns(4); 
      else if (width >= 1280) setColumns(3); 
      else if (width >= 1024) setColumns(2); 
      else if (width >= 640) setColumns(1); 
      else setColumns(1);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return columns;
}

export const IncidentAnalytics = ({ persona }: { persona: Persona }) => {
  const gridColumns = useGridColumns();
  const [sortBy, setSortBy] = useState<"severity" | "time" | "confidence">("severity");
  const [selectedIncidents, setSelectedIncidents] = useState<string[]>([]);
  const [filterZone, setFilterZone] = useState<string>("all");
  const [filterApplication, setFilterApplication] = useState<string>("all");
  const [groupByType, setGroupByType] = useState(false);

  // Generate enhanced incidents for analytics
  const generateAnalyticsIncidents = (): AnalyticsIncident[] => {
    return ALL_INCIDENTS.slice(0, 12).map((incident, index) => ({
      ...incident,
      confidence: Math.floor(Math.random() * 25) + 75, // 75-100%
      targetType: 
        incident.application.includes("Safety") || incident.application.includes("Behavioral") ? "person" :
        incident.application.includes("Traffic") ? "vehicle" :
        incident.application.includes("Fire") ? "environmental" : "object",
      bboxAreaGrowth: incident.title.includes("Fire") || incident.title.includes("Flood") ? 
                      [10, 15, 25, 40, 60, 85] : 
                      incident.title.includes("Gas") ? [5, 8, 15, 28, 45, 62] : undefined,
      spreadRate: incident.title.includes("Fire") ? 145 : 
                  incident.title.includes("Flood") ? 78 : 
                  incident.title.includes("Gas") ? 92 : undefined,
      responseLatency: Math.floor(Math.random() * 120) + 30, // 30-150s
      validationStatus: null,
      acknowledged: Math.random() > 0.5,
      acknowledgedAt: Math.random() > 0.5 ? "2m ago" : undefined,
    }));
  };

  const analyticsIncidents = generateAnalyticsIncidents();

  // Extract unique zones and applications
  const uniqueZones = ["all", ...Array.from(new Set(ALL_INCIDENTS.map(i => i.location)))];
  const uniqueApplications = ["all", ...Array.from(new Set(ALL_INCIDENTS.map(i => i.application)))];

  // Filter incidents
  const filteredIncidents = analyticsIncidents.filter(incident => {
    const matchesZone = filterZone === "all" || incident.location === filterZone;
    const matchesApp = filterApplication === "all" || incident.application === filterApplication;
    return matchesZone && matchesApp;
  });

  // Group incidents by type if enabled
  const groupedIncidents = groupByType 
    ? filteredIncidents.reduce((acc, incident) => {
        const existing = acc.find(g => g.title === incident.title);
        if (existing) {
          existing.count++;
          existing.incidents.push(incident);
        } else {
          acc.push({ title: incident.title, count: 1, incidents: [incident], severity: incident.severity });
        }
        return acc;
      }, [] as Array<{ title: string; count: number; incidents: AnalyticsIncident[]; severity: string }>)
    : null;

  // Sort incidents
  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    if (sortBy === "severity") {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4, resolved: 5 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    } else if (sortBy === "confidence") {
      return b.confidence - a.confidence;
    }
    return 0; // time sorting would need actual timestamps
  });

  // System Throughput
  const totalCameras = 42;
  const camerasOnline = 38;
  const camerasOffline = totalCameras - camerasOnline;

  // Triage counter
  const criticalCount = analyticsIncidents.filter(i => i.severity === "critical").length;
  const highCount = analyticsIncidents.filter(i => i.severity === "high").length;
  const totalCount = analyticsIncidents.length;

  // Toggle incident selection
  const toggleIncidentSelection = (incidentId: string) => {
    setSelectedIncidents(prev => 
      prev.includes(incidentId) 
        ? prev.filter(id => id !== incidentId)
        : [...prev, incidentId]
    );
  };

  // Get severity configuration
  const getSeverityConfig = (severity: string) => {
    const config: Record<string, { brightColor: string; darkColor: string }> = {
      critical: { brightColor: '#E7000B', darkColor: '#B91C1C' },
      high: { brightColor: '#EA580C', darkColor: '#991B1B' },
      medium: { brightColor: '#E19A04', darkColor: '#7C2D12' },
      low: { brightColor: '#2B7FFF', darkColor: '#744210' },
      info: { brightColor: '#64748B', darkColor: '#3B82F6' },
      resolved: { brightColor: '#00A63E', darkColor: '#16A34A' },
    };
    return config[severity] || config.info;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AnalyticsHeader title="Incident Analytics" icon={AlertTriangle} />

      {/* Monitoring Staff View: Triage & Action Dashboard */}
      {persona === "monitoring" && (
        <MonitoringStaffTriageDashboard />
      )}

      {/* Manager View: Severity Donut & SLA Histogram */}
      {persona === "manager" && (
        <>
          {/* System Throughput Header */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* System Throughput */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50">
                  <Video className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">System Throughput</div>
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-2xl font-data font-bold tabular-nums",
                      camerasOffline > 5 ? "text-red-600" : "text-neutral-900"
                    )}>
                      {camerasOnline}
                    </span>
                    <span className="text-sm font-data tabular-nums text-neutral-400">/{totalCameras}</span>
                  </div>
                  {camerasOffline > 0 && (
                    <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                      <VideoOff className="w-3 h-3" />
                      {camerasOffline} offline
                    </div>
                  )}
                </div>
              </div>

              {/* Triage Counter */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-50">
                  <AlertTriangle className="w-5 h-5 text-neutral-600" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Active Incidents</div>
                  <div className="text-2xl font-mono font-bold text-neutral-900">{totalCount}</div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-red-600 font-bold">{criticalCount} Critical</span>
                    <span className="text-orange-600 font-bold">{highCount} High</span>
                  </div>
                </div>
              </div>

              {/* MTTA */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50">
                  <Timer className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">MTTA</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-mono font-bold text-neutral-900">123</span>
                    <span className="text-sm font-mono text-neutral-400">sec</span>
                  </div>
                  <div className="text-[10px] text-neutral-500">Mean Time to Ack</div>
                </div>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center justify-end gap-2">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Sort By:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSortBy("severity")}
                    className={cn(
                      "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all",
                      sortBy === "severity"
                        ? "bg-[#00775B] text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    )}
                  >
                    Severity
                  </button>
                  <button
                    onClick={() => setSortBy("confidence")}
                    className={cn(
                      "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all",
                      sortBy === "confidence"
                        ? "bg-[#00775B] text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    )}
                  >
                    Confidence
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Cards Grid */}
          <div className="space-y-3">
            {/* Filter Controls */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700">Incident Review Queue</h3>
              
              <div className="flex items-center gap-3 flex-wrap">
                {/* Zone Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Zone:</span>
                  <select
                    value={filterZone}
                    onChange={(e) => setFilterZone(e.target.value)}
                    className="px-3 py-1.5 text-xs font-medium border border-neutral-200 rounded bg-white text-neutral-700 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#00775B]/20"
                  >
                    {uniqueZones.map(zone => (
                      <option key={zone} value={zone}>
                        {zone === "all" ? "All Zones" : zone}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Application Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Application:</span>
                  <select
                    value={filterApplication}
                    onChange={(e) => setFilterApplication(e.target.value)}
                    className="px-3 py-1.5 text-xs font-medium border border-neutral-200 rounded bg-white text-neutral-700 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#00775B]/20"
                  >
                    {uniqueApplications.map(app => (
                      <option key={app} value={app}>
                        {app === "all" ? "All Applications" : app}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Group by Type Toggle */}
                <button
                  onClick={() => setGroupByType(!groupByType)}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all border-2",
                    groupByType
                      ? "bg-[#00775B] text-white border-[#00775B]"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-[#00775B]"
                  )}
                >
                  {groupByType ? "✓ Grouped" : "Group by Type"}
                </button>
              </div>
            </div>

            {/* Grouped View */}
            {groupByType && groupedIncidents ? (
              <div className="space-y-2">
                {groupedIncidents.map((group, idx) => (
                  <div key={idx} className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                    {/* Group Header */}
                    <div 
                      className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
                      onClick={() => {
                        // Toggle group expansion
                        const elem = document.getElementById(`group-${idx}`);
                        if (elem) {
                          elem.classList.toggle('hidden');
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-1 h-6 rounded-full"
                          style={{ backgroundColor: getSeverityConfig(group.severity).brightColor }}
                        />
                        <div>
                          <h4 className="text-sm font-bold text-neutral-900">{group.title}</h4>
                          <p className="text-xs text-neutral-500">
                            {group.count} {group.count === 1 ? 'incident' : 'incidents'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-500">
                          Click to expand
                        </span>
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      </div>
                    </div>

                    {/* Group Content */}
                    <div id={`group-${idx}`} className="hidden border-t border-neutral-200 p-4 bg-neutral-50">
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                        {group.incidents.map((incident) => (
                          <AnalyticsIncidentCard 
                            key={incident.incidentId} 
                            incident={incident}
                            selected={selectedIncidents.includes(incident.incidentId)}
                            onSelect={toggleIncidentSelection}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Standard Grid View */
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedIncidents.slice(0, 6).map((incident) => (
                  <AnalyticsIncidentCard 
                    key={incident.incidentId} 
                    incident={incident}
                    compact={incident.severity === "low" || incident.severity === "info"}
                    selected={selectedIncidents.includes(incident.incidentId)}
                    onSelect={toggleIncidentSelection}
                  />
                ))}
              </div>
            )}

            {sortedIncidents.length > 6 && !groupByType && (
              <div className="text-center pt-2">
                <button className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#00775B] hover:text-[#009e78] transition-colors">
                  View All {sortedIncidents.length} Incidents →
                </button>
              </div>
            )}
          </div>

          {/* Original Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Severity Distribution Donut */}
            <div className="bg-white p-6 rounded-md border border-neutral-200 shadow-sm flex flex-col items-center justify-center relative min-h-[320px]">
               <h3 className="absolute top-6 left-6 text-sm font-bold uppercase tracking-wider text-neutral-800">Severity Distribution</h3>
               
               <div className="h-64 w-full mt-8">
                 <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                   <PieChart>
                     <Pie
                       data={SEVERITY_DISTRIBUTION}
                       cx="50%"
                       cy="50%"
                       innerRadius={70}
                       outerRadius={90}
                       paddingAngle={4}
                       dataKey="value"
                       stroke="none"
                     >
                       {SEVERITY_DISTRIBUTION.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '4px' }} />
                   </PieChart>
                 </ResponsiveContainer>
                 
                 {/* Center Metric */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-8">
                    <span className="text-4xl font-mono font-bold text-neutral-900">{ALL_INCIDENTS.length}</span>
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Total Incidents</span>
                 </div>
               </div>
    
               <div className="flex flex-wrap gap-4 mt-4 justify-center text-xs">
                  {SEVERITY_DISTRIBUTION.map((d, i) => (
                     <div key={i} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                        <span className="text-neutral-600 font-medium uppercase tracking-wide text-[10px]">{d.name}</span>
                        <span className="font-mono text-neutral-400 ml-1">{d.value}</span>
                     </div>
                  ))}
               </div>
            </div>
    
            {/* SLA Response Histogram */}
            <div className="bg-white p-6 rounded-md border border-neutral-200 shadow-sm flex flex-col min-h-[320px]">
               <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 mb-6 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#00775B]" />
                  Response SLA Distribution
               </h3>
               
               <div className="flex-1 w-full min-h-[200px] min-w-0">
                 <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                   <BarChart data={SLA_DISTRIBUTION_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <XAxis dataKey="range" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                         cursor={{ fill: 'transparent' }}
                         contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '10px' }}
                      />
                      <Bar dataKey="count" fill="#00775B" radius={[4, 4, 0, 0]} barSize={50} isAnimationActive={false}>
                         {SLA_DISTRIBUTION_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.range === "> 5m" ? "#EF4444" : "#00775B"} />
                         ))}
                      </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
               
               <div className="mt-4 pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between text-xs">
                     <span className="font-bold text-neutral-500">Avg Response Time</span>
                     <span className="font-mono font-bold text-[#00775B]">42s</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-1.5 rounded-full mt-2 overflow-hidden">
                     <div className="h-full bg-[#00775B] w-[85%]" />
                  </div>
               </div>
            </div>
          </div>
        </>
      )}

      {/* Director View: Risk Exposure (Existing) */}
      {persona === "director" && (
        <>
          {/* System Throughput Header - Condensed for Director */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Active Incidents */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-50">
                  <AlertTriangle className="w-5 h-5 text-neutral-600" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Total Incidents</div>
                  <div className="text-2xl font-mono font-bold text-neutral-900">{totalCount}</div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-red-600 font-bold">{criticalCount} Critical</span>
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">System Health</div>
                  <div className="text-2xl font-mono font-bold text-green-600">
                    {Math.floor((camerasOnline / totalCameras) * 100)}%
                  </div>
                  <div className="text-[10px] text-neutral-500">{camerasOnline}/{totalCameras} cameras</div>
                </div>
              </div>

              {/* Response Efficiency */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#E5FFF9]">
                  <CheckCircle2 className="w-5 h-5 text-[#00775B]" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Response Efficiency</div>
                  <div className="text-2xl font-mono font-bold text-[#00775B]">94%</div>
                  <div className="text-[10px] text-neutral-500">Within SLA</div>
                </div>
              </div>
            </div>
          </div>

          {/* High-Priority Incidents Only */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700">Critical & High Priority Review</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sortedIncidents
                .filter(i => i.severity === "critical" || i.severity === "high")
                .slice(0, 4)
                .map((incident) => (
                  <AnalyticsIncidentCard 
                    key={incident.incidentId} 
                    incident={incident}
                  />
                ))}
            </div>
          </div>

          {/* Original Risk Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white p-6 rounded-md border border-neutral-200 shadow-sm flex flex-col justify-between h-64">
               <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Total Liability Reduction</h3>
                  <span className="text-5xl font-mono font-bold text-[#00775B] tracking-tight">$4.2M</span>
                  <p className="text-xs text-neutral-400 mt-2">Estimated savings from prevented incidents (YTD)</p>
               </div>
               
               <div className="space-y-3 mt-4">
                  <div className="flex justify-between text-xs font-bold text-neutral-600">
                     <span>Theft Prevention</span>
                     <span className="font-mono">$2.1M</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                     <div className="h-full bg-[#00775B] w-[50%]" />
                  </div>
                  
                  <div className="flex justify-between text-xs font-bold text-neutral-600">
                     <span>Safety Compliance</span>
                     <span className="font-mono">$1.5M</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                     <div className="h-full bg-[#00775B]/70 w-[35%]" />
                  </div>

                  <div className="flex justify-between text-xs font-bold text-neutral-600">
                     <span>Property Damage</span>
                     <span className="font-mono">$0.6M</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                     <div className="h-full bg-[#00775B]/40 w-[15%]" />
                  </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-md border border-neutral-200 shadow-sm flex flex-col justify-between h-64">
               <div>
                  <div className="flex justify-between items-start">
                     <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Days Since Major Breach</h3>
                     <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 uppercase">Record High</span>
                  </div>
                  <span className="text-6xl font-mono font-bold text-neutral-900 tracking-tighter">142</span>
                  <p className="text-xs text-neutral-400 mt-2">Previous record: 89 days</p>
               </div>
               
               <div className="mt-auto bg-[#E5FFF9] rounded p-3 border border-[#00956D]/20">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#00775B] mb-1">
                     <ShieldCheck className="w-4 h-4" />
                     <span>System Integrity High</span>
                  </div>
                  <p className="text-[10px] text-neutral-600 leading-relaxed">
                     AI-driven proactive threat detection has reduced major security breaches by <span className="font-bold">94%</span> YoY.
                  </p>
               </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};