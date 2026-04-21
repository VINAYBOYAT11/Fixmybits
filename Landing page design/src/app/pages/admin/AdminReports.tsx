import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { adminApi, type Report } from "../../lib/api";
import { ShieldCheck, Flag, Copy } from "lucide-react";
import { SeverityBadge } from "../../components/shared/StatusBadge";

export function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    setLoading(true);
    adminApi.getPendingReports()
      .then((data: any) => setReports(data.results || []))
      .catch((err: any) => console.error("Failed to fetch pending reports", err))
      .finally(() => setLoading(false));
  };

  const handleReview = async (id: string, action: 'approve' | 'spam' | 'duplicate') => {
    setActionLoading(id);
    try {
      await adminApi.reviewReport(id, action, feedbackText);
      setReports(reports.filter(r => r.id !== id));
      setActiveFeedback(null);
      setFeedbackText("");
      alert(`Report marked as ${action}.`);
    } catch (err: any) {
      alert(err.message || `Failed to review report.`);
    } finally {
      setActionLoading("");
    }
  };

  return (
    <DashboardLayout role="admin" title="Review Bug Reports">
      <div className="max-w-6xl space-y-6">
        
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 rounded-full border-4 animate-spin border-[var(--primary)] border-t-transparent" /></div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
            <ShieldCheck className="w-12 h-12 text-[var(--accent-mint)] mx-auto mb-4" />
            <p className="font-bold text-xl font-heading">No pending reports</p>
            <p className="opacity-60">All submitted bug reports have been reviewed.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a] shadow-[5px_5px_0_0_rgba(236,72,153,1)]"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold font-heading mb-1">{report.title}</h3>
                        <p className="text-sm opacity-60">
                          Submitted on {new Date(report.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <SeverityBadge severity={report.severity} />
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-black/10 dark:border-white/10">
                      <p className="text-xs font-bold uppercase mb-2">Description</p>
                      <p className="text-sm whitespace-pre-wrap">{report.description}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-black/10 dark:border-white/10">
                      <p className="text-xs font-bold uppercase mb-2">Steps to Reproduce</p>
                      <p className="text-sm font-mono whitespace-pre-wrap">{report.steps_to_reproduce}</p>
                    </div>

                    <div className="flex gap-4">
                      {report.screenshot_url && (
                        <a href={report.screenshot_url} target="_blank" rel="noreferrer" className="text-sm font-bold underline hover:text-[var(--primary)]">
                          View Screenshot
                        </a>
                      )}
                      {report.drive_link && (
                        <a href={report.drive_link} target="_blank" rel="noreferrer" className="text-sm font-bold underline hover:text-[var(--primary)]">
                          View Drive Link
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="w-full lg:w-64 shrink-0 flex flex-col gap-3 border-t-2 lg:border-t-0 lg:border-l-2 border-black/10 dark:border-white/10 pt-4 lg:pt-0 lg:pl-6">
                    <p className="font-bold text-sm text-center mb-2">Admin Actions</p>
                    
                    {activeFeedback === report.id ? (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex flex-col gap-2">
                        <textarea
                          placeholder="Optional feedback..."
                          className="w-full text-sm p-3 rounded-xl border-2 border-black dark:border-white bg-transparent resize-y outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          rows={3}
                          value={feedbackText}
                          onChange={e => setFeedbackText(e.target.value)}
                        />
                        <div className="flex flex-col gap-2 mt-2">
                          <button onClick={() => handleReview(report.id, 'approve')} disabled={actionLoading === report.id} className="w-full py-2 rounded-xl bg-[var(--accent-mint)] text-black font-bold text-sm border-2 border-black disabled:opacity-50">Confirm Approve</button>
                          <button onClick={() => handleReview(report.id, 'spam')} disabled={actionLoading === report.id} className="w-full py-2 rounded-xl bg-red-500 text-white font-bold text-sm border-2 border-black disabled:opacity-50">Mark Spam</button>
                          <button onClick={() => handleReview(report.id, 'duplicate')} disabled={actionLoading === report.id} className="w-full py-2 rounded-xl bg-gray-500 text-white font-bold text-sm border-2 border-black disabled:opacity-50">Mark Duplicate</button>
                          <button onClick={() => { setActiveFeedback(null); setFeedbackText(""); }} className="w-full py-2 rounded-xl bg-transparent font-bold text-sm underline opacity-60">Cancel</button>
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        <motion.button onClick={() => setActiveFeedback(report.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-black dark:border-white bg-[var(--accent-mint)] text-black font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                          <ShieldCheck className="w-4 h-4" /> Approve Report
                        </motion.button>
                        <motion.button onClick={() => handleReview(report.id, 'duplicate')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-700 text-current font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                          <Copy className="w-4 h-4" /> Mark Duplicate
                        </motion.button>
                        <motion.button onClick={() => handleReview(report.id, 'spam')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-black dark:border-white bg-red-500 text-white font-bold shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                          <Flag className="w-4 h-4" /> Mark Spam
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
