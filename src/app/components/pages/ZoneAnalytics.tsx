import { useState, useRef, useEffect } from "react";
import { ZONE_CARDS, ZONE_VIOLATIONS_TICKER, ZoneCard as ZoneCardType, ZoneStatus } from "@/app/data/mockData";
import { Persona } from "../dashboard/PersonaSwitcher";
import { MapPin, Clock, Users, AlertTriangle, Camera, TrendingUp, Gauge, Shield, ArrowRight, Activity, Maximize2, BarChart3, PieChart, Calendar, Search, Check, ChevronDown, Bell, Eye, Ban, Settings } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell, PieChart as RechartsPieChart, Pie } from "recharts";
import { AnalyticsHeader } from "./AnalyticsHeader";
import { motion } from "motion/react";
import * as Dialog from "@radix-ui/react-dialog";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ZoneConfigurationModal } from "../zone-config/ZoneConfigurationModal";

// Utility: Calculate seconds ago for real-time timestamps
const getSecondsAgo = (zoneId: string): number => {
  // Simulate real-time updates based on zone ID
  const hash = zoneId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (hash % 60) + 1; // 1-60 seconds ago
};

// App Category Types
type AppCategory = "all" | "intrusion" | "queue" | "directional" | "mustering" | "parking" | "utilization";

interface AppFilter {
  id: AppCategory;
  label: string;
  icon: React.ReactNode;
}

const APP_FILTERS: AppFilter[] = [
  { id: "all", label: "All Applications", icon: <Maximize2 className="w-3.5 h-3.5" /> },
  { id: "intrusion", label: "Intrusion", icon: <Shield className="w-3.5 h-3.5" /> },
  { id: "queue", label: "Queue & Wait", icon: <Clock className="w-3.5 h-3.5" /> },
  { id: "directional", label: "Directional Flow", icon: <ArrowRight className="w-3.5 h-3.5" /> },
  { id: "mustering", label: "Mustering", icon: <Users className="w-3.5 h-3.5" /> },
  { id: "parking", label: "Parking", icon: <Activity className="w-3.5 h-3.5" /> },
  { id: "utilization", label: "Utilization", icon: <BarChart3 className="w-3.5 h-3.5" /> },
];

// Map zone app names to categories
const getZoneCategory = (app: string): AppCategory => {
  if (app.includes("Intrusion") || app.includes("Hazardous")) return "intrusion";
  if (app.includes("Queue") || app.includes("Wait")) return "queue";
  if (app.includes("Directional") || app.includes("Wrong-way")) return "directional";
  if (app.includes("Mustering") || app.includes("Overcrowding")) return "mustering";
  if (app.includes("Parking")) return "parking";
  if (app.includes("Utilization") || app.includes("Dwell") || app.includes("Heatmap")) return "utilization";
  return "all";
};

// Zone Multi-Select Filter Component
const ZoneMultiSelectFilter = ({ 
  selectedZones, 
  onZoneToggle,
  onClearAll 
}: { 
  selectedZones: Set<string>; 
  onZoneToggle: (zoneId: string) => void;
  onClearAll: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredZones = ZONE_CARDS.filter(zone => 
    zone.zoneName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 bg-white border rounded text-[11px] font-bold transition-all",
          selectedZones.size > 0 
            ? "border-[#00775B] text-[#00775B] bg-[#E5FFF9]" 
            : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
        )}
      >
        <MapPin className="w-3.5 h-3.5" />
        <span>
          {selectedZones.size === 0 
            ? "Filter by Zone" 
            : `${selectedZones.size} Zone${selectedZones.size > 1 ? 's' : ''} Selected`}
        </span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-1 w-80 max-w-[calc(100vw-2rem)] bg-white border border-neutral-200 rounded-md shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="p-3 border-b border-neutral-100">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search zones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded focus:border-[#00775B] focus:ring-1 focus:ring-[#00775B] outline-none"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
              {filteredZones.map((zone) => {
                const isSelected = selectedZones.has(zone.id);
                return (
                  <div
                    key={zone.id}
                    onClick={() => onZoneToggle(zone.id)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition-colors",
                      isSelected ? "bg-[#E5FFF9]" : "hover:bg-neutral-50"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                      isSelected 
                        ? "border-[#00775B] bg-[#00775B]" 
                        : "border-neutral-300"
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-neutral-800">{zone.zoneName}</div>
                      <div className="text-[9px] text-neutral-500">{zone.app}</div>
                    </div>
                    {zone.status === "critical" || zone.status === "violation" ? (
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="p-2 border-t border-neutral-100 bg-neutral-50 flex justify-between items-center">
              <button
                onClick={() => {
                  onClearAll();
                  setIsOpen(false);
                }}
                className="text-[10px] font-bold text-neutral-500 hover:text-neutral-800 uppercase tracking-wide"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-[#00775B] text-white text-[10px] font-bold uppercase rounded hover:bg-[#00956D]"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// App Filter Bar Component (Application Type Filters)
const AppFilterBar = ({ 
  selectedFilter, 
  onFilterChange,
  selectedZones,
  onZoneToggle,
  onClearZones
}: { 
  selectedFilter: AppCategory; 
  onFilterChange: (filter: AppCategory) => void;
  selectedZones: Set<string>;
  onZoneToggle: (zoneId: string) => void;
  onClearZones: () => void;
}) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-md p-3 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">Filter by Application Type</h3>
          <div className="flex gap-2 flex-wrap">
            {APP_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                  selectedFilter === filter.id
                    ? "bg-[#00775B] text-white shadow-md"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                {filter.icon}
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="shrink-0">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">Filter by Zone</h3>
          <ZoneMultiSelectFilter 
            selectedZones={selectedZones}
            onZoneToggle={onZoneToggle}
            onClearAll={onClearZones}
          />
        </div>
      </div>

      {(selectedFilter !== "all" || selectedZones.size > 0) && (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase text-neutral-400 tracking-wider">Active Filters:</span>
            {selectedFilter !== "all" && (
              <span className="px-2 py-1 bg-[#00775B] text-white text-[9px] font-bold uppercase rounded">
                {APP_FILTERS.find(f => f.id === selectedFilter)?.label}
              </span>
            )}
            {selectedZones.size > 0 && (
              <span className="px-2 py-1 bg-[#00775B] text-white text-[9px] font-bold uppercase rounded">
                {selectedZones.size} Zone{selectedZones.size > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              onFilterChange("all");
              onClearZones();
            }}
            className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[9px] font-bold uppercase rounded transition-colors flex items-center gap-1.5"
          >
            <span>Clear All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Adaptive Zone Card - changes based on app type
interface AdaptiveZoneCardProps {
  zone: ZoneCardType;
  onClick: () => void;
  scrollRef?: (el: HTMLDivElement | null) => void;
  isHighlighted?: boolean;
}

const AdaptiveZoneCard = ({ zone, onClick, scrollRef, isHighlighted }: AdaptiveZoneCardProps) => {
  const category = getZoneCategory(zone.app);
  const isViolation = zone.status === "critical" || zone.status === "violation";
  const secondsAgo = getSecondsAgo(zone.id);

  // Intrusion Card - Live Entry Log
  if (category === "intrusion") {
    const timeInArea = zone.lastIncident || "N/A";
    const hasHeatmap = zone.currentCount > 0 || zone.occupancy > 50;
    const objectType = zone.detectedObject || "Unknown";
    const targetCount = zone.currentCount;
    
    // Get object icon
    const getObjectIcon = () => {
      switch (objectType) {
        case "Person":
          return <Users className="w-4 h-4" />;
        case "Vehicle":
          return <Activity className="w-4 h-4" />;
        case "Animal":
          return <AlertTriangle className="w-4 h-4" />;
        default:
          return <Shield className="w-4 h-4" />;
      }
    };
    
    return (
      <motion.div
        ref={scrollRef}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "group rounded border p-3 hover:border-[#00775B]/50 transition-all cursor-pointer relative overflow-hidden flex flex-col min-h-[240px]",
          isHighlighted && "border-[#00775B] border-2 shadow-[0_0_12px_rgba(0,119,91,0.4)] ring-2 ring-[#00775B]/20",
          isViolation && !isHighlighted && "border-[#E7000B] bg-[#FFE5E7] shadow-[0_0_15px_rgba(231,0,11,0.5)] animate-pulse",
          !isViolation && !isHighlighted && "border-neutral-200 bg-white"
        )}
        onClick={onClick}
      >
        {/* Header: Zone Name + App */}
        <div className="flex items-start justify-between mb-2 shrink-0 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-[10px] font-bold uppercase truncate leading-tight",
              targetCount === 0 ? "text-neutral-500" : "text-neutral-800"
            )}>{zone.zoneName}</h3>
            <p className="text-[8px] text-neutral-500 truncate leading-tight">{zone.app}</p>
            {/* Live Pulse Indicator Only */}
            <div className="flex items-center gap-1 mt-0.5">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                targetCount > 0 ? "bg-[#E7000B]" : "bg-[#00775B]"
              )} />
              <p className={cn(
                "text-[7px] font-mono",
                targetCount > 0 ? "text-[#E7000B]" : "text-[#00775B]"
              )}>Live</p>
            </div>
          </div>
          {/* Target Classification Pill - Inline Top-Right */}
          {targetCount > 0 && (
            <div className={cn(
              "flex items-center gap-1 px-1.5 py-1 rounded text-[7px] font-bold uppercase shrink-0",
              isViolation ? "bg-[#E7000B] text-white" : "bg-[#00775B] text-white"
            )}>
              {getObjectIcon()}
              <span>{objectType}</span>
            </div>
          )}
        </div>

        {/* Main Metric - Threat Level Display */}
        <div className="text-center mb-2 shrink-0">
          <div className="text-[8px] text-neutral-500 uppercase tracking-wide mb-1">
            {targetCount === 0 ? "ZONE STATUS" : "THREAT LEVEL"}
          </div>
          <div className={cn(
            "font-mono font-bold leading-none",
            isViolation ? "text-[#E7000B]" : targetCount === 0 ? "text-[#00A63E]" : "text-[#00775B]"
          )}>
            {targetCount === 0 ? (
              <div className="text-xl text-[#00A63E]">✓ SECURED</div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                {/* Live Heartbeat Indicator */}
                <div className="w-2 h-2 bg-[#E7000B] rounded-full animate-pulse" />
                <span className="text-4xl">{String(targetCount).padStart(2, '0')}</span>
              </div>
            )}
          </div>
          {targetCount > 0 && (
            <div className="text-[9px] text-neutral-600 uppercase mt-1">
              Unauthorized {targetCount > 1 ? 'Targets' : 'Target'}
            </div>
          )}
        </div>

        {/* 2D Miniature Heatmap Thumbnail (Not Linear Grid) */}
        {hasHeatmap && (
          <div className="mb-2 shrink-0">
            <div className="text-[7px] text-neutral-400 uppercase mb-1">Spatial Occupancy Map (2D Zone View)</div>
            <div className={cn(
              "relative rounded p-2 border",
              targetCount > 0 ? "bg-neutral-900 border-neutral-700" : "bg-neutral-100 border-neutral-300"
            )}>
              {/* 2D Grid representing the physical zone */}
              <div className="grid grid-cols-10 gap-[2px]">
                {Array.from({ length: 30 }, (_, i) => {
                  const row = Math.floor(i / 10);
                  const col = i % 10;
                  // Simulate hotspot in a specific region
                  const isHotspot = targetCount > 0 && (
                    (row === 1 && col >= 6 && col <= 8) || // Back-right corner
                    (row === 2 && col >= 6 && col <= 8)
                  );
                  const color = targetCount > 0 
                    ? (isHotspot 
                        ? 'bg-[#E7000B]' 
                        : (zone.id.charCodeAt(0) + i) % 5 === 0 
                          ? 'bg-[#00775B]/30' 
                          : 'bg-neutral-700')
                    : 'bg-[#00A63E]'; // All green when clear
                  return <div key={i} className={cn("h-2 rounded-sm transition-colors", color)} />;
                })}
              </div>
              {/* Zone orientation labels */}
              <div className={cn(
                "flex justify-between mt-1 text-[6px] font-mono",
                targetCount > 0 ? "text-neutral-500" : "text-neutral-600"
              )}>
                <span>ENTRANCE</span>
                <span className={targetCount > 0 ? "text-[#E7000B] font-bold" : "text-[#00A63E] font-bold"}>
                  {targetCount > 0 ? "INTRUDER: BACK-RIGHT" : "✓ CLEAR"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Adaptive Forensic Metrics - Threat Intelligence Bar */}
        {targetCount > 0 && (
          <div className="bg-[#001E18] text-white rounded px-2 py-1.5 mb-2 shrink-0 border border-[#E7000B]/20">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col text-[8px]">
                <span className="text-neutral-400 mb-0.5">Time in Area</span>
                <span className="font-mono font-bold text-white">{timeInArea}</span>
              </div>
              <div className="flex flex-col text-[8px]">
                <span className="text-neutral-400 mb-0.5">Threat Status</span>
                <span className="font-mono font-bold text-[#E7000B] flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Live Thumbnail Preview on Hover - Shows when object detected (Intrusion Only) */}
        {targetCount > 0 && (
          <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[5] flex items-center justify-center p-4">
            <div className="relative w-full h-full rounded overflow-hidden border-2 border-[#00775B]">
              <ImageWithFallback 
                src={zone.image} 
                alt={`Live feed ${zone.zoneName}`}
                className="w-full h-full object-cover"
              />
              {/* AI Bounding Box Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 h-3/4 border-2 border-[#E7000B] rounded animate-pulse">
                  <div className="absolute -top-6 left-0 bg-[#E7000B] text-white text-[8px] font-mono px-2 py-1 rounded">
                    {objectType} Detected
                  </div>
                </div>
              </div>
              {/* Live Badge */}
              <div className="absolute top-2 left-2 bg-[#E7000B] text-white text-[8px] font-bold uppercase px-2 py-1 rounded flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            </div>
          </div>
        )}

        {/* Subtle Dark Gradient Overlay on Hover */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

        {/* Hover Action Buttons - Bottom Center Circular */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 !animate-none">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="h-11 w-11 rounded-full bg-[#00775B] hover:bg-[#009e78] text-white shadow-2xl transition-all p-0 transform translate-y-4 group-hover:translate-y-0 flex items-center justify-center !animate-none" 
            title="Verify"
            style={{ transitionDelay: '0ms' }}
          >
            <Eye className="w-5 h-5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="h-11 w-11 rounded-full bg-[#EA580C] hover:bg-[#DC5208] text-white shadow-2xl transition-all p-0 transform translate-y-4 group-hover:translate-y-0 flex items-center justify-center !animate-none" 
            title="Flag"
            style={{ transitionDelay: '50ms' }}
          >
            <AlertTriangle className="w-5 h-5" />
          </button>
        </div>

        {/* One-Click View Feed - Camera Button (Bottom Right, Semi-Transparent) */}
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="absolute bottom-2 right-2 bg-neutral-900/80 hover:bg-[#00775B] text-white text-[7px] font-mono px-2 py-1 rounded shadow-lg transition-all z-30 flex items-center gap-1 !animate-none backdrop-blur-sm"
          title="View Live Feed"
        >
          <Camera className="w-3 h-3" />
          <span>{zone.camera}</span>
        </button>
      </motion.div>
    );
  }

  // Queue Card - SLA vs Wait Time
  if (category === "queue") {
    const waitTimeSeconds = parseInt(zone.dwellTime.split('m')[0]) * 60 + (parseInt(zone.dwellTime.split('m')[1]?.split('s')[0]) || 0);
    const slaLimitStr = zone.slaLimit || "5m";
    const slaLimitSeconds = parseInt(slaLimitStr.replace('m', '')) * 60;
    const slaPercentage = Math.min((waitTimeSeconds / slaLimitSeconds) * 100, 100);
    const breached = waitTimeSeconds > slaLimitSeconds;
    
    // Predictive coloring: Amber when within 10 seconds of breach
    const nearBreach = !breached && (slaLimitSeconds - waitTimeSeconds) <= 10;
    const hasHeatmap = zone.queueLength && zone.queueLength > 5;

    return (
      <motion.div
        ref={scrollRef}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "group rounded border p-3 hover:border-[#00775B]/50 transition-all cursor-pointer relative overflow-hidden flex flex-col",
          isHighlighted && "border-[#00775B] border-2 shadow-[0_0_12px_rgba(0,119,91,0.4)] ring-2 ring-[#00775B]/20",
          breached && !isHighlighted && "border-[#EA580C] bg-[#FEEFE7]",
          nearBreach && !isHighlighted && "border-[#E19A04] bg-[#FFF7E6]",
          !breached && !nearBreach && !isHighlighted && "border-neutral-200 bg-white"
        )}
        onClick={onClick}
      >
        {/* Header + Last Updated */}
        <div className="flex items-start justify-between mb-2 shrink-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-[9px] font-bold uppercase text-neutral-800 truncate leading-tight">{zone.zoneName}</h3>
            <p className="text-[7px] text-neutral-500 truncate leading-tight">{zone.app}</p>
            {/* Last Updated Timestamp */}
            <p className="text-[7px] font-mono text-[#00775B] mt-0.5">Updated {secondsAgo}s ago</p>
          </div>
          <Clock className={cn("w-3.5 h-3.5 shrink-0 ml-1", breached ? "text-[#EA580C]" : nearBreach ? "text-[#E19A04]" : "text-[#00775B]")} />
        </div>

        {/* Main Metrics - Queue Length & Wait Time */}
        <div className="grid grid-cols-2 gap-2 mb-2 shrink-0">
          <div className="text-center">
            <div className="text-[7px] text-neutral-500 uppercase mb-1">Queue-Length</div>
            <div className="text-2xl font-mono font-bold text-neutral-800">{zone.queueLength || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-[7px] text-neutral-500 uppercase mb-1">Avg Wait Time</div>
            <div className={cn("text-2xl font-mono font-bold", breached ? "text-[#EA580C]" : nearBreach ? "text-[#E19A04]" : "text-[#00775B]")}>
              {zone.dwellTime}
            </div>
          </div>
        </div>

        {/* Queue Density Heatmap (for active queues) */}
        {hasHeatmap && (
          <div className="mb-2 shrink-0">
            <div className="text-[7px] text-neutral-400 uppercase mb-1">Queue Density Map (Last Hour Sections)</div>
            <div className="space-y-0.5">
              {[0, 1].map((row) => (
                <div key={row} className="flex gap-0.5">
                  {Array.from({ length: 10 }, (_, col) => {
                    const val = (zone.id.charCodeAt(0) + row * 10 + col) % 100;
                    const color = val > 70 ? 'bg-[#E7000B]' : val > 50 ? 'bg-[#EA580C]' : val > 30 ? 'bg-[#E19A04]' : val > 15 ? 'bg-[#00A63E]' : 'bg-[#00775B]';
                    return <div key={col} className={cn("h-1.5 flex-1 rounded-sm", color)} />;
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLA Progress Bar with Predictive Coloring */}
        <div className="mb-2 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[7px] text-neutral-500 uppercase">SLA Status ({slaLimitStr} limit)</span>
            {breached && (
              <span className="px-1.5 py-0.5 bg-[#EA580C] text-white text-[7px] font-bold uppercase rounded">SLA Breach</span>
            )}
            {nearBreach && !breached && (
              <span className="px-1.5 py-0.5 bg-[#E19A04] text-white text-[7px] font-bold uppercase rounded">Near Limit</span>
            )}
          </div>
          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
            <div className={cn("h-full transition-all", breached ? "bg-[#EA580C]" : nearBreach ? "bg-[#E19A04]" : "bg-[#00775B]")} style={{ width: `${slaPercentage}%` }} />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[7px] font-mono text-neutral-500">0s</span>
            <span className="text-[7px] font-mono text-neutral-500">{zone.waitTime || zone.dwellTime} / {slaLimitStr}</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Subtle Dark Gradient Overlay on Hover */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

        {/* Hover Action Buttons - Bottom Center Circular */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 !animate-none">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="h-11 w-11 rounded-full bg-[#00775B] hover:bg-[#009e78] text-white shadow-2xl transition-all p-0 transform translate-y-4 group-hover:translate-y-0 flex items-center justify-center !animate-none" 
            title="Verify"
            style={{ transitionDelay: '0ms' }}
          >
            <Eye className="w-5 h-5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="h-11 w-11 rounded-full bg-[#EA580C] hover:bg-[#DC5208] text-white shadow-2xl transition-all p-0 transform translate-y-4 group-hover:translate-y-0 flex items-center justify-center !animate-none" 
            title="Flag"
            style={{ transitionDelay: '50ms' }}
          >
            <AlertTriangle className="w-5 h-5" />
          </button>
        </div>

        {/* One-Click View Feed - Persistent Camera Button (Queue) */}
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="absolute top-2 right-2 bg-[#00775B] hover:bg-[#009e78] text-white text-[7px] font-mono px-2 py-1 rounded shadow-lg transition-all z-30 flex items-center gap-1 !animate-none"
          title="View Live Feed"
        >
          <Camera className="w-3 h-3" />
          <span>{zone.camera}</span>
        </button>
      </motion.div>
    );
  }

  // Directional/Wrong-way Card - Flow Breach Intelligence
  if (category === "directional") {
    const wrongWayEvents = zone.status === "violation" ? Math.floor(Math.random() * 8) + 5 : Math.floor(Math.random() * 5);
    const isViolationFlow = wrongWayEvents > 5;
    
    // Split violations by direction (e.g., "9 Entry | 3 Exit")
    const inboundViolations = Math.floor(wrongWayEvents * 0.75); // 75% are wrong-way entries
    const outboundViolations = wrongWayEvents - inboundViolations;
    const primaryBreachDirection = inboundViolations > outboundViolations ? "Entry" : "Exit";
    
    // Security Health Score - Actual compliance (not traffic volume)
    // Assume 100 total people passed through, violations are the failures
    const totalTraffic = 100;
    const compliancePercent = Math.round(((totalTraffic - wrongWayEvents) / totalTraffic) * 100);
    const violationPercent = 100 - compliancePercent;
    
    // Breach frequency sparkline (violations per 2-min interval over 30 min = 15 points)
    const breachSparkline = Array.from({ length: 15 }, (_, i) => {
      if (isViolationFlow) {
        return Math.max(0, Math.floor(Math.random() * 3) + (i > 10 ? 2 : 0)); // Spike in last 10 minutes
      }
      return Math.floor(Math.random() * 2);
    });
    
    return (
      <motion.div
        ref={scrollRef}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "group rounded border p-3 hover:border-[#00775B]/50 transition-all cursor-pointer relative overflow-hidden flex flex-col",
          isHighlighted && "border-[#00775B] border-2 shadow-[0_0_12px_rgba(0,119,91,0.4)] ring-2 ring-[#00775B]/20",
          isViolationFlow && !isHighlighted && "border-[#EA580C] bg-[#FEEFE7]",
          !isViolationFlow && !isHighlighted && "border-neutral-200 bg-white"
        )}
        onClick={onClick}
      >
        {/* Header: Zone Name + App */}
        <div className="flex items-start justify-between mb-2 shrink-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-[10px] font-bold uppercase text-neutral-800 truncate leading-tight">{zone.zoneName}</h3>
            <p className="text-[8px] text-neutral-500 truncate leading-tight">{zone.app}</p>
            {/* Live Pulse Indicator Only */}
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 bg-[#00775B] rounded-full animate-pulse" />
              <p className="text-[7px] font-mono text-[#00775B]">Live</p>
            </div>
          </div>
        </div>

        {/* Vector Header - Total Breaches with Dynamic Arrow & Circular Compliance */}
        <div className="mb-3 shrink-0">
          <div className="text-[7px] text-neutral-400 uppercase mb-1">Total Breaches (Last 30 Min)</div>
          <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#E7000B]/10 to-[#EA580C]/10 rounded p-3 border border-[#EA580C]/30">
            {/* Vector Arrow + Count */}
            <div className="flex items-center gap-3">
              {primaryBreachDirection === "Entry" ? (
                <ArrowRight className="w-8 h-8 text-[#E7000B] rotate-180 animate-pulse" strokeWidth={3} />
              ) : (
                <ArrowRight className="w-8 h-8 text-[#E7000B] animate-pulse" strokeWidth={3} />
              )}
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-[#E7000B]">{wrongWayEvents}</div>
                <div className="text-[7px] font-mono text-neutral-600 uppercase">Violations</div>
              </div>
            </div>
            
            {/* Circular Compliance Gauge */}
            <div className="relative w-16 h-16 flex-shrink-0">
              {/* Background circle */}
              <svg className="transform -rotate-90 w-16 h-16">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#E5E7EB"
                  strokeWidth="6"
                  fill="none"
                />
                {/* Green compliance arc */}
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#00A63E"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${(compliancePercent / 100) * 176} 176`}
                  strokeLinecap="round"
                />
                {/* Red violation arc */}
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#E7000B"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${(violationPercent / 100) * 176} 176`}
                  strokeDashoffset={`-${(compliancePercent / 100) * 176}`}
                  strokeLinecap="round"
                />
              </svg>
              {/* Center percentage */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xs font-mono font-bold text-[#00A63E]">{compliancePercent}%</div>
                <div className="text-[6px] text-neutral-500 uppercase leading-none">Safe</div>
              </div>
            </div>
          </div>
        </div>

        {/* Violation Breakdown Pills - Simple & Clear */}
        <div className="mb-2 shrink-0">
          <div className="text-[7px] text-neutral-400 uppercase mb-1">Violation Breakdown</div>
          <div className="flex gap-2">
            {/* Entry Breaches Pill */}
            <div className="flex-1 bg-[#E7000B] text-white rounded px-2 py-1.5 text-center">
              <div className="text-lg font-mono font-bold leading-none">{inboundViolations}</div>
              <div className="text-[7px] uppercase mt-0.5">Entry Breaches</div>
            </div>
            {/* Exit Breaches Pill */}
            <div className="flex-1 bg-[#EA580C] text-white rounded px-2 py-1.5 text-center">
              <div className="text-lg font-mono font-bold leading-none">{outboundViolations}</div>
              <div className="text-[7px] uppercase mt-0.5">Exit Breaches</div>
            </div>
          </div>
        </div>

        {/* Breach Frequency Sparkline - Area Fill Style */}
        <div className="mb-2 shrink-0">
          <div className="text-[7px] text-neutral-400 uppercase mb-1">Breach Frequency · Incidents per 2 min</div>
          <div className="relative h-12 bg-neutral-900 rounded p-1 overflow-hidden">
            {/* SVG Sparkline with Area Fill */}
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 150 40">
              {/* Define gradient for area fill */}
              <defs>
                <linearGradient id="breachGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#E7000B" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#E7000B" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              
              {/* Build path for sparkline */}
              <path
                d={(() => {
                  const maxCount = Math.max(...breachSparkline, 1);
                  const points = breachSparkline.map((count, i) => {
                    const x = (i / (breachSparkline.length - 1)) * 150;
                    const y = 40 - ((count / maxCount) * 35);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ');
                  // Close the path for area fill
                  return `${points} L 150 40 L 0 40 Z`;
                })()}
                fill="url(#breachGradient)"
                stroke="none"
              />
              
              {/* Line on top for definition */}
              <path
                d={(() => {
                  const maxCount = Math.max(...breachSparkline, 1);
                  return breachSparkline.map((count, i) => {
                    const x = (i / (breachSparkline.length - 1)) * 150;
                    const y = 40 - ((count / maxCount) * 35);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ');
                })()}
                fill="none"
                stroke="#E7000B"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex justify-between mt-0.5 text-[6px] text-neutral-500 font-mono">
            <span>30 min ago</span>
            <span>NOW</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Subtle Dark Gradient Overlay on Hover */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

        {/* Hover Action Buttons - Bottom Center Circular */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 !animate-none">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="h-11 w-11 rounded-full bg-[#00775B] hover:bg-[#009e78] text-white shadow-2xl transition-all p-0 transform translate-y-4 group-hover:translate-y-0 flex items-center justify-center !animate-none" 
            title="View Violation Feed"
            style={{ transitionDelay: '0ms' }}
          >
            <Eye className="w-5 h-5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="h-11 w-11 rounded-full bg-[#EA580C] hover:bg-[#DC5208] text-white shadow-2xl transition-all p-0 transform translate-y-4 group-hover:translate-y-0 flex items-center justify-center !animate-none" 
            title="Flag"
            style={{ transitionDelay: '50ms' }}
          >
            <AlertTriangle className="w-5 h-5" />
          </button>
        </div>

        {/* One-Click View Violation Feed - Camera Button (Bottom Right) */}
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="absolute bottom-2 right-2 bg-neutral-900/80 hover:bg-[#00775B] text-white text-[7px] font-mono px-2 py-1 rounded shadow-lg transition-all z-30 flex items-center gap-1 !animate-none backdrop-blur-sm"
          title="View Violation Feed"
        >
          <Camera className="w-3 h-3" />
          <span>{zone.camera}</span>
        </button>
      </motion.div>
    );
  }

  // Parking Card
  if (category === "parking") {
    const spotOccupancy = zone.occupancy;
    const totalSpots = zone.maxCapacity || 10;
    const occupiedSpots = zone.currentCount || Math.round((spotOccupancy / 100) * totalSpots);
    
    return (
      <motion.div
        ref={scrollRef}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "group rounded border p-3 hover:border-[#00775B]/50 transition-all cursor-pointer relative overflow-hidden flex flex-col",
          isHighlighted && "border-[#00775B] border-2 shadow-[0_0_12px_rgba(0,119,91,0.4)] ring-2 ring-[#00775B]/20",
          spotOccupancy > 90 && !isHighlighted && "border-[#E19A04] bg-[#FFF7E6]",
          spotOccupancy <= 90 && !isHighlighted && "border-neutral-200 bg-white"
        )}
        onClick={onClick}
      >
        {/* Header + Last Updated */}
        <div className="flex items-start justify-between mb-2 shrink-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-[9px] font-bold uppercase text-neutral-800 truncate leading-tight">{zone.zoneName}</h3>
            <p className="text-[7px] text-neutral-500 truncate leading-tight">{zone.app}</p>
            {/* Last Updated Timestamp */}
            <p className="text-[7px] font-mono text-[#00775B] mt-0.5">Updated {secondsAgo}s ago</p>
          </div>
          <Activity className="w-3.5 h-3.5 shrink-0 ml-1 text-[#00775B]" />
        </div>

        {/* Main Occupancy Display */}
        <div className="text-center mb-2 shrink-0">
          <div className="text-[7px] text-neutral-500 uppercase mb-1">Utilized Capacity</div>
          <div className="flex items-baseline justify-center gap-1">
            <span className={cn("text-3xl font-mono font-bold", spotOccupancy > 90 ? "text-[#E19A04]" : "text-[#00775B]")}>
              {occupiedSpots}
            </span>
            <span className="text-lg font-mono text-neutral-400">/</span>
            <span className="text-lg font-mono font-bold text-neutral-500">{totalSpots}</span>
          </div>
        </div>

        {/* Compact Stats Row - No Spot Grid */}
        <div className="grid grid-cols-2 gap-2 mb-2 shrink-0">
          <div className="bg-[#00775B]/5 rounded px-2 py-1.5 border border-[#00775B]/10">
            <div className="text-[7px] text-neutral-500 uppercase mb-0.5">Available</div>
            <div className="text-lg font-mono font-bold text-[#00775B] leading-none">{totalSpots - occupiedSpots}</div>
          </div>
          <div className={cn(
            "rounded px-2 py-1.5 border",
            spotOccupancy > 90 ? "bg-[#E19A04]/5 border-[#E19A04]/10" : "bg-neutral-50 border-neutral-100"
          )}>
            <div className="text-[7px] text-neutral-500 uppercase mb-0.5">Occupancy</div>
            <div className={cn(
              "text-lg font-mono font-bold leading-none",
              spotOccupancy > 90 ? "text-[#E19A04]" : "text-neutral-800"
            )}>{spotOccupancy}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-2 shrink-0">
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-300",
                spotOccupancy > 90 ? "bg-[#E19A04]" : "bg-[#00775B]"
              )} 
              style={{ width: `${spotOccupancy}%` }}
            />
          </div>
        </div>

        {/* Turnover Rate */}
        <div className="bg-neutral-50 rounded px-2 py-1.5 mb-2 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[7px] text-neutral-500 uppercase">Avg Turnover</span>
            <span className="text-xs font-mono font-bold text-neutral-800">{zone.turnoverRate || "N/A"}</span>
          </div>
        </div>

        {/* Spacer to push timestamp and CTAs to bottom */}
        <div className="flex-1" />

        {/* Last Updated */}
        <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-1">
            <Activity className="w-2.5 h-2.5 text-[#00775B]" />
            <span className="text-[7px] font-mono text-neutral-500">Updated <span className="font-bold text-neutral-700">{secondsAgo}s ago</span></span>
          </div>
        </div>

        {/* Subtle Dark Gradient Overlay on Hover */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

        {/* Hover Action Buttons - Bottom Center Circular */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 !animate-none">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="h-11 w-11 rounded-full bg-[#00775B] hover:bg-[#009e78] text-white shadow-2xl transition-all p-0 transform translate-y-4 group-hover:translate-y-0 flex items-center justify-center !animate-none" 
            title="Verify"
            style={{ transitionDelay: '0ms' }}
          >
            <Eye className="w-5 h-5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="h-11 w-11 rounded-full bg-[#EA580C] hover:bg-[#DC5208] text-white shadow-2xl transition-all p-0 transform translate-y-4 group-hover:translate-y-0 flex items-center justify-center !animate-none" 
            title="Flag"
            style={{ transitionDelay: '50ms' }}
          >
            <AlertTriangle className="w-5 h-5" />
          </button>
        </div>

        {/* One-Click View Feed - Persistent Camera Button (Parking) */}
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="absolute top-2 right-2 bg-[#00775B] hover:bg-[#009e78] text-white text-[7px] font-mono px-2 py-1 rounded shadow-lg transition-all z-30 flex items-center gap-1 !animate-none"
          title="View Live Feed"
        >
          <Camera className="w-3 h-3" />
          <span>{zone.camera}</span>
        </button>
      </motion.div>
    );
  }
  
  // Mustering Card
  if (category === "mustering") {
    const isCriticalOccupancy = zone.occupancy > 90;
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (zone.occupancy / 100) * circumference;
    
    return (
      <motion.div
        ref={scrollRef}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "group rounded border p-3 hover:border-[#00775B]/50 transition-all cursor-pointer relative overflow-hidden flex flex-col",
          isHighlighted && "border-[#00775B] border-2 shadow-[0_0_12px_rgba(0,119,91,0.4)] ring-2 ring-[#00775B]/20",
          isCriticalOccupancy && !isHighlighted && "border-[#E7000B] bg-[#FFE5E7] shadow-[0_0_15px_rgba(231,0,11,0.4)] animate-pulse",
          !isCriticalOccupancy && zone.occupancy > 75 && !isHighlighted && "border-[#EA580C] bg-[#FEEFE7]",
          zone.occupancy <= 75 && !isHighlighted && "border-neutral-200 bg-white"
        )}
        onClick={onClick}
      >
        {/* Header + Last Updated */}
        <div className="flex items-start justify-between mb-2 shrink-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-[9px] font-bold uppercase text-neutral-800 truncate leading-tight">{zone.zoneName}</h3>
            <p className="text-[7px] text-neutral-500 truncate leading-tight">{zone.app}</p>
            {/* Last Updated Timestamp */}
            <p className="text-[7px] font-mono text-[#00775B] mt-0.5">Updated {secondsAgo}s ago</p>
          </div>
          <Users className={cn("w-3.5 h-3.5 shrink-0 ml-1", isCriticalOccupancy ? "text-[#E7000B]" : "text-[#00775B]")} />
        </div>

        {/* Main People Count */}
        <div className="text-center mb-2 shrink-0">
          <div className="text-[7px] text-neutral-500 uppercase mb-1">People Detected (85% Capacity)</div>
          <div className="flex items-baseline justify-center gap-1">
            <span className={cn("text-3xl font-mono font-bold", isCriticalOccupancy ? "text-[#E7000B]" : "text-neutral-800")}>
              {zone.currentCount}
            </span>
            <span className="text-lg font-mono text-neutral-400">/</span>
            <span className="text-lg font-mono font-bold text-neutral-500">{zone.maxCapacity}</span>
          </div>
        </div>

        {/* Circular Gauge Visualization */}
        <div className="flex justify-center mb-2 shrink-0">
          <div className="relative w-24 h-24">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="#E5E7EB"
                strokeWidth="6"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke={isCriticalOccupancy ? "#E7000B" : zone.occupancy > 75 ? "#EA580C" : "#00775B"}
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={cn("text-2xl font-mono font-bold leading-none", isCriticalOccupancy ? "text-[#E7000B]" : zone.occupancy > 75 ? "text-[#EA580C]" : "text-[#00775B]")}>
                  {zone.occupancy}%
                </div>
                <div className="text-[7px] text-neutral-500 uppercase mt-0.5">Full</div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer to push timestamp and CTAs to bottom */}
        <div className="flex-1" />

        {/* Last Updated */}
        <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-1">
            <Activity className="w-2.5 h-2.5 text-[#00775B]" />
            <span className="text-[7px] font-mono text-neutral-500">Updated <span className="font-bold text-neutral-700">{secondsAgo}s ago</span></span>
          </div>
        </div>

        {/* Subtle Dark Gradient Overlay on Hover */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

        {/* Hover Action Buttons - Bottom Center Circular */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 !animate-none">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="h-11 w-11 rounded-full bg-[#00775B] hover:bg-[#009e78] text-white shadow-2xl transition-all p-0 transform translate-y-4 group-hover:translate-y-0 flex items-center justify-center !animate-none" 
            title="Verify"
            style={{ transitionDelay: '0ms' }}
          >
            <Eye className="w-5 h-5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="h-11 w-11 rounded-full bg-[#EA580C] hover:bg-[#DC5208] text-white shadow-2xl transition-all p-0 transform translate-y-4 group-hover:translate-y-0 flex items-center justify-center !animate-none" 
            title="Flag"
            style={{ transitionDelay: '50ms' }}
          >
            <AlertTriangle className="w-5 h-5" />
          </button>
        </div>

        {/* One-Click View Feed - Persistent Camera Button (Mustering) */}
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="absolute top-2 right-2 bg-[#00775B] hover:bg-[#009e78] text-white text-[7px] font-mono px-2 py-1 rounded shadow-lg transition-all z-30 flex items-center gap-1 !animate-none"
          title="View Live Feed"
        >
          <Camera className="w-3 h-3" />
          <span>{zone.camera}</span>
        </button>
      </motion.div>
    );
  }

  // Default/Utilization Card - Compact version for all other categories
  return (
    <motion.div
      ref={scrollRef}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "group rounded border p-3 hover:border-[#00775B]/50 transition-all cursor-pointer relative overflow-hidden flex flex-col",
        isHighlighted && "border-[#00775B] border-2 shadow-[0_0_12px_rgba(0,119,91,0.4)] ring-2 ring-[#00775B]/20",
        isViolation && !isHighlighted && "border-[#E7000B] bg-[#FFE5E7] animate-pulse",
        zone.occupancy < 40 && !isViolation && !isHighlighted && "border-[#E19A04] bg-[#FFF7E6]",
        zone.occupancy >= 40 && !isViolation && !isHighlighted && "border-neutral-200 bg-white"
      )}
      onClick={onClick}
    >
      {/* Header + Last Updated */}
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex-1 min-w-0">
          <h3 className="text-[9px] font-bold uppercase text-neutral-800 truncate leading-tight">{zone.zoneName}</h3>
          <p className="text-[7px] text-neutral-500 truncate leading-tight">{zone.app}</p>
          {/* Last Updated Timestamp */}
          <p className="text-[7px] font-mono text-[#00775B] mt-0.5">Updated {secondsAgo}s ago</p>
        </div>
        <BarChart3 className="w-3.5 h-3.5 shrink-0 ml-1 text-[#00775B]" />
      </div>

      {/* Compact Metrics Grid */}
      <div className="grid grid-cols-2 gap-1.5 mb-1.5">
        <div className="bg-neutral-50 rounded p-1.5">
          <div className="flex items-center gap-1 mb-0.5">
            <Gauge className="w-2.5 h-2.5 text-neutral-500" />
            <span className="text-[7px] text-neutral-500 uppercase">Utilization</span>
          </div>
          <div className={cn("text-base font-mono font-bold leading-none", zone.occupancy < 40 ? "text-[#E19A04]" : "text-[#00775B]")}>
            {zone.occupancy}%
          </div>
        </div>
        <div className="bg-neutral-50 rounded p-1.5">
          <div className="flex items-center gap-1 mb-0.5">
            <Clock className="w-2.5 h-2.5 text-neutral-500" />
            <span className="text-[7px] text-neutral-500 uppercase">Dwell</span>
          </div>
          <div className="text-base font-mono font-bold leading-none text-neutral-800">
            {zone.dwellTime}
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Subtle Dark Gradient Overlay on Hover */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

      {/* Hover Action Buttons - Bottom Center Circular */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 !animate-none">
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="h-11 w-11 rounded-full bg-[#00775B] hover:bg-[#009e78] text-white shadow-2xl transition-all p-0 transform translate-y-4 group-hover:translate-y-0 flex items-center justify-center !animate-none" 
          title="Verify"
          style={{ transitionDelay: '0ms' }}
        >
          <Eye className="w-5 h-5" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="h-11 w-11 rounded-full bg-[#EA580C] hover:bg-[#DC5208] text-white shadow-2xl transition-all p-0 transform translate-y-4 group-hover:translate-y-0 flex items-center justify-center !animate-none" 
          title="Flag"
          style={{ transitionDelay: '50ms' }}
        >
          <AlertTriangle className="w-5 h-5" />
        </button>
      </div>

      {/* One-Click View Feed - Persistent Camera Button (Default) */}
      <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="absolute top-2 right-2 bg-[#00775B] hover:bg-[#009e78] text-white text-[7px] font-mono px-2 py-1 rounded shadow-lg transition-all z-30 flex items-center gap-1 !animate-none"
        title="View Live Feed"
      >
        <Camera className="w-3 h-3" />
        <span>{zone.camera}</span>
      </button>
      {zone.occupancy < 40 && (
        <div className="absolute top-1.5 left-1.5 text-[7px] font-bold uppercase bg-[#E19A04] text-white px-1.5 py-0.5 rounded z-5">
          Low
        </div>
      )}
    </motion.div>
  );
};

const ZoneViolationsTicker = () => {
  return (
    <div className="w-full bg-neutral-900 text-white text-[10px] py-1.5 px-4 overflow-hidden flex items-center gap-4 border-b border-[#00775B]/30 sticky top-0 z-30">
      <span className="font-bold uppercase tracking-wider text-[#00775B] shrink-0 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#E7000B] animate-pulse shadow-[0_0_8px_rgba(231,0,11,0.6)]" />
        Live Zone Violations
      </span>
      <div className="flex-1 overflow-hidden relative">
        <div className="animate-marquee whitespace-nowrap flex gap-8">
          {[...ZONE_VIOLATIONS_TICKER, ...ZONE_VIOLATIONS_TICKER].map((violation, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span className={cn(
                "font-bold uppercase px-1.5 py-0.5 rounded text-[9px]",
                violation.severity === "critical" && "bg-[#E7000B] text-white",
                violation.severity === "high" && "bg-[#EA580C] text-white",
                violation.severity === "medium" && "bg-[#E19A04] text-white"
              )}>
                {violation.severity}
              </span>
              <span className="font-medium">{violation.message}</span>
              <span className="text-neutral-400">({violation.zone} - {violation.camera})</span>
              <span className="text-neutral-500">{violation.time}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Live Zone Occupancy Map - Visual Centerpiece
const LiveZoneOccupancyMap = ({ onZoneClick, highlightedZone }: { onZoneClick: (zone: ZoneCardType) => void; highlightedZone?: string | null }) => {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Simplified 2D floor plan layout - zones positioned as rectangles
  const zonePositions = [
    { zone: ZONE_CARDS[0], x: 10, y: 10, width: 120, height: 80, label: "Main\nEntrance" }, // Main Entrance Queue
    { zone: ZONE_CARDS[1], x: 150, y: 10, width: 100, height: 60, label: "Server\nRoom" }, // Server Room
    { zone: ZONE_CARDS[2], x: 10, y: 110, width: 140, height: 90, label: "Loading\nDock" }, // Loading Dock
    { zone: ZONE_CARDS[3], x: 270, y: 10, width: 140, height: 120, label: "Parking\nLot A" }, // Parking
    { zone: ZONE_CARDS[4], x: 150, y: 90, width: 100, height: 60, label: "Restricted\nZone C" }, // Restricted Zone
    { zone: ZONE_CARDS[5], x: 270, y: 150, width: 100, height: 70, label: "Cafeteria" }, // Cafeteria
    { zone: ZONE_CARDS[6], x: 10, y: 220, width: 110, height: 80, label: "Lobby" }, // Lobby
    { zone: ZONE_CARDS[7], x: 380, y: 150, width: 90, height: 70, label: "Perimeter\nNorth" }, // Perimeter
    { zone: ZONE_CARDS[8], x: 170, y: 170, width: 90, height: 80, label: "Warehouse\nA" }, // Warehouse
    { zone: ZONE_CARDS[9], x: 380, y: 10, width: 90, height: 120, label: "Emergency\nExit B" }, // Emergency Exit
    { zone: ZONE_CARDS[10], x: 130, y: 270, width: 130, height: 80, label: "Retail\nFloor 1" }, // Retail Floor
    { zone: ZONE_CARDS[11], x: 280, y: 240, width: 90, height: 60, label: "Back\nAlley" }, // Back Alley
  ];

  const getZoneColor = (status: string, occupancy: number) => {
    if (status === "critical" || status === "violation") return "#E7000B"; // Bright Red
    if (status === "stagnant" || occupancy > 80) return "#EA580C"; // Bright Orange
    if (occupancy > 60) return "#E19A04"; // Bright Yellow
    return "#00A63E"; // Bright Green
  };

  const hoveredData = hoveredZone ? zonePositions.find(z => z.zone.id === hoveredZone)?.zone : null;

  return (
    <div className="bg-white rounded-md border border-neutral-200 shadow-sm p-4 h-full">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-[#00775B]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Live Zone Occupancy Map</h3>
        
        {/* Configure Areas Button */}
        <button
          onClick={() => setIsConfigOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00775B] hover:bg-[#009e78] text-white rounded text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-md ml-2"
          title="Configure Zones"
        >
          <Settings className="w-3.5 h-3.5" />
          Configure Areas
        </button>
        
        {/* Live Pulsing Indicator */}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-2 h-2 rounded-full bg-[#00775B] animate-pulse shadow-[0_0_8px_rgba(0,119,91,0.6)]" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#00775B]">Live</span>
        </div>
      </div>
      
      {/* Zone Configuration Modal */}
      <ZoneConfigurationModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />

      <div className="relative bg-neutral-50 rounded border border-neutral-200" style={{ height: 500 }}>
        <svg width="100%" height="100%" viewBox="0 0 480 360" preserveAspectRatio="xMidYMid meet" className="absolute inset-0">
          {/* Grid lines for spatial context */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Zone rectangles */}
          {zonePositions.map(({ zone, x, y, width, height, label }) => (
            <g key={zone.id}>
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={getZoneColor(zone.status, zone.occupancy)}
                fillOpacity={hoveredZone === zone.id || highlightedZone === zone.id ? 0.9 : 0.7}
                stroke={highlightedZone === zone.id ? "#00775B" : hoveredZone === zone.id ? "#00775B" : "#fff"}
                strokeWidth={highlightedZone === zone.id ? 4 : hoveredZone === zone.id ? 3 : 2}
                rx="4"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => onZoneClick(zone)}
                style={{
                  filter: zone.status === "critical" || zone.status === "violation" 
                    ? "drop-shadow(0 0 8px rgba(231, 0, 11, 0.6))" 
                    : highlightedZone === zone.id
                    ? "drop-shadow(0 0 12px rgba(0, 119, 91, 0.8))"
                    : "none"
                }}
              />
              <text
                x={x + width / 2}
                y={y + height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[9px] font-bold fill-white pointer-events-none"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
              >
                {label.split('\n').map((line, i) => (
                  <tspan key={i} x={x + width / 2} dy={i === 0 ? 0 : 11}>{line}</tspan>
                ))}
              </text>
              <text
                x={x + width / 2}
                y={y + height - 8}
                textAnchor="middle"
                className="text-[10px] font-mono font-bold fill-white pointer-events-none"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
              >
                {zone.occupancy}%
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredData && (
          <div className="absolute bottom-4 left-4 bg-neutral-900/95 backdrop-blur-sm text-white px-3 py-2 rounded shadow-lg text-[10px] font-mono pointer-events-none z-10">
            <div className="font-bold mb-1">{hoveredData.zoneName}</div>
            <div className="space-y-0.5 text-[9px]">
              <div>Dwell: {hoveredData.dwellTime}</div>
              <div>Occupancy: {hoveredData.occupancy}%</div>
              <div>Queue: {hoveredData.queueLength}</div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1.5 rounded border border-neutral-200 text-[9px] space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#00A63E] rounded" />
            <span className="text-neutral-600">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#E19A04] rounded" />
            <span className="text-neutral-600">Busy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#EA580C] rounded" />
            <span className="text-neutral-600">Stagnant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#E7000B] rounded" />
            <span className="text-neutral-600">Violation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// At-Risk Zones - Tactical Hotspot Sidebar
const AtRiskZonesSidebar = ({ onViewCamera }: { onViewCamera: (zone: ZoneCardType) => void }) => {
  // Sort by severity: critical/violation first, then by occupancy
  const atRiskZones = [...ZONE_CARDS]
    .sort((a, b) => {
      const severityOrder = { critical: 0, violation: 1, stagnant: 2, safe: 3 };
      const aSeverity = severityOrder[a.status] || 99;
      const bSeverity = severityOrder[b.status] || 99;
      if (aSeverity !== bSeverity) return aSeverity - bSeverity;
      return b.occupancy - a.occupancy;
    })
    .slice(0, 4); // Only show 4 cards

  return (
    <div className="bg-white rounded-md border border-neutral-200 shadow-sm p-4 h-full">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">At-Risk Zones</h3>
      </div>

      <div className="space-y-2">
        {atRiskZones.map((zone, index) => {
          const sparklineData = zone.sparklineData.map((value, i) => ({ index: i, value }));
          const isViolation = zone.status === "critical" || zone.status === "violation";

          return (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "border rounded p-2 transition-all relative overflow-hidden cursor-pointer hover:shadow-lg",
                isViolation 
                  ? "border-[#E7000B] bg-[#FFE5E7] shadow-[0_0_12px_rgba(231,0,11,0.3)]"
                  : zone.status === "stagnant"
                  ? "border-[#E19A04] bg-[#FFF7E6]"
                  : "border-neutral-200 bg-white"
              )}
              style={{
                animation: isViolation ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" : "none"
              }}
              onClick={() => onViewCamera(zone)}
            >
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="text-[10px] font-bold text-neutral-800 truncate">{zone.zoneName}</div>
                    {/* Risk Reason Badge - Inline with Title */}
                    <div className={cn(
                      "text-[7px] font-bold uppercase px-1 py-0.5 rounded shrink-0",
                      isViolation ? "bg-[#E7000B]/10 text-[#E7000B]" : "bg-[#EA580C]/10 text-[#EA580C]"
                    )}>
                      {zone.occupancy > 100 && "Over Cap"}
                      {zone.occupancy > 90 && zone.occupancy <= 100 && "Near Cap"}
                      {zone.occupancy <= 90 && zone.status === "violation" && zone.dwellTime.includes("28m") && "Loitering"}
                      {zone.occupancy <= 90 && zone.status === "violation" && !zone.dwellTime.includes("28m") && "Unauthorized"}
                      {zone.status === "stagnant" && "Stagnant"}
                    </div>
                  </div>
                  <div className="text-[8px] text-neutral-500 truncate">{zone.app}</div>
                </div>
                <span className={cn(
                  "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0",
                  zone.status === "critical" && "bg-[#E7000B] text-white",
                  zone.status === "violation" && "bg-[#E7000B] text-white",
                  zone.status === "stagnant" && "bg-[#EA580C] text-white",
                  zone.status === "safe" && "bg-[#00A63E] text-white"
                )}>
                  #{index + 1}
                </span>
              </div>

              {/* Mini Sparkline */}
              <div className="h-8 w-full mb-1.5 -mx-1 min-w-0">
                <ResponsiveContainer width="100%" height={32} minHeight={32}>
                  <LineChart data={sparklineData.map((d, i) => ({ ...d, time: `${i * 2}m` }))} margin={{ top: 1, right: 1, left: 1, bottom: 1 }}>
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-neutral-900/95 backdrop-blur-sm text-white px-2 py-1 rounded shadow-lg text-[9px] font-mono">
                              <div className="font-bold">{payload[0].payload.time} ago</div>
                              <div>Occupancy: <span className="font-bold text-[#00775B]">{payload[0].value}%</span></div>
                            </div>
                          );
                        }
                        return null;
                      }}
                      cursor={{ stroke: '#64748B', strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={isViolation ? "#E7000B" : zone.status === "stagnant" ? "#EA580C" : "#00775B"}
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Condensed Metrics */}
              <div className="flex items-center justify-between text-[9px]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-neutral-400" />
                    <span className={cn(
                      "font-mono font-bold",
                      zone.occupancy > 90 ? "text-[#E7000B]" : zone.occupancy > 75 ? "text-[#EA580C]" : "text-neutral-700"
                    )}>
                      {zone.occupancy}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    <span className={cn(
                      "font-mono",
                      zone.dwellTime.includes("28m") || zone.dwellTime.includes("22m") || zone.dwellTime.includes("18m") || zone.dwellTime.includes("45m")
                        ? "text-[#EA580C] font-bold"
                        : "text-neutral-700"
                    )}>{zone.dwellTime}</span>
                  </div>
                </div>
                {zone.lastIncident && (
                  <span className="text-[8px] font-bold text-[#E7000B] uppercase">{zone.lastIncident}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Simplified Zone Card - 40% smaller, primary metrics only
interface CompactZoneCardProps extends ZoneCardType {
  onClick: () => void;
}

const CompactZoneCard = ({ onClick, ...zone }: CompactZoneCardProps) => {
  const isViolation = zone.status === "critical" || zone.status === "violation";
  const violationCount = isViolation ? 1 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "rounded border p-2 group hover:border-[#00775B]/50 transition-all cursor-pointer relative",
        isViolation && "border-[#E7000B] bg-[#FFE5E7] shadow-[0_0_15px_rgba(231,0,11,0.5)] animate-pulse",
        zone.status === "stagnant" && "border-[#E19A04] bg-[#FFF7E6]",
        zone.status === "safe" && "border-neutral-200 bg-white"
      )}
      onClick={onClick}
    >
      {/* Header - Zone Name + App Tag */}
      <div className="mb-1.5">
        <h3 className="text-[9px] font-bold uppercase tracking-wide text-neutral-800 truncate mb-0.5">
          {zone.zoneName}
        </h3>
        <p className="text-[8px] text-neutral-500 truncate">{zone.app}</p>
      </div>

      {/* Primary Metrics Only - Icons + Values */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="flex flex-col items-center">
          <Users className="w-3 h-3 text-neutral-400 mb-0.5" />
          <div className={cn(
            "text-sm font-mono font-bold",
            zone.occupancy > 90 ? "text-[#E7000B]" : zone.occupancy > 75 ? "text-[#EA580C]" : "text-[#00775B]"
          )}>
            {zone.occupancy}%
          </div>
        </div>
        <div className="flex flex-col items-center">
          <Clock className="w-3 h-3 text-neutral-400 mb-0.5" />
          <div className="text-[10px] font-mono font-bold text-neutral-900">{zone.dwellTime}</div>
        </div>
        <div className="flex flex-col items-center">
          <AlertTriangle className="w-3 h-3 text-neutral-400 mb-0.5" />
          <div className={cn(
            "text-sm font-mono font-bold",
            violationCount > 0 ? "text-red-600" : "text-neutral-400"
          )}>
            {violationCount}
          </div>
        </div>
      </div>

      {/* Camera Badge */}
      <div className="absolute top-1 right-1 bg-neutral-900/70 text-white text-[7px] font-mono px-1 py-0.5 rounded">
        {zone.camera}
      </div>

      {/* Violation Pulse Indicator */}
      {isViolation && (
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E7000B] rounded-full animate-ping" />
      )}
    </motion.div>
  );
};

const QueueManagementPanel = () => {
  const queueZones = ZONE_CARDS.filter(z => z.queueLength > 0).sort((a, b) => b.queueLength - a.queueLength);

  return (
    <div className="bg-white rounded-md border border-neutral-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-[#00775B]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Queue Management Panel</h3>
      </div>

      <div className="space-y-3">
        {queueZones.map((zone) => {
          const waitTimeSeconds = parseInt(zone.dwellTime.split('m')[0]) * 60 + parseInt(zone.dwellTime.split('m ')[1]?.split('s')[0] || "0");
          const slaLimit = 300; // 5 mins
          const slaPercentage = Math.min((waitTimeSeconds / slaLimit) * 100, 100);
          const breached = waitTimeSeconds > slaLimit;

          return (
            <div key={zone.id} className="border border-neutral-100 rounded p-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-neutral-700">{zone.zoneName}</span>
                <span className="text-[9px] font-mono text-neutral-500">{zone.camera}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-[9px] mb-1">
                    <span className="text-neutral-500">Wait Time vs SLA</span>
                    <span className={cn("font-mono font-bold", breached ? "text-red-600" : "text-[#00775B]")}>
                      {zone.dwellTime}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all",
                        breached ? "bg-[#E7000B]" : slaPercentage > 80 ? "bg-[#EA580C]" : "bg-[#00775B]"
                      )}
                      style={{ width: `${slaPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className={cn(
                    "text-xl font-mono font-bold",
                    zone.queueLength > 10 ? "text-[#E7000B]" : zone.queueLength > 5 ? "text-[#EA580C]" : "text-[#00775B]"
                  )}>
                    {zone.queueLength}
                  </div>
                  <div className="text-[8px] text-neutral-400 uppercase">Queue</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const IntrusionAlertGrid = () => {
  const restrictedZones = ZONE_CARDS.filter(z => z.app.includes("Intrusion") || z.app.includes("Hazardous"));

  return (
    <div className="bg-white rounded-md border border-neutral-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Restricted Zones Monitor</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {restrictedZones.map((zone) => (
          <div 
            key={zone.id}
            className={cn(
              "border rounded p-2 transition-all",
              zone.status === "violation" || zone.status === "critical"
                ? "border-[#E7000B] bg-[#FFE5E7] shadow-[0_0_15px_rgba(231,0,11,0.5)] animate-pulse"
                : "border-neutral-200 bg-white"
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-neutral-800">{zone.zoneName}</span>
              {zone.lastIncident && (
                <span className="text-[8px] font-bold text-red-600 uppercase">{zone.lastIncident}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-mono font-bold text-neutral-900">{zone.currentCount}</div>
                <div className="text-[8px] text-neutral-500 uppercase">Detected</div>
              </div>

              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                zone.status === "violation" || zone.status === "critical"
                  ? "bg-[#E7000B] text-white"
                  : "bg-[#E5FFEF] text-[#00A63E]"
              )}>
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="text-[9px] font-mono text-neutral-500 mt-2">{zone.camera}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ZoneDetailModal = ({ zone, open, onClose }: { zone: ZoneCardType | null; open: boolean; onClose: () => void }) => {
  if (!zone) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-5xl max-h-[90vh] bg-white rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-300" aria-describedby="zone-detail-description">
          <div className="flex h-[80vh]">
            {/* Left: Image */}
            <div className="w-1/2 bg-neutral-900 relative">
              <ImageWithFallback 
                src={zone.image}
                alt={zone.zoneName}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-neutral-900/90 backdrop-blur-sm text-white px-3 py-1.5 rounded text-xs font-bold uppercase">
                {zone.camera}
              </div>
            </div>

            {/* Right: Info */}
            <div className="w-1/2 p-6 overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Dialog.Title className="text-xl font-bold text-neutral-900 mb-1">{zone.zoneName}</Dialog.Title>
                  <Dialog.Description id="zone-detail-description" className="text-sm text-neutral-500">{zone.app}</Dialog.Description>
                </div>
                <Dialog.Close className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  <span className="text-2xl">&times;</span>
                </Dialog.Close>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                <span className={cn(
                  "inline-block px-3 py-1 rounded text-xs font-bold uppercase",
                  zone.status === "safe" && "bg-[#E5FFEF] text-[#00A63E]",
                  zone.status === "stagnant" && "bg-[#FEEFE7] text-[#EA580C]",
                  zone.status === "violation" && "bg-[#FFE5E7] text-[#E7000B]",
                  zone.status === "critical" && "bg-[#E7000B] text-white"
                )}>
                  {zone.status}
                </span>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-neutral-50 p-4 rounded">
                  <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Occupancy</div>
                  <div className="text-3xl font-mono font-bold text-[#00775B]">{zone.occupancy}%</div>
                  <div className="text-xs text-neutral-400 font-mono">{zone.currentCount} / {zone.maxCapacity}</div>
                </div>
                <div className="bg-neutral-50 p-4 rounded">
                  <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Avg Dwell Time</div>
                  <div className="text-3xl font-mono font-bold text-neutral-900">{zone.dwellTime}</div>
                </div>
                <div className="bg-neutral-50 p-4 rounded">
                  <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Queue Length</div>
                  <div className="text-3xl font-mono font-bold text-neutral-900">{zone.queueLength}</div>
                </div>
                <div className="bg-neutral-50 p-4 rounded">
                  <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Turnover Rate</div>
                  <div className="text-3xl font-mono font-bold text-neutral-900">{zone.turnoverRate}/hr</div>
                </div>
              </div>

              {/* Directional Flow */}
              {zone.directionalFlow && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-neutral-700 mb-3">Directional Flow</h3>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-[#E5FFF9] p-3 rounded">
                      <div className="text-xs text-neutral-600 mb-1">Inbound</div>
                      <div className="text-2xl font-mono font-bold text-[#00775B]">{zone.directionalFlow.inbound}%</div>
                    </div>
                    <div className="flex-1 bg-neutral-100 p-3 rounded">
                      <div className="text-xs text-neutral-600 mb-1">Outbound</div>
                      <div className="text-2xl font-mono font-bold text-neutral-700">{zone.directionalFlow.outbound}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sparkline Chart */}
              <div>
                <h3 className="text-sm font-bold text-neutral-700 mb-3">Live Occupancy (Last 20 mins)</h3>
                <div className="h-32 bg-neutral-50 rounded p-2 min-w-0">
                  <ResponsiveContainer width="100%" height={112} minHeight={112}>
                    <LineChart data={zone.sparklineData.map((value, i) => ({ index: i, value, time: `${i * 2}m` }))} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <RechartsTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-neutral-900/95 backdrop-blur-sm text-white px-3 py-2 rounded shadow-lg text-xs font-mono">
                                <div className="font-bold text-[#00775B] mb-1">{payload[0].payload.time} ago</div>
                                <div>Occupancy: <span className="font-bold">{payload[0].value}%</span></div>
                              </div>
                            );
                          }
                          return null;
                        }}
                        cursor={{ stroke: '#64748B', strokeWidth: 1, strokeDasharray: '3 3' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#00775B"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// Manager Application Filter Bar
const ManagerAppFilterBar = ({ 
  selectedFilter, 
  onFilterChange 
}: { 
  selectedFilter: AppCategory; 
  onFilterChange: (filter: AppCategory) => void;
}) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-md p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Application Focus</h3>
          <p className="text-[9px] text-neutral-400">Filter zones by application type to see relevant performance metrics</p>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {APP_FILTERS.map((filter) => {
          const zoneCount = filter.id === "all" 
            ? ZONE_CARDS.length 
            : ZONE_CARDS.filter(z => getZoneCategory(z.app) === filter.id).length;
          
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all",
                selectedFilter === filter.id
                  ? "bg-[#00775B] text-white shadow-md"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              {filter.icon}
              <span>{filter.label}</span>
              <span className={cn(
                "ml-1 px-1.5 py-0.5 rounded text-[8px] font-mono",
                selectedFilter === filter.id ? "bg-white/20" : "bg-neutral-200"
              )}>
                {zoneCount}
              </span>
            </button>
          );
        })}
      </div>
      
      {selectedFilter !== "all" && (
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div className="text-[9px] text-neutral-500">
            Showing <span className="font-bold text-neutral-700">{ZONE_CARDS.filter(z => getZoneCategory(z.app) === selectedFilter).length}</span> {APP_FILTERS.find(f => f.id === selectedFilter)?.label} zones
          </div>
          <button
            onClick={() => onFilterChange("all")}
            className="text-[9px] font-bold uppercase text-[#00775B] hover:text-[#00956D] transition-colors"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
};

// Manager Performance KPIs
const ManagerKPICards = () => {
  const totalZones = ZONE_CARDS.length;
  const avgUtilization = Math.round(ZONE_CARDS.reduce((acc, z) => acc + z.occupancy, 0) / totalZones);
  const avgTurnover = (ZONE_CARDS.reduce((acc, z) => acc + z.turnoverRate, 0) / totalZones).toFixed(1);
  
  // Calculate SLA compliance - zones under 5 min wait time
  const queueZones = ZONE_CARDS.filter(z => z.queueLength > 0);
  const slaCompliantZones = queueZones.filter(z => {
    const waitMins = parseInt(z.dwellTime.split('m')[0]);
    return waitMins <= 5;
  });
  const slaCompliance = queueZones.length > 0 
    ? Math.round((slaCompliantZones.length / queueZones.length) * 100) 
    : 100;

  const kpis = [
    { label: "Total Zones", value: totalZones, unit: "zones", status: "neutral", trend: "+2 vs last week" },
    { label: "Avg Utilization", value: avgUtilization, unit: "%", status: avgUtilization >= 60 ? "optimal" : "understaffed", trend: avgUtilization >= 60 ? "+5% vs 7D" : "-8% vs 7D" },
    { label: "Avg Turnover", value: avgTurnover, unit: "/hr", status: "optimal", trend: "+12% vs 7D" },
    { label: "Queue SLA Compliance", value: slaCompliance, unit: "%", status: slaCompliance >= 85 ? "optimal" : "understaffed", trend: slaCompliance >= 85 ? "+3% vs 7D" : "-15% vs 7D" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="bg-white border border-neutral-200 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{kpi.label}</h3>
            <div className={cn(
              "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded",
              kpi.status === "optimal" && "bg-[#E5FFF9] text-[#00775B]",
              kpi.status === "understaffed" && "bg-[#FEEFE7] text-[#EA580C]",
              kpi.status === "neutral" && "bg-neutral-100 text-neutral-600"
            )}>
              {kpi.status === "optimal" ? "Optimal" : kpi.status === "understaffed" ? "At Risk" : "Active"}
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-3xl font-mono font-bold text-neutral-900">{kpi.value}</span>
            <span className="text-sm font-mono text-neutral-500">{kpi.unit}</span>
          </div>
          <div className="text-[9px] font-mono font-medium text-neutral-400">{kpi.trend}</div>
        </div>
      ))}
    </div>
  );
};

// Zone Efficiency Table with App-Specific Columns
const ZoneEfficiencyTable = ({ 
  onZoneClick,
  appFilter = "all" 
}: { 
  onZoneClick: (zone: ZoneCardType) => void;
  appFilter?: AppCategory;
}) => {
  const getStaffingStatus = (zone: ZoneCardType) => {
    if (zone.occupancy > 85 && zone.queueLength > 10) return "Understaffed";
    if (zone.occupancy < 40) return "Over-resourced";
    return "Optimal";
  };

  const getSLACompliance = (zone: ZoneCardType) => {
    if (zone.queueLength === 0) return 100;
    const waitMins = parseInt(zone.dwellTime.split('m')[0]);
    return waitMins <= 5 ? 95 : waitMins <= 8 ? 75 : 45;
  };

  const getDetectionFrequency = (zone: ZoneCardType) => {
    // For intrusion/security zones
    return zone.status === "critical" || zone.status === "violation" ? "High" : "Low";
  };

  const getActionRecommendation = (zone: ZoneCardType) => {
    const staffingStatus = getStaffingStatus(zone);
    const slaCompliance = getSLACompliance(zone);
    const category = getZoneCategory(zone.app);

    if (staffingStatus === "Understaffed" && slaCompliance < 75) {
      return { type: "schedule", label: "Export Schedule", color: "text-[#EA580C]" };
    }
    if (category === "intrusion" && (zone.status === "critical" || zone.status === "violation")) {
      return { type: "security", label: "Review Security", color: "text-[#E7000B]" };
    }
    if (staffingStatus === "Over-resourced") {
      return { type: "optimize", label: "Optimize Resources", color: "text-[#E19A04]" };
    }
    return { type: "view", label: "View Details", color: "text-[#00775B]" };
  };

  // Filter zones by app category
  const filteredZones = appFilter === "all" 
    ? ZONE_CARDS 
    : ZONE_CARDS.filter(zone => getZoneCategory(zone.app) === appFilter);

  // Determine which columns to show based on app filter
  const showStaffingColumn = appFilter === "all" || appFilter === "queue" || appFilter === "mustering";
  const showSLAColumn = appFilter === "all" || appFilter === "queue";
  const showDetectionColumn = appFilter === "intrusion";
  const showAvgWaitColumn = appFilter === "queue";

  return (
    <div className="bg-white border border-neutral-200 rounded-md shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Zone Performance Matrix</h3>
          <p className="text-[9px] text-neutral-500 mt-0.5 font-mono">
            {appFilter === "all" && "All applications • Staffing & SLA focused"}
            {appFilter === "queue" && "Queue Management • Wait time & SLA optimized"}
            {appFilter === "intrusion" && "Security Zones • Detection frequency focused"}
            {appFilter !== "all" && appFilter !== "queue" && appFilter !== "intrusion" && `${APP_FILTERS.find(f => f.id === appFilter)?.label} • Application-specific metrics`}
          </p>
        </div>
        <div className="text-[9px] font-mono text-neutral-500">
          Showing <span className="font-bold text-neutral-700">{filteredZones.length}</span> zones
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-600">Zone Name</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                {showAvgWaitColumn ? "Avg Wait Time" : "Avg Dwell Time"}
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-600">Peak Count</th>
              {showStaffingColumn && (
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-600">Staffing Status</th>
              )}
              {showDetectionColumn && (
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-600">Detection Freq</th>
              )}
              {showSLAColumn && (
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-600">SLA Compliance</th>
              )}
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-600">7-Day Trend</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredZones.map((zone, index) => {
              const staffingStatus = getStaffingStatus(zone);
              const slaCompliance = getSLACompliance(zone);
              const detectionFreq = getDetectionFrequency(zone);
              const actionRec = getActionRecommendation(zone);
              
              return (
                <tr key={zone.id} className={cn(
                  "border-b border-neutral-100 hover:bg-neutral-50 transition-colors",
                  index % 2 === 0 ? "bg-white" : "bg-neutral-50/30"
                )}>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-800">{zone.zoneName}</span>
                      <span className="text-[9px] font-mono text-neutral-500">{zone.app}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono font-bold text-neutral-900">{zone.dwellTime}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono font-bold text-neutral-900">{zone.maxCapacity}</span>
                  </td>
                  {showStaffingColumn && (
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-[9px] font-bold uppercase px-2 py-1 rounded",
                        staffingStatus === "Optimal" && "bg-[#E5FFF9] text-[#00775B]",
                        staffingStatus === "Understaffed" && "bg-[#FEEFE7] text-[#EA580C]",
                        staffingStatus === "Over-resourced" && "bg-neutral-100 text-neutral-600"
                      )}>
                        {staffingStatus}
                      </span>
                    </td>
                  )}
                  {showDetectionColumn && (
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-[9px] font-bold uppercase px-2 py-1 rounded",
                        detectionFreq === "High" && "bg-[#FFE5E7] text-[#E7000B]",
                        detectionFreq === "Low" && "bg-[#E5FFF9] text-[#00775B]"
                      )}>
                        {detectionFreq}
                      </span>
                    </td>
                  )}
                  {showSLAColumn && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-neutral-900">{slaCompliance}%</span>
                        <div className="flex-1 max-w-[60px] bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full",
                              slaCompliance >= 90 ? "bg-[#00A63E]" : slaCompliance >= 75 ? "bg-[#EA580C]" : "bg-[#E7000B]"
                            )}
                            style={{ width: `${slaCompliance}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="w-20 h-8">
                      <ResponsiveContainer width="100%" height={32} minHeight={32}>
                        <LineChart data={zone.sparklineData.map((v, i) => ({ index: i, value: v, time: `${i * 2}m` }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                          <RechartsTooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-neutral-900/95 backdrop-blur-sm text-white px-2 py-1 rounded shadow-lg text-[9px] font-mono">
                                    <div className="font-bold">{payload[0].payload.time} ago</div>
                                    <div>Occupancy: <span className="font-bold text-[#00775B]">{payload[0].value}%</span></div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                            cursor={{ stroke: '#64748B', strokeWidth: 1, strokeDasharray: '3 3' }}
                          />
                          <Line type="monotone" dataKey="value" stroke="#00775B" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onZoneClick(zone)}
                        className={cn(
                          "text-[9px] font-bold uppercase hover:underline transition-colors",
                          actionRec.color
                        )}
                      >
                        {actionRec.label}
                      </button>
                      {actionRec.type === "schedule" && (
                        <span className="text-[8px] px-1.5 py-0.5 bg-[#FEEFE7] text-[#EA580C] rounded font-bold uppercase">
                          ⚠️
                        </span>
                      )}
                      {actionRec.type === "security" && (
                        <span className="text-[8px] px-1.5 py-0.5 bg-[#FFE5E7] text-[#E7000B] rounded font-bold uppercase">
                          🚨
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Action Summary Footer */}
      {filteredZones.some(z => {
        const rec = getActionRecommendation(z);
        return rec.type === "schedule" || rec.type === "security";
      }) && (
        <div className="px-4 py-3 bg-[#FFF7E6] border-t border-[#E19A04]/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Recommended Actions
              </h4>
              <div className="space-y-1">
                {filteredZones.filter(z => getActionRecommendation(z).type === "schedule").length > 0 && (
                  <p className="text-[9px] text-neutral-600">
                    <span className="font-bold text-[#EA580C]">
                      {filteredZones.filter(z => getActionRecommendation(z).type === "schedule").length} zones
                    </span> require staffing optimization. Consider exporting a revised schedule.
                  </p>
                )}
                {filteredZones.filter(z => getActionRecommendation(z).type === "security").length > 0 && (
                  <p className="text-[9px] text-neutral-600">
                    <span className="font-bold text-[#E7000B]">
                      {filteredZones.filter(z => getActionRecommendation(z).type === "security").length} security zones
                    </span> show high detection frequency. Review coverage and protocols.
                  </p>
                )}
              </div>
            </div>
            <button className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-[9px] font-bold uppercase rounded transition-colors">
              Export Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Weekly Hotspot Heatmap (7x24 grid)
const WeeklyHotspotHeatmap = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Generate mock density data
  const generateDensityData = () => {
    return days.map((day, dayIndex) => 
      hours.map((hour) => {
        // Simulate peak hours (9-17) and weekday patterns
        const isWeekday = dayIndex < 5;
        const isPeakHour = hour >= 9 && hour <= 17;
        const baseValue = isWeekday && isPeakHour ? 60 + Math.random() * 30 : Math.random() * 40;
        return Math.round(baseValue);
      })
    );
  };

  const densityData = generateDensityData();

  const getDensityColor = (value: number) => {
    if (value >= 80) return "#EF4444"; // Hot - Red
    if (value >= 60) return "#F59E0B"; // Warm - Amber
    if (value >= 40) return "#00956D"; // Normal - Primary Light
    return "#E5E7EB"; // Cold - Neutral
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-md shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-[#00775B]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Weekly Hotspot Heatmap</h3>
        <span className="text-[9px] text-neutral-400 font-mono">(Accumulated Density - 7D x 24H)</span>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Hour labels */}
          <div className="flex mb-1">
            <div className="w-12" /> {/* Day label spacer */}
            {hours.map((hour) => (
              <div key={hour} className="w-6 text-center">
                {hour % 3 === 0 && <span className="text-[8px] font-mono text-neutral-400">{hour}</span>}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {days.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-1">
              <div className="w-12 text-[9px] font-bold text-neutral-600 uppercase">{day}</div>
              <div className="flex gap-0.5">
                {densityData[dayIndex].map((value, hourIndex) => (
                  <div
                    key={hourIndex}
                    className="w-6 h-4 rounded-sm cursor-pointer hover:ring-2 hover:ring-[#00775B] transition-all group relative"
                    style={{ backgroundColor: getDensityColor(value) }}
                    title={`${day} ${hourIndex}:00 - Density: ${value}%`}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-neutral-900 text-white text-[8px] font-mono px-2 py-1 rounded whitespace-nowrap z-10">
                      {day} {hourIndex}:00<br />{value}% density
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-neutral-200">
            <span className="text-[9px] font-bold uppercase text-neutral-500 tracking-wider">Density:</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-sm bg-[#E5E7EB]" />
                <span className="text-[9px] text-neutral-600">Low (&lt;40%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-sm bg-[#00956D]" />
                <span className="text-[9px] text-neutral-600">Normal (40-60%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-sm bg-[#F59E0B]" />
                <span className="text-[9px] text-neutral-600">Warm (60-80%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-sm bg-[#EF4444]" />
                <span className="text-[9px] text-neutral-600">Hot (&gt;80%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// SLA Breach Trend Chart
const SLABreachTrend = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const breachData = days.map((day, i) => ({
    day,
    breaches: Math.floor(Math.random() * 15) + (i === 1 ? 20 : 5), // Tuesday spike
    color: i === 1 ? "#EF4444" : "#F59E0B"
  }));

  return (
    <div className="bg-white border border-neutral-200 rounded-md shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">SLA Breach Frequency (7D)</h3>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height={192} minHeight={192}>
          <BarChart data={breachData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 10, fill: "#737373" }} 
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: "#737373", fontFamily: "Geist Mono, monospace" }} 
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <RechartsTooltip 
              contentStyle={{ 
                backgroundColor: "#1F2937", 
                border: "none", 
                borderRadius: "4px", 
                fontSize: "10px",
                fontFamily: "Geist Mono, monospace"
              }}
              labelStyle={{ color: "#F9FAFB", fontWeight: "bold" }}
              itemStyle={{ color: "#F9FAFB" }}
            />
            <Bar dataKey="breaches" radius={[4, 4, 0, 0]}>
              {breachData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-neutral-200 text-[9px] text-neutral-500">
        <span className="font-bold">Insight:</span> Tuesday shows 2.5x higher breach rate. Consider additional staffing for 10AM-2PM shift block.
      </div>
    </div>
  );
};

// Dwell Time Distribution
const DwellTimeDistribution = () => {
  const distributionData = [
    { name: "<5 min", value: 35, color: "#00956D" },
    { name: "5-15 min", value: 40, color: "#60A5FA" },
    { name: "15-30 min", value: 18, color: "#F59E0B" },
    { name: ">30 min", value: 7, color: "#EF4444" },
  ];

  return (
    <div className="bg-white border border-neutral-200 rounded-md shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-[#00775B]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Dwell Time Distribution</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="h-40 flex items-center justify-center">
          <ResponsiveContainer width="100%" height={160} minHeight={160}>
            <RechartsPieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: "#1F2937", 
                  border: "none", 
                  borderRadius: "4px", 
                  fontSize: "10px",
                  fontFamily: "Geist Mono, monospace"
                }}
                itemStyle={{ color: "#F9FAFB" }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col justify-center space-y-2">
          {distributionData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-medium text-neutral-600">{item.name}</span>
              </div>
              <span className="text-xs font-mono font-bold text-neutral-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-neutral-200 text-[9px] text-neutral-500">
        <span className="font-bold">Note:</span> 25% of visitors exceed 15 min dwell time, indicating potential loitering or engagement opportunities.
      </div>
    </div>
  );
};

export const ZoneAnalytics = ({ persona }: { persona: Persona }) => {
  const [selectedZone, setSelectedZone] = useState<ZoneCardType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [appFilter, setAppFilter] = useState<AppCategory>("all");
  const [selectedZoneIds, setSelectedZoneIds] = useState<Set<string>>(new Set());
  const [highlightedZoneId, setHighlightedZoneId] = useState<string | null>(null);
  const zoneRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleZoneClick = (zone: ZoneCardType) => {
    setSelectedZone(zone);
    setModalOpen(true);
    
    // Highlight and scroll to zone card when clicked from map
    setHighlightedZoneId(zone.id);
    setTimeout(() => {
      const element = zoneRefs.current.get(zone.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    
    // Clear highlight after 3 seconds
    setTimeout(() => {
      setHighlightedZoneId(null);
    }, 3000);
  };

  const handleZoneToggle = (zoneId: string) => {
    const newSet = new Set(selectedZoneIds);
    if (newSet.has(zoneId)) {
      newSet.delete(zoneId);
    } else {
      newSet.add(zoneId);
    }
    setSelectedZoneIds(newSet);
  };

  const handleClearZones = () => {
    setSelectedZoneIds(new Set());
  };

  // Filter zones by app category
  let filteredZones = appFilter === "all" 
    ? ZONE_CARDS 
    : ZONE_CARDS.filter(zone => getZoneCategory(zone.app) === appFilter);

  // Further filter by selected zone IDs
  if (selectedZoneIds.size > 0) {
    filteredZones = filteredZones.filter(zone => selectedZoneIds.has(zone.id));
  }

  // Sort: ALWAYS show high-priority alerts (critical/violation) first, regardless of filters
  // Priority order: Critical → Violation → Stagnant → Safe
  const sortedZones = [...filteredZones].sort((a, b) => {
    // Define priority mapping (lower number = higher priority = appears first)
    const statusPriority: Record<ZoneStatus, number> = { 
      critical: 0, 
      violation: 1, 
      stagnant: 2, 
      safe: 3 
    };
    
    // Get priorities (ensure critical is always 0)
    const priorityA = statusPriority[a.status] ?? 99;
    const priorityB = statusPriority[b.status] ?? 99;
    
    // Sort by status priority first (critical zones MUST appear first)
    if (priorityA !== priorityB) {
      return priorityA - priorityB; // Ascending: 0 (critical) comes before 1 (violation), etc.
    }
    
    // Within same status, pinned items come first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Finally, sort by occupancy (higher occupancy first)
    return b.occupancy - a.occupancy;
  });

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AnalyticsHeader 
        title="Zone Analytics" 
        icon={MapPin} 
        defaultGranularity={persona === "manager" ? "1w" : "1d"}
      />

      {/* Live Violations Ticker */}
      {persona === "monitoring" && <ZoneViolationsTicker />}

      {/* Monitoring Staff: Risk Grid View */}
      {persona === "monitoring" && (
        <div className="space-y-4">
          {/* Level 1: Global Triage - Floor Plan Map (Left) + At-Risk Zones Sidebar (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <LiveZoneOccupancyMap 
                onZoneClick={handleZoneClick} 
                highlightedZone={highlightedZoneId}
              />
            </div>
            <div>
              <AtRiskZonesSidebar onViewCamera={handleZoneClick} />
            </div>
          </div>

          {/* Level 2: Filter Logic Bridge - App & Zone Filters */}
          <AppFilterBar 
            selectedFilter={appFilter} 
            onFilterChange={setAppFilter}
            selectedZones={selectedZoneIds}
            onZoneToggle={handleZoneToggle}
            onClearZones={handleClearZones}
          />

          {/* Level 3: Action Matrix - Adaptive Zone Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">
                {appFilter === "all" && selectedZoneIds.size === 0 && "All Zones Matrix"}
                {appFilter !== "all" && selectedZoneIds.size === 0 && `${APP_FILTERS.find(f => f.id === appFilter)?.label} Zones`}
                {selectedZoneIds.size > 0 && appFilter === "all" && `${selectedZoneIds.size} Selected Zone${selectedZoneIds.size > 1 ? 's' : ''}`}
                {selectedZoneIds.size > 0 && appFilter !== "all" && `${selectedZoneIds.size} ${APP_FILTERS.find(f => f.id === appFilter)?.label} Zone${selectedZoneIds.size > 1 ? 's' : ''}`}
              </h3>
              <div className="text-[10px] font-mono text-neutral-500">
                Showing {sortedZones.length} of {ZONE_CARDS.length} zones
              </div>
            </div>
            
            {sortedZones.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {sortedZones.map((zone) => (
                  <AdaptiveZoneCard 
                    key={zone.id}
                    zone={zone}
                    onClick={() => handleZoneClick(zone)}
                    isHighlighted={highlightedZoneId === zone.id}
                    scrollRef={(el) => {
                      if (el) zoneRefs.current.set(zone.id, el);
                      else zoneRefs.current.delete(zone.id);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-neutral-200 rounded-md p-8 text-center">
                <AlertTriangle className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-neutral-400">No zones match your filter criteria</p>
                <p className="text-xs text-neutral-400 mt-1">Try adjusting your application or zone filters</p>
              </div>
            )}
          </div>

          {/* Queue Management & Intrusion Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <QueueManagementPanel />
            <IntrusionAlertGrid />
          </div>
        </div>
      )}

      {/* Manager: Operational Efficiency View */}
      {persona === "manager" && (
        <div className="space-y-4">
          {/* KPI Cards with Live View Toggle */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <ManagerKPICards />
            </div>
            <button
              onClick={() => window.location.reload()} // In real app, this would switch persona to monitoring
              className="shrink-0 flex items-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md transition-colors shadow-md border border-neutral-700"
            >
              <Activity className="w-4 h-4" />
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider">Switch to</div>
                <div className="text-xs font-bold">Live Map View</div>
              </div>
            </button>
          </div>

          {/* Application Filter Bar */}
          <ManagerAppFilterBar 
            selectedFilter={appFilter}
            onFilterChange={setAppFilter}
          />

          {/* Zone Efficiency Table with App-Specific Columns */}
          <ZoneEfficiencyTable 
            onZoneClick={handleZoneClick}
            appFilter={appFilter}
          />

          {/* Strategic Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WeeklyHotspotHeatmap />
            <SLABreachTrend />
          </div>

          {/* Pattern Detection */}
          <DwellTimeDistribution />
        </div>
      )}

      {/* Zone Detail Modal */}
      <ZoneDetailModal zone={selectedZone} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};