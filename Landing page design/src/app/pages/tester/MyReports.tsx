// ─── Tester My Reports ────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge, SeverityBadge } from '../../components/shared/StatusBadge';
import { testerApi, type Report } from '../../lib/api';
import { getUser } from '../../lib/auth';
import { ReportChat } from '../../components/shared/ReportChat';
import { MessageSquare } from 'lucide-react';

export function MyReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const currentUser = getUser();


  useEffect(() => {
    testerApi.listReports()
      .then(r => setReports(r.results))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="tester" title="My Submitted Reports">
      <div className="max-w-4xl space-y-6">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} /></div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]">
            <p className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>No reports yet</p>
            <p className="opacity-60 mb-6">Submit bugs on your assigned projects.</p>
            <a href="/tester/projects/mine" className="px-6 py-3 rounded-full border-2 border-black dark:border-white font-semibold" style={{ background: 'var(--primary)', color: 'white' }}>Go to Projects</a>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r, i) => (
              <motion.div
                key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-5 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] hover:shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] transition-all"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{r.title}</h3>
                    <p className="text-sm opacity-70 line-clamp-2">{r.description}</p>
                    <p className="text-xs opacity-40 mt-2">Submitted on {new Date(r.submitted_at).toLocaleDateString()}</p>
                    {r.admin_feedback && (
                      <div className="mt-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                        <p className="text-xs font-semibold mb-1">Admin Feedback</p>
                        <p className="text-sm italic opacity-80">{r.admin_feedback}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <SeverityBadge severity={r.severity} />
                    <StatusBadge status={r.status} />
                    <button
                      onClick={() => setActiveChat(activeChat === r.id ? null : r.id)}
                      className="mt-auto flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-black dark:border-white text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors uppercase tracking-wider"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {activeChat === r.id ? 'Close Chat' : 'Open Chat'}
                    </button>
                  </div>
                </div>
                {activeChat === r.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4">
                    <ReportChat reportId={r.id} currentUserId={currentUser?.id ?? ''} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
