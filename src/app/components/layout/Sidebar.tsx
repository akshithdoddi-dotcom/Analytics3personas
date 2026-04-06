import { cn } from "@/app/lib/utils";
import { LayoutDashboard, AlertTriangle, Users, MapPin, Activity, Settings, ScanFace, CarFront, Video, Ruler, ClipboardCheck, Fingerprint } from "lucide-react";
import Group17 from "../../../imports/Group17";

export type Page = "dashboard" | "volume" | "incident" | "zone" | "quality" | "identity" | "facial-recognition" | "license-plates" | "cameras" | "metrics" | "compliance";

interface SidebarProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
}

const menuItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", badge: 0 },
  { id: "volume", icon: Users, label: "Volume Analytics", badge: 0 },
  { id: "incident", icon: AlertTriangle, label: "Incident Analytics", badge: 3 },
  { id: "zone", icon: MapPin, label: "Zone Analytics", badge: 0 },
  { id: "quality", icon: Activity, label: "Quality Analytics", badge: 0 },
  { id: "identity", icon: Fingerprint, label: "Identity Analytics", badge: 0 },
  { id: "facial-recognition", icon: ScanFace, label: "Facial Recognition", badge: 0 },
  { id: "license-plates", icon: CarFront, label: "License Plates", badge: 0 },
  { id: "cameras", icon: Video, label: "Cameras", badge: 0 },
  { id: "metrics", icon: Ruler, label: "Metrics & Rules", badge: 0 },
  { id: "compliance", icon: ClipboardCheck, label: "Compliance", badge: 0 },
];

export const Sidebar = ({ activePage, onPageChange }: SidebarProps) => {
  return (
    <aside className="hidden lg:flex w-56 flex-col bg-[#021d18] border-r border-[#00775B]/20 h-screen fixed left-0 top-0 z-40 text-neutral-300 shadow-xl">
      <div className="p-6">
        <div className="h-8">
          <Group17 />
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id as Page)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-[#00775B]/10 text-white" 
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {/* Active Indicator Line */}
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-white rounded-r-sm shadow-[0_0_4px_rgba(255,255,255,0.5)]" />}
              
              {/* Hover Indicator Line (Subtle) */}
              {!isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#00775B] rounded-r-sm opacity-0 group-hover:opacity-100 transition-opacity" />}

              <div className="flex items-center gap-3 relative z-10 w-full pr-6">
                <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-white drop-shadow-sm" : "text-neutral-500 group-hover:text-neutral-200")} />
                <span className={cn(
                  "text-left leading-tight block truncate", 
                  isActive && "font-bold"
                )}>
                  {item.label}
                </span>
              </div>
              {item.badge > 0 && (
                <div className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md",
                  "bg-red-600 text-white animate-in zoom-in duration-300"
                )}>
                  {item.badge}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 mt-auto border-t border-white/5 bg-[#011512]">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors mb-2">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>
        
        <div className="flex items-center gap-3 px-3 py-3 rounded-sm bg-[#00775B] text-white shadow-lg hover:bg-[#00624b] transition-colors cursor-pointer group">
           <div className="h-8 w-8 rounded bg-[#00503d] flex items-center justify-center font-bold text-xs shadow-inner text-white group-hover:scale-105 transition-transform">
              AU
           </div>
           <div className="flex-1 overflow-hidden">
             <p className="text-sm font-bold truncate group-hover:text-white transition-colors">Admin User</p>
             <p className="text-[10px] text-white/70 uppercase font-semibold group-hover:text-white/90">Security Admin</p>
           </div>
        </div>
      </div>
    </aside>
  );
};
