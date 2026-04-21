import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge, SeverityBadge } from '../../components/shared/StatusBadge';
import { startupApi, type Report } from '../../lib/api';
import { ReportChat } from '../../components/shared/ReportChat';
import { MessageSquare } from 'lucide-react';

const SEVERITY_FILTERS = ['All', 'Low', 'Medium', 'High', 'Critical'];
const STATUS_FILTERS = ['all', 'pending_admin_review', 'approved', 'fixed', 'spam', 'duplicate'];

export function AllReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState('');
  const [activeChat, setActiveChat] = useState<string | null>(null);
  
  const currentUser = JSON.parse(localStorage.getItem('fixmybits_user') || '{}');

  useEffect(() => {
    startupApi.listReports()
      .then(r => setReports(r.results))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = reports.filter(r => {
    const matchSev = severityFilter === 'All' || r.severity === severityFilter;
    const matchSt = statusFilter === 'all' || r.status === statusFilter;
    return matchSev && matchSt;
  });

  const handleMarkFixed = async (id: string) => {
    setActionLoading(id);
    try {
      const updated = await startupApi.markReportFixed(id);
      setReports(rs => rs.map(r => r.id === id ? updated : r));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    } finally { setActionLoading(''); }
  };

  return (
    <DashboardLayout role="startup" title="All Reports">
      <div className="max-w-5xl space-y-5">
        {/* Filters */}
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {SEVERITY_FILTERS.map(s => (
              <motion.button key={s} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1 rounded-full border-2 text-sm font-medium transition-all ${severityFilter === s ? 'border-black dark:border-white' : 'border-black/30 dark:border-white/30'}`}
                style={severityFilter === s ? { background: 'var(--accent-pink)', color: 'white' } : {}}
              >{s}</motion.button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map(s => (
              <motion.button key={s} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full border-2 text-xs font-medium capitalize transition-all ${statusFilter === s ? 'border-black dark:border-white' : 'border-black/30 dark:border-white/30'}`}
                style={statusFilter === s ? { background: 'var(--primary)', color: 'white' } : {}}
              >{s === 'all' ? 'All Statuses' : s.replace('_', ' ')}</motion.button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 opacity-60">No reports match your filters.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="p-5 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] hover:shadow-[4px_4px_0px_0px_rgba(139,92,246,1)] transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{report.title}</h3>
                    <p className="text-sm opacity-60 mt-1 line-clamp-2">{report.description}</p>
                    <p className="text-xs opacity-40 mt-2">{new Date(report.submitted_at).toLocaleDateString()}</p>
                    {report.admin_feedback && (
                      <p className="text-xs mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        Admin feedback: {report.admin_feedback}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <SeverityBadge severity={report.severity} size="sm" />
                    <StatusBadge status={report.status} size="sm" />
                    {report.status === 'approved' && (
                      <motion.button
                        onClick={() => handleMarkFixed(report.id)}
                        disabled={actionLoading === report.id}
                        whileHover={{ scale: 1.05 }}
                        className="text-xs px-3 py-1 rounded-full border-2 border-black dark:border-white font-semibold disabled:opacity-50"
                        style={{ background: 'var(--accent-mint)', color: '#1a1a1a' }}
                      >
                        {actionLoading === report.id ? '...' : 'Mark Fixed'}
                      </motion.button>
                    )}
                    {report.screenshot_url && (
                      <a href={report.screenshot_url} target="_blank" rel="noreferrer" className="text-xs underline opacity-60">Screenshot</a>
                    )}
                    {report.drive_link && (
                      <a href={report.drive_link} target="_blank" rel="noreferrer" className="text-xs underline opacity-60">Drive Link</a>
                    )}
                    <button
                      onClick={() => setActiveChat(activeChat === report.id ? null : report.id)}
                      className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-black dark:border-white text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors uppercase tracking-wider"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {activeChat === report.id ? 'Close Chat' : 'Open Chat'}
                    </button>
                  </div>
                </div>
                {activeChat === report.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4">
                    <ReportChat reportId={report.id} currentUserId={currentUser.id} />
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
