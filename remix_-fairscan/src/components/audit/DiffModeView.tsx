import { motion } from "motion/react";
import { ArrowLeft, GitCompare, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { cn } from "@/src/lib/utils";

interface DiffModeViewProps {
  onBack: () => void;
}

export function DiffModeView({ onBack }: DiffModeViewProps) {
  const diffData = [
    { metric: "Demographic Parity", Q3_2023: 0.51, Q1_2024: 0.82 },
    { metric: "Geo-Tier Impact", Q3_2023: 0.45, Q1_2024: 0.78 },
    { metric: "Language Bias", Q3_2023: 0.60, Q1_2024: 0.90 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <header className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Project
        </button>
      </header>

      <div className="bg-white border-2 border-slate-200 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="p-8 md:p-12 border-b-2 border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 bg-slate-50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2 bg-indigo-100 rounded-lg">
                <GitCompare className="w-6 h-6 text-primary" />
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Longitudinal Analysis</span>
            </div>
            <h1 className="text-4xl font-serif font-black text-slate-900 italic">Bias Diff Report</h1>
            <p className="text-slate-500 font-medium max-w-xl mt-2">
              Comparing model fairness progress over time.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-center px-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Baseline</span>
              <span className="font-mono font-bold text-slate-900">Q3 2023 Hiring</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300" />
            <div className="text-center px-4">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Current</span>
              <span className="font-mono font-bold text-primary">Q1 2024 Retrained</span>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12">
          {/* Top Line Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
              <div className="w-16 h-16 bg-danger/10 rounded-2xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-8 h-8 text-danger" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Old Global Fairness</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-serif font-black text-danger">41%</span>
                  <span className="text-sm font-bold text-danger">Failed</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 rounded-3xl bg-emerald-50 border border-emerald-100">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-800/60 uppercase tracking-widest block mb-1">New Global Fairness</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-serif font-black text-emerald-600">84%</span>
                  <span className="text-sm font-bold text-emerald-600">Passed</span>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-serif font-black text-slate-900 italic mb-8">Metric Improvements (Impact Ratio)</h3>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diffData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 1]} />
                <Tooltip 
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                <Bar dataKey="Q3_2023" name="Baseline (Q3 2023)" fill="#cbd5e1" radius={[8, 8, 0, 0]} barSize={40} />
                <Bar dataKey="Q1_2024" name="Target (Q1 2024)" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
