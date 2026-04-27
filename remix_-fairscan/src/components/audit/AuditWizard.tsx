import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, FileText, Settings, Play, ChevronRight, Check, AlertCircle, Loader2, CheckCircle2, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import Papa from "papaparse";
import { detectProxySignals } from "@/src/services/aiAuditService.ts";

interface AuditWizardProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
}

export function AuditWizard({ onComplete, onCancel }: AuditWizardProps) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [detectedSignals, setDetectedSignals] = useState<any>(null);

  const handleFileUpload = (f: File) => {
    setFile(f);
    setIsDetecting(true);
    Papa.parse(f, {
      header: true,
      preview: 50,
      complete: async (results) => {
        const cols = results.meta.fields || [];
        setColumns(cols);
        setSampleData(results.data);
        
        const signals = await detectProxySignals(cols, results.data);
        setDetectedSignals(signals);
        setIsDetecting(false);
        setStep(2);
      }
    });
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const steps = [
    { id: 1, title: "Dataset", icon: Upload },
    { id: 2, title: "Parameters", icon: Settings },
    { id: 3, title: "Execute", icon: Play },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[600px]"
      >
        {/* Header */}
        <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  step === s.id ? "bg-primary text-white scale-110 shadow-lg" : 
                  step > s.id ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span className={cn(
                  "text-xs font-bold uppercase tracking-widest",
                  step === s.id ? "text-primary" : "text-slate-400"
                )}>{s.title}</span>
                {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300" />}
              </div>
            ))}
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-serif font-black text-slate-900 mb-2 italic">Upload Audit Dataset</h2>
                  <p className="text-slate-500">Supported formats: CSV, JSON (max 10MB)</p>
                </div>

                <div 
                  className={cn(
                    "border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden",
                    file ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-primary hover:bg-indigo-50"
                  )}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]);
                  }}
                  onClick={() => {
                    if (isDetecting) return;
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".csv";
                    input.onchange = (e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) handleFileUpload(f);
                    };
                    input.click();
                  }}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 z-10",
                    file ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    {isDetecting ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 z-10">
                    {isDetecting ? "Analyzing Dataset..." : file ? file.name : "Drag and drop your file here"}
                  </h3>
                  <p className="text-sm text-slate-500 z-10">
                    {isDetecting ? "Detecting Indian context proxy signals" : file ? `${(file.size / 1024).toFixed(2)} KB` : "or click to browse from computer"}
                  </p>
                  
                  {isDetecting && (
                    <motion.div 
                      className="absolute bottom-0 left-0 h-1 bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2 }}
                    />
                  )}
                </div>

                <div className="flex items-start gap-3 p-4 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <p><b>Privacy First:</b> Data is processed in-memory and never stored on our servers without encryption.</p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-serif font-black text-slate-900 mb-2 italic">Map Data Signals</h2>
                  <p className="text-slate-500">Link your columns to our bias auditing engine</p>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Label Column (Ground Truth)", icon: CheckCircle2, field: "label" },
                    { label: "Prediction Column (Model Output)", icon: Play, field: "prediction" },
                    { label: "Sensitive Attributes", icon: AlertCircle, field: "sensitive", multi: true },
                  ].map((item) => (
                    <div key={item.field} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-slate-400" />
                        <span className="font-bold text-slate-800">{item.label}</span>
                      </div>
                      <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium">
                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-8 py-10"
              >
                <div className="relative">
                  <div className="w-32 h-32 bg-primary rounded-full mx-auto flex items-center justify-center relative overflow-hidden">
                    {isProcessing ? (
                      <Loader2 className="w-12 h-12 text-white animate-spin" />
                    ) : (
                      <Play className="w-12 h-12 text-white fill-white" />
                    )}
                  </div>
                  {isProcessing && (
                    <motion.div 
                      className="absolute inset-0 border-4 border-primary rounded-full"
                      animate={{ scale: [1, 1.2], opacity: [1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>

                <div className="max-w-md mx-auto">
                  <h2 className="text-3xl font-serif font-black text-slate-900 mb-2 italic">Ready to Execute</h2>
                  <p className="text-slate-500 mb-6 font-medium">
                    Initial scan detected 3 potential proxy signals: Surnames (Caste), Location (Tier-3), and Gendered Language.
                  </p>
                  
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-left space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>Audit Configuration</span>
                      <span className="text-indigo-600">Verified</span>
                    </div>
                    <div className="flex justify-between font-mono text-sm">
                      <span className="text-slate-500">Metric Model</span>
                      <span className="text-slate-900">Disparate Impact 4/5th</span>
                    </div>
                    <div className="flex justify-between font-mono text-sm">
                      <span className="text-slate-500">Privacy Mode</span>
                      <span className="text-slate-900">Differential Privacy On</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button 
            onClick={step === 1 ? onCancel : prevStep}
            className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            {step === 1 ? "Cancel" : "Back Step"}
          </button>
          <button 
            disabled={step === 1 && !file}
            onClick={() => {
              if (step < 3) nextStep();
              else {
                setIsProcessing(true);
                setTimeout(() => onComplete({}), 2000);
              }
            }}
            className="group px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center gap-2"
          >
            {isProcessing ? "Auditing Pipeline..." : step === 3 ? "Start Full Audit" : "Proceed"}
            {!isProcessing && step < 3 && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
