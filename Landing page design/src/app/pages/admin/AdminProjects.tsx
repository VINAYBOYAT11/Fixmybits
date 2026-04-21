import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { adminApi, type Project } from "../../lib/api";
import { FolderOpen, Check, X } from "lucide-react";

export function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    adminApi.getPendingProjects()
      .then((data: any) => setProjects(data.results || []))
      .catch((err: any) => console.error("Failed to fetch pending projects", err))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: string, name: string) => {
    setActionLoading(id);
    try {
      await adminApi.approveProject(id);
      setProjects(projects.filter(p => p.id !== id));
      alert(`Project "${name}" approved. It is now open for tester applications.`);
    } catch (err: any) {
      alert(err.message || "Failed to approve project.");
    } finally {
      setActionLoading("");
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId || !rejectReason.trim()) return;
    
    setActionLoading(rejectId);
    try {
      await adminApi.rejectProject(rejectId, rejectReason);
      setProjects(projects.filter(p => p.id !== rejectId));
      setRejectId(null);
      setRejectReason("");
      alert(`Project rejected.`);
    } catch (err: any) {
      alert(err.message || "Failed to reject project.");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <DashboardLayout role="admin" title="Pending Projects">
      <div className="max-w-6xl space-y-6">
        
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 rounded-full border-4 animate-spin border-[var(--primary)] border-t-transparent" /></div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
            <FolderOpen className="w-12 h-12 text-[var(--accent-mint)] mx-auto mb-4" />
            <p className="font-bold text-xl font-heading">No pending projects</p>
            <p className="opacity-60">All startup project submissions have been reviewed.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a] shadow-[5px_5px_0_0_rgba(245,158,11,1)]"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold font-heading">{project.name}</h3>
                      <p className="text-sm opacity-60 mt-1">Submitted on {new Date(project.created_at).toLocaleDateString()}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-black/10 dark:border-white/10">
                        <p className="text-xs font-bold uppercase mb-2">In Scope</p>
                        <p className="text-sm break-words whitespace-pre-wrap">{project.in_scope}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-black/10 dark:border-white/10">
                        <p className="text-xs font-bold uppercase mb-2">Out of Scope</p>
                        <p className="text-sm break-words whitespace-pre-wrap">{project.out_of_scope}</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-48 shrink-0 flex flex-col gap-3 border-t-2 md:border-t-0 md:border-l-2 border-black/10 dark:border-white/10 pt-4 md:pt-0 md:pl-6">
                    {rejectId === project.id ? (
                      <form onSubmit={handleReject} className="flex flex-col gap-2">
                        <textarea
                          placeholder="Reason for rejection..."
                          className="w-full text-sm p-2 rounded-lg border-2 border-black dark:border-white bg-transparent resize-y"
                          rows={3}
                          required
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button type="submit" disabled={actionLoading === project.id} className="flex-1 py-1 rounded bg-red-500 text-white font-bold text-xs border-2 border-black dark:border-white">
                            {actionLoading === project.id ? 'Reval...' : 'Confirm'}
                          </button>
                          <button type="button" onClick={() => setRejectId(null)} className="flex-1 py-1 rounded bg-gray-200 text-black font-bold text-xs border-2 border-black">
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <motion.button
                          onClick={() => handleApprove(project.id, project.name)}
                          disabled={actionLoading === project.id}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-black dark:border-white bg-[var(--accent-mint)] text-black font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none transition-all disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </motion.button>
                        <motion.button
                          onClick={() => setRejectId(project.id)}
                          disabled={actionLoading === project.id}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-black dark:border-white bg-red-500 text-white font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none transition-all disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
