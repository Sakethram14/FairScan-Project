import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, UserCircle, AlertCircle, RefreshCw, XCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface CandidateLensProps {
  onBack: () => void;
}

export function CandidateLens({ onBack }: CandidateLensProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const simulate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    // Simulate API delay
    setTimeout(() => {
      setResult({
        penalty: 35, // 35% penalty
        redFlags: ["Surname heavily correlated with historical rejection patterns in this industry.", "Tier-3 Pin Code detected. Typical ML models penalize non-metro applicants by ~15%."],
        baseProbability: 85,
        adjustedProbability: 50
      });
      setIsSimulating(false);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <header className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </header>

      <div className="bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl relative text-white">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-danger via-warning to-primary" />
        
        <div className="p-8 md:p-12 md:pb-6 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-serif font-black italic mb-4">Candidate's Lens</h1>
          <p className="text-slate-400 font-medium text-lg leading-relaxed">
            Flip the view. Input your demographic markers below to see how a standard, un-audited AI model analyzes your profile behind the scenes.
          </p>
        </div>

        <div className="p-8 md:p-12 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Input Form */}
            <form onSubmit={simulate} className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <UserCircle className="w-6 h-6 text-slate-300" />
                <h3 className="text-xl font-bold">Applicant Profile</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                  <input required defaultValue="Rohan Yadav" className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pin Code</label>
                    <input required defaultValue="800001" className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Gender</label>
                    <select className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Education / Skills</label>
                  <textarea defaultValue="B.Tech Computer Science, React, Python, 2 Years Experience." className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white h-24" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSimulating}
                className="w-full py-4 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 mt-4"
              >
                {isSimulating ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Run AI Simulation"}
              </button>
            </form>

            {/* Results Display */}
            <div className="flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {!result && !isSimulating && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-center p-8 text-slate-500 flex flex-col items-center"
                  >
                    <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
                    <p>Submit the form to see your predicted AI score penalty.</p>
                  </motion.div>
                )}

                {isSimulating && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-center p-8 space-y-4"
                  >
                    <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <p className="text-slate-400 font-mono text-sm animate-pulse">Running inferences through typical ATS pipeline...</p>
                  </motion.div>
                )}

                {result && !isSimulating && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="p-8 bg-danger/10 border border-danger/20 rounded-3xl text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         <XCircle className="w-32 h-32 text-danger" />
                      </div>
                      <span className="text-[10px] font-bold text-danger uppercase tracking-widest block mb-1">Algorithmic Penalty</span>
                      <h2 className="text-6xl font-serif font-black text-danger mb-2">-{result.penalty}%</h2>
                      <p className="text-slate-300 font-medium">Lower probability of interview selection compared to a baseline candidate with identical skills.</p>
                    </div>

                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-4">
                      <h3 className="font-bold text-slate-200">Invisible Rejection Factors</h3>
                      {result.redFlags.map((flag: string, i: number) => (
                        <div key={i} className="flex gap-3 text-sm text-slate-400 bg-black/20 p-4 rounded-xl">
                          <AlertCircle className="w-5 h-5 text-warning shrink-0" />
                          <p>{flag}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800 p-4 rounded-2xl text-center">
                        <span className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-1">Merit Score</span>
                        <span className="text-2xl font-mono text-emerald-400">{result.baseProbability}%</span>
                      </div>
                      <div className="bg-slate-800 p-4 rounded-2xl text-center">
                        <span className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-1">Final AI Score</span>
                        <span className="text-2xl font-mono text-danger">{result.adjustedProbability}%</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
