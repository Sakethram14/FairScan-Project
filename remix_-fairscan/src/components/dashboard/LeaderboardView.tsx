import { motion } from "motion/react";
import { ArrowLeft, Trophy, AlertTriangle, TrendingDown, TrendingUp, ShieldCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface LeaderboardViewProps {
  onBack: () => void;
}

export function LeaderboardView({ onBack }: LeaderboardViewProps) {
  const industryData = [
    { industry: "Fintech (Lending)", impactRatio: 0.45, severity: "CRITICAL" },
    { industry: "E-Commerce", impactRatio: 0.62, severity: "HIGH" },
    { industry: "EdTech", impactRatio: 0.75, severity: "MEDIUM" },
    { industry: "IT Services", impactRatio: 0.81, severity: "LOW" },
    { industry: "Healthcare", impactRatio: 0.88, severity: "PASS" },
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
          Back
        </button>
      </header>

      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-6">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-serif font-black text-slate-900 mb-4 italic leading-tight">Live Bias Leaderboard</h1>
        <p className="text-lg text-slate-500 font-medium">
          Anonymized, aggregated data from all FairScan audits. See which industries in India have the highest structural bias in ML models.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-[32px] p-8 md:p-12 shadow-xl shadow-slate-200/50">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-serif font-black text-slate-900 italic">Industry Disparate Impact Averages</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Lower ratio = Higher Bias (4/5ths Rule)</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-sm font-bold text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Live Global Aggregation
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={industryData} layout="vertical" margin={{ left: 100, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 1]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]} />
              <YAxis 
                dataKey="industry" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: "#1e293b", fontSize: 13, fontWeight: 700 }}
              />
              <Tooltip 
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
              />
              <Bar dataKey="impactRatio" radius={[0, 8, 8, 0]} barSize={24} name="Impact Ratio">
                {industryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.impactRatio < 0.5 ? "#ef4444" : entry.impactRatio < 0.8 ? "#f59e0b" : "#10b981"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Trend Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-danger/10 text-danger rounded-xl flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Fintech heavily penalizes rural pin codes</h4>
              <p className="text-xs text-slate-500 mt-1">Lending models in India show a 35% approval gap for Tier-3 cities.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Healthcare sets the gold standard</h4>
              <p className="text-xs text-slate-500 mt-1">Diagnostic triage models pass the 4/5ths rule across all geographic tiers.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
