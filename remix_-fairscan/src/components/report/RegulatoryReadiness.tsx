import { motion } from "motion/react";
import { ArrowLeft, BookOpen, ShieldCheck, AlertCircle, FileText, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface RegulatoryReadinessProps {
  onBack: () => void;
}

export function RegulatoryReadiness({ onBack }: RegulatoryReadinessProps) {
  const regulations = [
    {
      id: "dpdp",
      name: "India DPDP Act (2023)",
      status: "AT_RISK",
      description: "Digital Personal Data Protection Act",
      requirements: [
        { title: "Algorithmic Transparency", met: false, detail: "Model documentation mapping proxies to personal identifiable information." },
        { title: "Fairness Doctrine", met: false, detail: "Ensuring socio-economic indicators don't result in systematic denial of service." },
        { title: "Data Minimization", met: true, detail: "Model inputs do not directly request religious or caste markers." }
      ]
    },
    {
      id: "eu-ai",
      name: "EU AI Act",
      status: "NON_COMPLIANT",
      description: "Applies to high-risk AI systems (Hiring, Lending)",
      requirements: [
        { title: "Bias Monitoring System", met: true, detail: "FairScan integration fulfills active monitoring requirements." },
        { title: "Acceptable Disparate Impact", met: false, detail: "Current impact ratio (0.55) falls below the acceptable (0.80) threshold." },
        { title: "Human Oversight", met: false, detail: "Lack of manual override mechanisms recorded in the pipeline." }
      ]
    }
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
          Back to Report
        </button>
        <button className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 transition-all">
          <FileText className="w-4 h-4" />
          Generate Compliance Doc
        </button>
      </header>

      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-amber-50 rounded-2xl mb-6">
          <BookOpen className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-4xl font-serif font-black text-slate-900 mb-4 italic leading-tight">Regulatory Readiness Index</h1>
        <p className="text-lg text-slate-500 font-medium">
          Mapping your model's current bias audit results against emerging AI regulations and data protection laws.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {regulations.map((reg) => (
          <div key={reg.id} className="bg-white border-2 border-slate-200 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/40">
            <div className={cn(
               "p-8 border-b-2",
               reg.status === "AT_RISK" ? "bg-amber-50 border-amber-100" : "bg-danger/10 border-danger/20"
            )}>
              <div className="flex items-center justify-between mb-4">
                 <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    reg.status === "AT_RISK" ? "bg-amber-200 text-amber-800" : "bg-danger text-white"
                 )}>
                   {reg.status.replace("_", " ")}
                 </span>
                 <ShieldCheck className={cn("w-6 h-6", reg.status === "AT_RISK" ? "text-amber-500" : "text-danger")} />
              </div>
              <h2 className="text-2xl font-serif font-black text-slate-900 italic mb-2">{reg.name}</h2>
              <p className="text-slate-600 font-medium text-sm">{reg.description}</p>
            </div>

            <div className="p-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Requirements Mapping</h3>
              <div className="space-y-4">
                {reg.requirements.map((req, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="shrink-0 mt-0.5">
                      {req.met ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-danger" />
                      )}
                    </div>
                    <div>
                      <h4 className={cn("font-bold text-sm mb-1", req.met ? "text-slate-900" : "text-danger")}>
                        {req.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{req.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 uppercase tracking-wider">
                View Remediation Steps
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
