import { useState, useEffect } from "react";
import { Navbar } from "./components/layout/Navbar.tsx";
import { Hero } from "./components/landing/Hero.tsx";
import { ProjectModal } from "./components/dashboard/ProjectModal.tsx";
import { AuditWizard } from "./components/audit/AuditWizard.tsx";
import { AuditReportView } from "./components/report/AuditReportView.tsx";
import { LeaderboardView } from "./components/dashboard/LeaderboardView.tsx";
import { CandidateLens } from "./components/landing/CandidateLens.tsx";
import { DiffModeView } from "./components/audit/DiffModeView.tsx";
import { DeveloperHub } from "./components/dashboard/DeveloperHub.tsx";
import { RegulatoryReadiness } from "./components/report/RegulatoryReadiness.tsx";
import { LiveMonitor } from "./components/dashboard/LiveMonitor.tsx";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Plus, ExternalLink, Calendar, BarChart3, Loader2, GitCompare, BookOpen } from "lucide-react";
import { Project } from "./types.ts";
import { auth, handleSignIn, handleSignOut, db, OperationType, handleFirestoreError, testConnection } from "./lib/firebase.ts";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";

export default function App() {
  const [activePage, setActivePage] = useState("landing");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAuditWizardOpen, setIsAuditWizardOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeReport, setActiveReport] = useState<any>(null);

  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthLoading(false);
      if (u) {
        handleNavigate("dashboard");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "projects"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projs: Project[] = [];
      snapshot.forEach((doc) => {
        projs.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(projs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "projects");
    });

    return () => unsubscribe();
  }, [user]);

  const handleNavigate = (page: string) => {
    setActivePage(page);
    if (page === "dashboard") {
      setActiveReport(null);
      setActiveProject(null);
    }
  };

  const signIn = async () => {
    try {
      await handleSignIn();
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const signOut = async () => {
    try {
      await handleSignOut();
      handleNavigate("landing");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleCreateProject = async (data: any) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "projects"), {
        name: data.name,
        description: data.description,
        modelType: data.modelType,
        useCase: data.useCase,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        auditCount: 0,
      });
      setIsProjectModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "projects");
    }
  };

  const handleAuditComplete = async () => {
    if (!activeProject || !user) return;
    try {
      // Mock report for now, but save to audit_runs subcollection
      const auditRef = await addDoc(collection(db, `projects/${activeProject.id}/audit_runs`), {
        projectId: activeProject.id,
        status: "completed",
        createdAt: serverTimestamp(),
        completedAt: serverTimestamp(),
        report: {
          overallAccuracy: 0.847,
          summaryVerdict: "CRITICAL",
        }
      });

      // Update project audit count
      await updateDoc(doc(db, "projects", activeProject.id), {
        auditCount: increment(1)
      });

      setActiveReport({
        overallAccuracy: 0.847,
        summaryVerdict: "CRITICAL",
      });
      setIsAuditWizardOpen(false);
      setActivePage("report");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `projects/${activeProject.id}/audit_runs`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        onNavigate={handleNavigate} 
        activePage={activePage} 
        isAuthenticated={!!user}
        onSignOut={signOut}
      />

      <main className="pb-20">
        <AnimatePresence mode="wait">
          {isAuthLoading ? (
            <div className="pt-32 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <>
          {activePage === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero onStart={() => handleNavigate("auth")} />
            </motion.div>
          )}

          {activePage === "auth" && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="pt-32 px-4 max-w-md mx-auto text-center"
            >
              <h2 className="text-3xl font-serif font-black text-slate-900 mb-4 italic leading-tight">Secure Console</h2>
              <p className="text-slate-600 mb-8 font-medium">Verify your developer identity to continue.</p>
              <button 
                onClick={signIn}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <div className="bg-white p-1 rounded-sm">
                  <svg className="w-4 h-4 fill-primary" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                Connect via SSO
              </button>
              <div className="mt-8 flex items-center justify-center gap-4 text-slate-400 font-mono text-[10px] font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> End-to-End Encrypted</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                <span>Zero Trust Audit</span>
              </div>
            </motion.div>
          )}

          {activePage === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-24 px-4 max-w-7xl mx-auto"
            >
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                  <h1 className="text-4xl font-serif font-black text-slate-900 leading-tight italic">Compliance Monitors</h1>
                  <p className="text-slate-500 font-medium font-mono text-xs uppercase tracking-widest mt-1">
                    {projects.length} Active Workspaces
                  </p>
                </div>
                <button 
                  onClick={() => setIsProjectModalOpen(true)}
                  className="px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Register Workspace
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <motion.div 
                    layoutId={project.id}
                    key={project.id}
                    className="bg-white border-2 border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all group flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-8">
                      <div className="bg-indigo-50 p-4 rounded-2xl group-hover:bg-primary transition-colors shadow-sm">
                        <ShieldCheck className="w-6 h-6 text-primary group-hover:text-white" />
                      </div>
                      <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                        {project.modelType}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-serif font-black text-slate-900 mb-3 truncate italic leading-none">{project.name}</h3>
                      <p className="text-slate-500 text-sm font-medium line-clamp-2 h-10 mb-8 leading-relaxed italic opacity-80">{project.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 py-6 border-y-2 border-slate-50 mb-8 text-[10px] font-black font-mono text-slate-400 tracking-wider">
                      <div className="flex items-center gap-1.5 uppercase">
                        <BarChart3 className="w-4 h-4 text-emerald-500" />
                        {project.auditCount} Audits
                      </div>
                      <div className="flex items-center gap-1.5 uppercase border-l-2 border-slate-50 pl-4">
                        <Calendar className="w-4 h-4 text-primary" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => {
                          setActiveProject(project);
                          setIsAuditWizardOpen(true);
                        }}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-slate-200 group-hover:shadow-indigo-100"
                      >
                        Initialize Audit
                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>
                      <button 
                        onClick={() => {
                          setActiveProject(project);
                          handleNavigate("diff-mode");
                        }}
                        className="w-full py-3 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                      >
                        <GitCompare className="w-3 h-3" />
                        Compare Audits
                      </button>
                    </div>
                  </motion.div>
                ))}

                <div 
                  onClick={() => setIsProjectModalOpen(true)}
                  className="border-2 border-dashed border-slate-200 rounded-[32px] p-12 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary hover:bg-indigo-50/30 transition-all bg-white"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                    <Plus className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-serif font-black text-slate-900 text-xl italic leading-none">New Audit Space</h3>
                  <p className="text-sm font-medium text-slate-400 mt-2 max-w-[200px] leading-relaxed italic">
                    Establish a secure compliance pipeline for your model
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activePage === "report" && (
            <div className="pt-24 px-4 pb-20">
              <AuditReportView 
                onBack={() => handleNavigate("dashboard")}
                onNavigateToRegulatory={() => handleNavigate("regulatory")}
                report={activeReport}
              />
            </div>
          )}

          {activePage === "leaderboard" && (
            <div className="pt-24 px-4 pb-20">
              <LeaderboardView 
                onBack={() => handleNavigate("landing")}
              />
            </div>
          )}

          {activePage === "candidate-lens" && (
            <div className="pt-24 px-4 pb-20">
              <CandidateLens 
                onBack={() => handleNavigate("landing")}
              />
            </div>
          )}

          {activePage === "diff-mode" && (
            <div className="pt-24 px-4 pb-20">
              <DiffModeView 
                onBack={() => handleNavigate("dashboard")}
              />
            </div>
          )}

          {activePage === "developer-hub" && (
            <div className="pt-24 px-4 pb-20">
              <DeveloperHub 
                onBack={() => handleNavigate("dashboard")}
              />
            </div>
          )}

          {activePage === "live-monitor" && (
            <div className="pt-24 px-4 pb-20">
              <LiveMonitor 
                onBack={() => handleNavigate("dashboard")}
              />
            </div>
          )}

          {activePage === "regulatory" && (
            <div className="pt-24 px-4 pb-20">
              <RegulatoryReadiness 
                onBack={() => handleNavigate("report")}
              />
            </div>
          )}
          </>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isProjectModalOpen && (
          <ProjectModal 
            onClose={() => setIsProjectModalOpen(false)} 
            onCreate={handleCreateProject}
          />
        )}
        {isAuditWizardOpen && (
          <AuditWizard 
            onCancel={() => setIsAuditWizardOpen(false)}
            onComplete={handleAuditComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
