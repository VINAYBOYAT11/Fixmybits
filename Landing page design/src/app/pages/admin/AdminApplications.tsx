import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { adminApi, type Application } from "../../lib/api";
import { UserCheck, Check, X } from "lucide-react";

export function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = () => {
    setLoading(true);
    adminApi.getApplications()
      .then((data: any) => {
        const allApps = data.results || [];
        setApplications(allApps.filter((a: Application) => a.status === 'pending'));
      })
      .catch((err: any) => console.error("Failed to fetch applications", err))
      .finally(() => setLoading(false));
  };

  const handleAction = async (id: string, action: 'accept' | 'reject') => {
    const label = action === 'accept' ? 'Accept' : 'Reject';
    if (!window.confirm(`${label} this application?`)) return;
    setActionLoading(id);
    try {
      if (action === 'accept') {
        await adminApi.acceptApplication(id);
        showToast('success', 'Application accepted. Tester has been assigned to the project.');
      } else {
        await adminApi.rejectApplication(id);
        showToast('success', 'Application rejected.');
      }
      setApplications(applications.filter(a => a.id !== id));
    } catch (err: any) {
      showToast('error', err.message || `Failed to ${action} application.`);
    } finally {
      setActionLoading("");
    }
  };

  return (
    <DashboardLayout role="admin" title="Tester Applications">
      <div className="max-w-5xl space-y-6">
        
        {toast && (
          <div className={`p-4 rounded-2xl border-2 font-semibold text-sm ${toast.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200' : 'border-red-500 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200'}`}>
            {toast.text}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 rounded-full border-4 animate-spin border-[var(--primary)] border-t-transparent" /></div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
            <UserCheck className="w-12 h-12 text-[var(--accent-mint)] mx-auto mb-4" />
            <p className="font-bold text-xl font-heading">No pending applications</p>
            <p className="opacity-60">There are currently no testers waiting to be assigned.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a] shadow-[5px_5px_0_0_rgba(79,140,255,1)]"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold font-heading">
                        {(app as any).project_name || `Project: ${(app as any).project || "Unknown"}`}
                      </h3>
                      <p className="text-sm opacity-60">Applied on {new Date(app.applied_at).toLocaleDateString()}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-black/10 dark:border-white/10">
                      <p className="text-xs font-bold uppercase mb-2">Tester Profile</p>
                      <p className="font-medium">{app.tester?.email}</p>
                      <div className="flex gap-4 mt-2 text-sm opacity-80">
                        <span>Level: {app.tester?.experience_level || 'N/A'}</span>
                        <span className="truncate">Skills: {app.tester?.skills?.join(', ') || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-3 w-full md:w-32 shrink-0 border-t-2 md:border-t-0 md:border-l-2 border-black/10 dark:border-white/10 pt-4 md:pt-0 md:pl-6">
                    <motion.button
                      onClick={() => handleAction(app.id, 'accept')}
                      disabled={actionLoading === app.id}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="w-full flex justify-center items-center gap-2 py-3 rounded-full border-2 border-black dark:border-white bg-[var(--accent-mint)] text-black font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleAction(app.id, 'reject')}
                      disabled={actionLoading === app.id}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="w-full flex justify-center items-center gap-2 py-3 rounded-full border-2 border-black dark:border-white bg-red-500 text-white font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)] disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </motion.button>
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
