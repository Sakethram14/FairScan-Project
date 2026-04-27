import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Activity, ShieldCheck, ShieldAlert, Cpu, Database } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface LiveMonitorProps {
  onBack: () => void;
}

interface RequestLog {
  id: string;
  time: string;
  endpoint: string;
  latency: number;
  status: "PASS" | "FLAGGED";
  reason?: string;
  demographicProxy?: string;
}

export function LiveMonitor({ onBack }: LiveMonitorProps) {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const isFlagged = Math.random() > 0.85;
      const endpoints = ["/api/v1/predict_hire", "/api/v1/screen_resume", "/api/v2/evaluate"];
      const proxies = ["Pin Code (Tier-3)", "Surname (Caste Correlated)", "Gap Year (Maternity Correlated)", "Language Style"];
      
      const newLog: RequestLog = {
        id: Math.random().toString(36).substring(7),
        time: new Date().toLocaleTimeString(),
        endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
        latency: Math.floor(Math.random() * 120) + 15, // 15-135ms
        status: isFlagged ? "FLAGGED" : "PASS",
        ...(isFlagged && {
          reason: "High Disparate Impact Probability",
          demographicProxy: proxies[Math.floor(Math.random() * proxies.length)]
        })
      };

      setLogs(prev => [newLog, ...prev].slice(0, 10)); // Keep last 10
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

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
          Back to Dashboard
        </button>
        <button 
          onClick={() => setIsMonitoring(!isMonitoring)}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all",
            isMonitoring ? "bg-danger/10 text-danger" : "bg-slate-900 text-white"
          )}
        >
          {isMonitoring ? (
            <>
              <div className="w-2 h-2 bg-danger rounded-full animate-ping" />
              Pause Monitoring
            </>
          ) : (
            <>
              <Activity className="w-4 h-4" />
              Resume Monitoring
            </>
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Stats Column */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-[32px] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Activity className="w-32 h-32" />
            </div>
            <h2 className="text-3xl font-serif font-black italic mb-2">Live Gateway</h2>
            <p className="text-slate-400 text-sm mb-8">Intercepting model inference requests in real-time.</p>
            
            <div className="space-y-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1">Requests / Min</span>
                <span className="text-4xl font-mono text-emerald-400">1,420</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1">Avg Latency</span>
                  <span className="text-xl font-mono">42ms</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1">Intervention Rate</span>
                  <span className="text-xl font-mono text-danger">3.2%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200">
            <h3 className="font-bold flex items-center gap-2 text-slate-900 mb-4">
              <Database className="w-4 h-4 text-primary" />
              System Architecture
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm font-medium border border-slate-100">
                <span className="text-slate-600">Client App</span>
                <span className="text-emerald-500">Connected</span>
              </div>
              <div className="flex justify-center my-1"><ArrowLeft className="w-4 h-4 text-slate-300 rotate-[-90deg]" /></div>
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20 text-sm font-bold text-primary">
                <span>FairScan Interceptor</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-primary rounded-full animate-pulse" /> Active</span>
              </div>
              <div className="flex justify-center my-1"><ArrowLeft className="w-4 h-4 text-slate-300 rotate-[-90deg]" /></div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm font-medium border border-slate-100">
                <span className="text-slate-600">Core ML Model</span>
                <span className="text-emerald-500">Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Logs Column */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border-2 border-slate-200 p-8">
          <h3 className="text-xl font-serif font-black italic mb-6 text-slate-900 flex items-center gap-3">
            <Cpu className="w-6 h-6 text-slate-400" />
            Inference Stream
          </h3>
          
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border transition-colors overflow-hidden",
                    log.status === "FLAGGED" 
                      ? "bg-danger/5 border-danger/20" 
                      : "bg-slate-50 border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className="flex items-center gap-4 mb-3 md:mb-0">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      log.status === "FLAGGED" ? "bg-danger/20 text-danger" : "bg-emerald-100 text-emerald-600"
                    )}>
                      {log.status === "FLAGGED" ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{log.endpoint}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono">{log.latency}ms</span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{log.time} • Transaction ID: {log.id}</span>
                    </div>
                  </div>

                  {log.status === "FLAGGED" && (
                    <div className="md:text-right bg-white/60 p-3 rounded-xl border border-white md:bg-transparent md:border-transparent md:p-0 text-left">
                      <span className="text-xs font-bold text-danger block uppercase tracking-widest">{log.reason}</span>
                      <span className="text-sm text-slate-600 font-medium break-words">Blocked Proxy: {log.demographicProxy}</span>
                    </div>
                  )}
                  {log.status === "PASS" && (
                    <div className="hidden md:block">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                        Passed
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {logs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Awaiting inference data stream...</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}

// Ensure loader icon is imported if we use it, otherwise replace it. Let's just import it above.
import { Loader2 } from "lucide-react";
