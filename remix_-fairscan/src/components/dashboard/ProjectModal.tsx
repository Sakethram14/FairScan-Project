import { motion } from "motion/react";
import { X, Database, Info } from "lucide-react";
import { ModelType, UseCase } from "@/src/types";

interface ProjectModalProps {
  onClose: () => void;
  onCreate: (project: any) => void;
}

export function ProjectModal({ onClose, onCreate }: ProjectModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-primary">
          <h2 className="text-xl font-serif font-black text-white italic">New Compliance Project</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="p-8 space-y-6" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onCreate({
            name: formData.get("name"),
            description: formData.get("description"),
            modelType: formData.get("modelType"),
            useCase: formData.get("useCase"),
          });
        }}>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Project Name</label>
            <input 
              name="name"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g. Hiring Model Audit Q2"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
            <textarea 
              name="description"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-24"
              placeholder="What is this model used for?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Model Type</label>
              <select name="modelType" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value={ModelType.CLASSIFICATION}>Classification</option>
                <option value={ModelType.REGRESSION}>Regression</option>
                <option value={ModelType.RANKING}>Ranking</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Use Case</label>
              <select name="useCase" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value={UseCase.HIRING}>Hiring & HR</option>
                <option value={UseCase.LENDING}>Lending (Fintech)</option>
                <option value={UseCase.CONTENT}>Content Filtering</option>
                <option value={UseCase.OTHER}>Other</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-xl flex gap-3 text-indigo-600 text-sm">
            <Info className="w-5 h-5 shrink-0" />
            <p>
              Projects group multiple audit runs together. You can re-audit the same model as it evolves.
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:-translate-y-0.5 transition-all"
            >
              Create Project
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
