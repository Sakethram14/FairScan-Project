import { motion } from "motion/react";
import { ShieldCheck, ArrowRight, Play, CheckCircle2 } from "lucide-react";

interface HeroProps {
  onStart: () => void;
}

export function Hero({ onStart }: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-100 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-xs font-bold uppercase tracking-widest mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
          Infrastructure for Indian AI Compliance
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8"
        >
          AI FAIRNESS AS A <br />
          <span className="text-primary italic">QUALITY GATE.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-12 font-medium"
        >
          FairScan acts as a "lint checker" for AI models, auditing pipelines for 
          discriminatory bias by modeling proxy signals specific to India's socioeconomic context.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={onStart}
            className="group px-8 py-4 bg-primary text-white rounded-full text-lg font-bold shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 transition-all flex items-center gap-2"
          >
            Launch Audit Run
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full text-lg font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
            <Play className="w-5 h-5 fill-slate-900" />
            Watch Demo
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16"
        >
          {[
            "Caste Proxies",
            "Regional Bias",
            "CI/CD Integration",
            "Regulatory Mapping"
          ].map((signal) => (
            <div key={signal} className="flex items-center gap-2 text-slate-400 font-mono text-xs uppercase tracking-widest font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {signal}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
