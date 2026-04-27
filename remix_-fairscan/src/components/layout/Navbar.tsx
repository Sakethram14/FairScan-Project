import { motion } from "motion/react";
import { ShieldCheck, LayoutDashboard, Database, Settings, LogOut, Activity } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface NavbarProps {
  onNavigate: (page: string) => void;
  activePage: string;
  isAuthenticated: boolean;
  onSignOut: () => void;
}

export function Navbar({ onNavigate, activePage, isAuthenticated, onSignOut }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onNavigate("landing")}
        >
          <div className="bg-primary p-1.5 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="font-serif text-2xl font-black tracking-tight text-primary italic">
            FairScan
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {isAuthenticated ? (
            <>
              <button 
                onClick={() => onNavigate("dashboard")}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  activePage === "dashboard" || activePage === "diff-mode" ? "text-primary font-bold" : "text-slate-500 hover:text-slate-900"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button 
                onClick={() => onNavigate("live-monitor")}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  activePage === "live-monitor" ? "text-primary font-bold" : "text-slate-500 hover:text-slate-900"
                )}
              >
                <Activity className="w-4 h-4" />
                Live Monitor
              </button>
              <button 
                onClick={() => onNavigate("leaderboard")}
                className={cn(
                  "text-sm font-medium transition-colors",
                  activePage === "leaderboard" ? "text-primary font-bold" : "text-slate-500 hover:text-slate-900"
                )}
              >
                Leaderboard
              </button>
              <button 
                onClick={() => onNavigate("candidate-lens")}
                className={cn(
                  "text-sm font-medium transition-colors",
                  activePage === "candidate-lens" ? "text-primary font-bold" : "text-slate-500 hover:text-slate-900"
                )}
              >
                Candidate Lens
              </button>
              <button 
                onClick={() => onNavigate("developer-hub")}
                className={cn(
                  "text-sm font-medium transition-colors",
                  activePage === "developer-hub" ? "text-primary font-bold" : "text-slate-500 hover:text-slate-900"
                )}
              >
                API & CI/CD
              </button>
              <button 
                onClick={onSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => onNavigate("leaderboard")}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Leaderboard
              </button>
              <button 
                onClick={() => onNavigate("candidate-lens")}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Candidate Lens
              </button>
              <button 
                onClick={() => onNavigate("auth")}
                className="px-6 py-2 bg-primary text-white rounded-full text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
