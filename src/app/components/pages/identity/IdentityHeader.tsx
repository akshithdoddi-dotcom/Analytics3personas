import { useState, useRef, useEffect } from "react";
import { Fingerprint, ChevronDown, Download, Clock, Check, RefreshCw } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { Persona } from "@/app/components/dashboard/PersonaSwitcher";
import type { IdentityTerminology } from "../IdentityAnalytics";

type IdentityAppOption = {
  id: string;
  label: string;
};

const APP_OPTIONS: IdentityAppOption[] = [
  { id: "facial-hq",       label: "Facial Recognition – HQ Main Entrance" },
  { id: "facial-gate-b",   label: "Facial Recognition – Gate B" },
  { id: "lpr-gate-a",      label: "License Plate Recognition – Gate A" },
  { id: "lpr-parking",     label: "License Plate Recognition – Parking Lot" },
];

const TIME_RANGES: Record<Persona, string[]> = {
  monitoring: ["15m", "1h", "6h", "24h"],
  manager:    ["Today", "This Week"],
  director:   ["This Month", "This Quarter"],
};

const REFRESH_INTERVALS = ["5s", "15s", "30s", "1 min"];

interface IdentityHeaderProps {
  persona: Persona;
  terminology: IdentityTerminology;
  activeAppId: string;
  onAppChange: (appId: string) => void;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export const IdentityHeader = ({
  persona,
  terminology,
  activeAppId,
  onAppChange,
  timeRange,
  onTimeRangeChange,
}: IdentityHeaderProps) => {
  const [isAppOpen, setIsAppOpen]           = useState(false);
  const [isExportOpen, setIsExportOpen]     = useState(false);
  const [isRefreshOpen, setIsRefreshOpen]   = useState(false);
  const [refreshInterval, setRefreshInterval] = useState("15s");
  const [secondsAgo, setSecondsAgo]         = useState(2);
  const appRef     = useRef<HTMLDivElement>(null);
  const exportRef  = useRef<HTMLDivElement>(null);
  const refreshRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (persona !== "monitoring") return;
    const id = setInterval(() => setSecondsAgo((s) => (s >= 30 ? 2 : s + 1)), 1000);
    return () => clearInterval(id);
  }, [persona]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (appRef.current && !appRef.current.contains(e.target as Node)) setIsAppOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setIsExportOpen(false);
      if (refreshRef.current && !refreshRef.current.contains(e.target as Node)) setIsRefreshOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const ranges = TIME_RANGES[persona];
  const activeApp = APP_OPTIONS.find((o) => o.id === activeAppId) ?? APP_OPTIONS[0];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 bg-white border border-neutral-200 rounded-md px-4 py-3 shadow-sm">
      {/* Left: Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#E5FFF9] text-[#00775B] rounded-sm">
          <Fingerprint className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-800">
            Identity Analytics
          </h2>
          <p className="text-[10px] uppercase tracking-wider mt-0.5 text-[#00775B]">
            {terminology.appLabel}
          </p>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* App / Site Selector */}
        <div className="relative" ref={appRef}>
          <button
            onClick={() => setIsAppOpen(!isAppOpen)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs font-bold transition-all bg-white text-neutral-600 hover:border-neutral-300 max-w-[220px]",
              isAppOpen ? "border-[#00775B]" : "border-neutral-200"
            )}
          >
            <span className="truncate">{activeApp.label}</span>
            <ChevronDown className={cn("w-3 h-3 shrink-0 transition-transform", isAppOpen && "rotate-180")} />
          </button>
          {isAppOpen && (
            <div className="absolute top-full left-0 mt-1 w-72 rounded-sm border border-neutral-200 bg-white shadow-lg z-50 overflow-hidden">
              {APP_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => { onAppChange(opt.id); setIsAppOpen(false); }}
                  className={cn(
                    "px-3 py-2 text-xs font-medium cursor-pointer flex items-center justify-between text-neutral-600 hover:bg-neutral-50",
                    activeAppId === opt.id && "text-[#00775B]"
                  )}
                >
                  <span>{opt.label}</span>
                  {activeAppId === opt.id && <Check className="w-3 h-3 shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auto-refresh (monitoring only) */}
        {persona === "monitoring" && (
          <div className="relative" ref={refreshRef}>
            <button
              onClick={() => setIsRefreshOpen(!isRefreshOpen)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-bold transition-all bg-white text-neutral-600 hover:border-neutral-300",
                isRefreshOpen ? "border-[#00775B]" : "border-neutral-200"
              )}
            >
              <RefreshCw className="w-3 h-3" />
              <span>{refreshInterval}</span>
              <ChevronDown className={cn("w-3 h-3 transition-transform", isRefreshOpen && "rotate-180")} />
            </button>
            {isRefreshOpen && (
              <div className="absolute top-full left-0 mt-1 w-28 rounded-sm border border-neutral-200 bg-white shadow-lg z-50 overflow-hidden">
                {REFRESH_INTERVALS.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => { setRefreshInterval(opt); setIsRefreshOpen(false); }}
                    className={cn(
                      "px-3 py-2 text-xs font-medium cursor-pointer flex items-center justify-between text-neutral-600 hover:bg-neutral-50",
                      refreshInterval === opt && "text-[#00775B]"
                    )}
                  >
                    <span>{opt}</span>
                    {refreshInterval === opt && <Check className="w-3 h-3" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Time Range Pills */}
        <div className="flex items-center rounded-sm border border-neutral-200 bg-white p-0.5 shadow-sm">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onTimeRangeChange(r)}
              className={cn(
                "px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-sm transition-all",
                timeRange === r
                  ? "bg-[#00775B] text-white shadow-sm"
                  : "text-neutral-500 hover:bg-neutral-50"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Export */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-neutral-200 bg-white text-xs font-bold text-neutral-600 hover:border-neutral-300 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className={cn("w-3 h-3 transition-transform", isExportOpen && "rotate-180")} />
          </button>
          {isExportOpen && (
            <div className="absolute top-full right-0 mt-1 w-40 rounded-sm border border-neutral-200 bg-white shadow-lg z-50 overflow-hidden">
              {["PDF Report", "CSV Data", "PNG Image"].map((opt) => (
                <div
                  key={opt}
                  onClick={() => setIsExportOpen(false)}
                  className="px-3 py-2 text-xs font-medium cursor-pointer text-neutral-600 hover:bg-neutral-50"
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-neutral-200 bg-neutral-50 text-[10px] font-mono text-neutral-500">
          {persona === "monitoring" ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#00775B] animate-pulse" />
              <span>Updated {secondsAgo}s ago</span>
            </>
          ) : (
            <>
              <Clock className="w-3 h-3" />
              <span>{persona === "manager" ? "As of today" : "Apr 2026"}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
