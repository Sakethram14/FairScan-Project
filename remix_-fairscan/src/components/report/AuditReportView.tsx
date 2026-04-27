import { useState } from "react";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { AlertTriangle, CheckCircle2, Info, ArrowLeft, Download, ShieldAlert, Database, BarChart3, BookOpen } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface AuditReportViewProps {
  onBack: () => void;
  onNavigateToRegulatory: () => void;
  report: any;
}

export function AuditReportView({ onBack, onNavigateToRegulatory, report }: AuditReportViewProps) {
  const [simulatorActive, setSimulatorActive] = useState(false);

  // Mock data for charts
  const demographicData = [
    { group: "Upper Caste", approval: simulatorActive ? 75 : 74, fill: "#1a237e" },
    { group: "SC/ST", approval: simulatorActive ? 65 : 41, fill: "#ef4444" },
    { group: "OBC", approval: simulatorActive ? 68 : 58, fill: "#f59e0b" },
    { group: "General", approval: simulatorActive ? 70 : 68, fill: "#10b981" },
  ];

  const geographicData = [
    { group: "Tier-1", approval: simulatorActive ? 72 : 71 },
    { group: "Tier-2", approval: simulatorActive ? 65 : 58 },
    { group: "Tier-3", approval: simulatorActive ? 61 : 39 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={onNavigateToRegulatory}
            className="flex items-center gap-2 px-6 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-bold shadow-sm hover:bg-amber-100 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Regulatory Index
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </header>

      {/* Main Verdict Card */}
      <div className="bg-white border-2 border-slate-200 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="bg-danger/10 p-8 flex flex-col md:flex-row items-center gap-8 border-b-2 border-slate-100">
          <div className="w-24 h-24 bg-danger rounded-3xl flex items-center justify-center shrink-0 shadow-lg shadow-danger/30">
            <ShieldAlert className="w-12 h-12 text-white" />
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="px-3 py-1 bg-danger text-white rounded-full text-[10px] font-black uppercase tracking-widest"> Critical Alert </span>
              <span className="text-slate-400 font-mono text-xs"> AUDIT ID: FS-8291-X </span>
            </div>
            <h1 className="text-4xl font-serif font-black text-slate-900 italic">Significant Bias Detected</h1>
            <p className="text-slate-600 font-medium max-w-xl">
              Our audit identified a 33% gap in approval rates between demographic groups, failing the 
              <span className="text-danger font-bold"> 4/5th Rule </span> (Disparate Impact) threshold.
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-center p-6 bg-white rounded-2xl border border-danger/20 shadow-sm relative overflow-hidden transition-all">
            <span className={cn(
              "text-5xl font-serif font-black transition-colors duration-500",
              simulatorActive ? "text-emerald-500" : "text-danger"
            )}>
              {simulatorActive ? "0.86" : "0.55"}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{simulatorActive ? "New Ratio" : "Impact Ratio"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white">
          <div className="p-8">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Overall Accuracy</span>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-serif font-black text-slate-900">84.7%</span>
              <span className="text-emerald-500 font-bold text-xs mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Robust
              </span>
            </div>
          </div>
          <div className="p-8">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Fairness Score</span>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-serif font-black text-danger">42/100</span>
              <span className="text-danger font-bold text-xs mb-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Failed
              </span>
            </div>
          </div>
          <div className="p-8">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Intersectional Penalty</span>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-serif font-black text-warning">0.55</span>
              <span className="text-warning font-bold text-xs mb-1.5"> High Risk </span>
            </div>
          </div>
        </div>
      </div>

      {/* Before/After Simulator Toggle */}
      <div className="bg-primary/5 border border-primary/20 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-serif font-black text-slate-900 italic mb-2">Interactive Bias Simulator</h3>
          <p className="text-slate-600 text-sm max-w-2xl">
            Simulate the impact of removing the <code className="bg-white px-2 py-0.5 rounded text-danger font-bold">applicant_surname</code> and <code className="bg-white px-2 py-0.5 rounded text-danger font-bold">pin_code</code> columns from your model's decision tree. Watch the disparate impact ratio recalculate in real-time.
          </p>
        </div>
        
        <button 
          onClick={() => setSimulatorActive(!simulatorActive)}
          className={cn(
            "shrink-0 px-8 py-4 rounded-full font-bold text-sm shadow-lg transition-all flex items-center gap-3",
            simulatorActive 
              ? "bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800" 
              : "bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600"
          )}
        >
          {simulatorActive ? (
            <>Reset View</>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-white animate-ping" />
              Simulate Removal
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Demographic Parity */}
        <div className="bg-white p-8 border-2 border-slate-200 rounded-[32px] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-serif font-black text-slate-900 italic">Demographic Parity</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Approval Rates by Identity (Proxy)</p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-300" />
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographicData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  dataKey="group" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                />
                <Bar dataKey="approval" radius={[0, 8, 8, 0]} barSize={20}>
                  {demographicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || "#6366f1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Geographic Tier Bias */}
        <div className="bg-white p-8 border-2 border-slate-200 rounded-[32px] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-serif font-black text-slate-900 italic">Geographic Tier Bias</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Impact across City Tiers</p>
            </div>
            <Database className="w-5 h-5 text-slate-300" />
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={geographicData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="group" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                />
                <YAxis hide />
                <Tooltip 
                   cursor={{ fill: "#f8fafc" }}
                   contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                />
                <Bar dataKey="approval" fill="#1a237e" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-slate-900 rounded-[32px] p-12 text-white overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-3xl font-serif font-black italic mb-8">Remediation Roadmap</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                severity: "CRITICAL",
                signal: "caste_proxy",
                message: "Surname field 'applicant_surname' encodes strong caste signal. Approval rate significantly lower for SC/ST proxy surnames.",
                fix: "Feature Removal"
              },
              {
                severity: "HIGH",
                signal: "geo_tier",
                message: "Model under-performs on Tier-3 inputs. Training data lacks representative samples from rural nodes.",
                fix: "Data Rebalancing"
              }
            ].map((rec, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-black tracking-widest",
                    rec.severity === "CRITICAL" ? "bg-danger text-white" : "bg-warning text-slate-900"
                  )}> {rec.severity} </span>
                  <span className="text-slate-400 font-mono text-[10px]"> FIX: {rec.fix} </span>
                </div>
                <h4 className="font-bold text-indigo-300 mb-2 uppercase tracking-tight text-xs">{rec.signal} Detected</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{rec.message}</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-0" />
      </div>
    </motion.div>
  );
}
