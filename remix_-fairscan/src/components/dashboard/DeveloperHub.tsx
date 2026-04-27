import { motion } from "motion/react";
import { ArrowLeft, Key, Code, Terminal, Webhook, ShieldCheck, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/src/lib/utils";

interface DeveloperHubProps {
  onBack: () => void;
}

export function DeveloperHub({ onBack }: DeveloperHubProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const actionScript = `name: FairScan CI/CD

on: [push, pull_request]

jobs:
  bias-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run FairScan Bias Linter
        uses: fairscan-platform/audit-action@v1
        with:
          api-key: \${{ secrets.FAIRSCAN_API_KEY }}
          dataset-path: './data/validation_set.csv'
          model-predictions: './outputs/preds.csv'
          fail-on-critical: true`;

  const curlCommand = `curl -X POST https://api.fairscan.dev/v1/audit \\
  -H "Authorization: Bearer fs_live_x89f2md9k2..." \\
  -F "dataset=@data/test_results.csv" \\
  -F "label_column=hired" \\
  -F "prediction_column=predicted_hired"`;

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
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl relative text-white">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="p-8 md:p-12 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/20 text-primary rounded-xl">
              <Terminal className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Developer Infrastructure</span>
          </div>
          <h1 className="text-4xl font-serif font-black italic mb-4">CI/CD & API Integrations</h1>
          <p className="text-slate-400 font-medium max-w-2xl leading-relaxed">
            FairScan is built as a developer-centric compliance infrastructure tool. Integrate our bias detection engine directly into your ML pipelines, acting as a "fairness linter" before models hit production.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-white/10 relative z-10">
          
          {/* API Keys */}
          <div className="p-8 md:p-12 space-y-6">
            <div className="flex items-center gap-3 text-slate-200 font-bold">
              <Key className="w-5 h-5 text-indigo-400" />
              <h3>API Keys</h3>
            </div>
            <p className="text-sm text-slate-400">Use this token to authenticate requests to the FairScan ML Engine.</p>
            
            <div className="bg-black/50 border border-white/10 rounded-xl p-4 flex items-center justify-between group">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Production Key</span>
                <code className="text-sm text-slate-300 font-mono">fs_live_x89f2md9k2...</code>
              </div>
              <button 
                onClick={() => handleCopy("fs_live_x89f2md9k2...", "key")}
                className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                {copied === "key" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Code Integration */}
          <div className="p-8 md:p-12 lg:col-span-2 space-y-8 bg-black/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-slate-200 font-bold">
                <Code className="w-5 h-5 text-emerald-400" />
                <h3>GitHub Actions Integration</h3>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                Linter Mode
              </span>
            </div>
            
            <div className="relative group">
              <div className="absolute top-0 right-0 p-4">
                 <button 
                  onClick={() => handleCopy(actionScript, "action")}
                  className="bg-white/10 text-slate-300 px-3 py-1.5 rounded text-xs font-bold font-mono hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  {copied === "action" ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied === "action" ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="bg-[#0d1117] border border-white/10 p-6 rounded-2xl overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed">
                <code>{actionScript}</code>
              </pre>
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-3 text-slate-200 font-bold">
                <Webhook className="w-5 h-5 text-amber-400" />
                <h3>REST API (Direct Audit)</h3>
              </div>
              <div className="relative group">
                <div className="absolute top-0 right-0 p-4">
                   <button 
                    onClick={() => handleCopy(curlCommand, "curl")}
                    className="bg-white/10 text-slate-300 px-3 py-1.5 rounded text-xs font-bold font-mono hover:bg-white/20 transition-colors flex items-center gap-2"
                  >
                    {copied === "curl" ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied === "curl" ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="bg-[#0d1117] border border-white/10 p-6 rounded-2xl overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed">
                  <code>{curlCommand}</code>
                </pre>
              </div>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
