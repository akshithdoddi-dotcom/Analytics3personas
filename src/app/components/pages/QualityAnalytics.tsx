import { Activity, HardDrive, Wifi, ShieldCheck, CheckCircle2, Clock, AlertOctagon, TrendingUp, AlertTriangle, Monitor, LineChart } from "lucide-react";
import { Persona } from "../dashboard/PersonaSwitcher";
import { cn } from "@/app/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart as RechartsLineChart, Line, XAxis, YAxis, ReferenceLine } from "recharts";
import { SYSTEM_NODES, DEFECT_DISTRIBUTION, SYSTEM_HEALTH_GRID_DATA, MODEL_ACCURACY_DATA } from "@/app/data/mockData";
import { AnalyticsHeader } from "./AnalyticsHeader";

export const QualityAnalytics = ({ persona }: { persona: Persona }) => {
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AnalyticsHeader title="Quality Analytics" icon={ShieldCheck} />

      {/* Staff View: System Health Grid (10x10) */}
      {persona === "monitoring" && (
        <div className="bg-white p-6 rounded-md border border-neutral-200 shadow-sm flex flex-col justify-between min-h-[400px]">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                 <Monitor className="w-4 h-4 text-[#00775B]" />
                 System Health Matrix (100 Nodes)
              </h3>
              <div className="flex items-center gap-4 text-xs font-mono">
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-[#00956D] rounded-full" /> Healthy</div>
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-500 rounded-full" /> Offline</div>
              </div>
           </div>

           <div className="grid grid-cols-10 gap-2 md:gap-3 flex-1">
              {SYSTEM_HEALTH_GRID_DATA.map((node) => (
                 <div 
                    key={node.id} 
                    className={cn(
                       "aspect-square rounded-full transition-all duration-300 relative group cursor-pointer hover:scale-125 hover:shadow-lg hover:z-10 flex items-center justify-center",
                       node.status === "healthy" ? "bg-[#00956D] hover:bg-[#00775B]" : "bg-red-500 hover:bg-red-600 animate-pulse"
                    )}
                 >
                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl font-mono">
                       <span className="font-bold block mb-0.5">{node.id}</span>
                       <span className="text-neutral-300 block">Latency: {node.latency}ms</span>
                       <span className={node.status === "healthy" ? "text-green-400" : "text-red-400"}>{node.status.toUpperCase()}</span>
                    </div>
                 </div>
              ))}
           </div>
           
           <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-between text-xs text-neutral-500 font-bold uppercase tracking-wide">
              <span>Total Uptime: 98.4%</span>
              <span>Active Alerts: {SYSTEM_HEALTH_GRID_DATA.filter(n => n.status === "offline").length}</span>
           </div>
        </div>
      )}

      {/* Manager View: Model Accuracy Trend */}
      {persona === "manager" && (
        <div className="bg-white p-6 rounded-md border border-neutral-200 shadow-sm min-h-[320px] flex flex-col animate-in fade-in zoom-in-95 duration-300">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                 <Activity className="w-4 h-4 text-[#00775B]" />
                 AI Model Accuracy Trend (Confidence Score)
              </h3>
              <span className="text-[10px] font-bold text-[#00775B] bg-[#E5FFF9] px-2 py-1 rounded-full uppercase tracking-wide">Last 6 Months</span>
           </div>

           <div className="flex-1 w-full min-h-[200px] min-w-0">
             <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
               <RechartsLineChart data={MODEL_ACCURACY_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                 <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                 <YAxis domain={[90, 100]} stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                 <Tooltip 
                   contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '10px' }}
                   formatter={(value: number) => [`${value}%`, "Accuracy"]}
                 />
                 <Line 
                   type="monotone" 
                   dataKey="score" 
                   stroke="#00775B" 
                   strokeWidth={3} 
                   dot={{ r: 4, fill: "white", stroke: "#00775B", strokeWidth: 2 }} 
                   activeDot={{ r: 6, fill: "#00775B", stroke: "white", strokeWidth: 2 }}
                 />
                 <ReferenceLine y={98} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Target', fill: '#EF4444', fontSize: 10 }} />
               </RechartsLineChart>
             </ResponsiveContainer>
           </div>
           
           <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500 italic bg-neutral-50 p-2 rounded border border-neutral-100">
              <AlertTriangle className="w-3 h-3 text-yellow-500" />
              <span>Dip in April correlated with "LPR Engine" lens obstruction. Recalibration confirmed in May.</span>
           </div>
        </div>
      )}

      {/* Director View: Global Compliance Score & Defect Distribution (Existing) */}
      {persona === "director" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          
          {/* Global Compliance Score Gauge */}
          <div className="bg-white p-6 rounded-md border border-neutral-200 shadow-sm flex flex-col items-center justify-center min-h-[320px]">
             <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 mb-2 w-full text-left">Global Compliance Score</h3>
             
             <div className="relative w-64 h-64">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                   <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                   <circle 
                      cx="50" cy="50" r="45" fill="none" stroke="#00956D" strokeWidth="8" 
                      strokeDasharray="283" strokeDashoffset="5" /* 98.2% approx */
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_10px_rgba(0,149,109,0.3)] animate-in spin-in-90 duration-1000"
                   />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-5xl font-mono font-bold text-[#00956D]">98.2%</span>
                   <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 mt-2">Excellent</span>
                </div>
             </div>
             
             <div className="w-full mt-4 bg-[#E5FFF9] border border-[#00956D]/20 p-3 rounded-md flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#00775B]" />
                <p className="text-[11px] text-neutral-600 font-medium leading-tight">
                   Audit successfully passed for <span className="font-bold text-[#00775B]">42/43</span> sites. Next audit scheduled for Q2.
                </p>
             </div>
          </div>
  
          {/* Defect Type Distribution */}
          <div className="bg-white p-6 rounded-md border border-neutral-200 shadow-sm flex flex-col min-h-[320px]">
             <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 mb-6 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-neutral-500" />
                Defect Type Distribution
             </h3>
  
             <div className="h-64 w-full min-w-0">
               <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                 <PieChart>
                   <Pie
                     data={DEFECT_DISTRIBUTION}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={2}
                     dataKey="value"
                     stroke="none"
                   >
                     {DEFECT_DISTRIBUTION.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '4px' }} />
                   <Legend 
                      layout="vertical" 
                      verticalAlign="middle" 
                      align="right"
                      iconType="circle"
                      formatter={(value, entry: any) => <span className="text-xs font-bold text-neutral-600 ml-1 uppercase tracking-wide">{value} ({entry.payload.value}%)</span>}
                   />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             
             <div className="mt-4 pt-4 border-t border-neutral-100 text-xs text-neutral-400 italic text-center">
                * Showing aggregate defects from last 30 days.
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
