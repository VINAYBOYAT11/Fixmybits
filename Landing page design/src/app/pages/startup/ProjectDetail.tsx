// ─── Startup Project Detail ───────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge, SeverityBadge } from '../../components/shared/StatusBadge';
import { startupApi, type Project, type Application, type Report } from '../../lib/api';
import { getUser } from '../../lib/auth';
import { ReportChat } from '../../components/shared/ReportChat';
import { MessageSquare } from 'lucide-react';

type Tab = 'overview' | 'applications' | 'reports';

function getIdFromPath() {
  const parts = window.location.pathname.split('/');
  return parts[parts.length - 1];
}

export function ProjectDetail() {
  const id = getIdFromPath();
  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const currentUser = getUser();

  useEffect(() => {
    Promise.all([
      startupApi.getProject(id),
      startupApi.getProjectApplications(id),
      startupApi.getProjectReports(id),
    ]).then(([p, a, r]) => {
      setProject(p);
      setApplications(a.results);
      setReports(r.results);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    setActionLoading('submit');
    try {
      const updated = await startupApi.submitProject(id);
      setProject(updated);
      setMessage({ type: 'success', text: 'Project submitted for admin approval!' });
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to submit.' });
    } finally { setActionLoading(''); }
  };

  const handleComplete = async () => {
    setActionLoading('complete');
    try {
      const updated = await startupApi.completeProject(id);
      setProject(updated);
      setMessage({ type: 'success', text: 'Project marked as completed!' });
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to complete.' });
    } finally { setActionLoading(''); }
  };

  const handleMarkFixed = async (reportId: string) => {
    setActionLoading(reportId);
    try {
      const updated = await startupApi.markReportFixed(reportId);
      setReports(rs => rs.map(r => r.id === reportId ? updated : r));
      setMessage({ type: 'success', text: 'Report marked as fixed!' });
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed.' });
    } finally { setActionLoading(''); }
  };

  if (loading) return <DashboardLayout role="startup" title="Project"><div className="flex justify-center py-16"><div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} /></div></DashboardLayout>;
  if (!project) return <DashboardLayout role="startup" title="Project"><p className="opacity-60">Project not found.</p></DashboardLayout>;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'applications', label: 'Applications', count: applications.length },
    { key: 'reports', label: 'Reports', count: reports.length },
  ];

  return (
    <DashboardLayout role="startup" title={project.name}>
      <div className="max-w-4xl space-y-6">
        <motion.a href="/startup/projects" whileHover={{ x: -3 }} className="inline-flex items-center gap-1 text-sm opacity-60 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </motion.a>

        {/* Header */}
        <div className="p-6 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]" style={{ boxShadow: '6px 6px 0px 0px rgba(139,92,246,1)' }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{project.name}</h2>
              <p className="text-sm opacity-50 mt-1">Created {new Date(project.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={project.status} />
              {project.status === 'draft' && (
                <motion.button onClick={handleSubmit} disabled={!!actionLoading} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-black dark:border-white font-semibold text-sm disabled:opacity-60"
                  style={{ background: 'var(--accent-mint)', color: '#1a1a1a' }}
                >
                  <Send className="w-4 h-4" />
                  {actionLoading === 'submit' ? 'Submitting...' : 'Submit for Approval'}
                </motion.button>
              )}
              {project.status === 'in_progress' && (
                <motion.button onClick={handleComplete} disabled={!!actionLoading} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-black dark:border-white font-semibold text-sm disabled:opacity-60"
                  style={{ background: 'var(--accent-yellow)', color: '#1a1a1a' }}
                >
                  <CheckCircle className="w-4 h-4" />
                  {actionLoading === 'complete' ? 'Completing...' : 'Mark as Completed'}
                </motion.button>
              )}
            </div>
          </div>
          {project.rejection_reason && (
            <div className="mt-4 p-3 rounded-xl border-2 border-red-400 bg-red-50 dark:bg-red-950 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{project.rejection_reason}</p>
            </div>
          )}
          {message && (
            <div className={`mt-4 p-3 rounded-xl text-sm ${message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {message.text}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(t => (
            <motion.button key={t.key} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-full border-2 text-sm font-medium transition-all ${tab === t.key ? 'border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(139,92,246,1)]' : 'border-black/40 dark:border-white/40'}`}
              style={tab === t.key ? { background: 'var(--primary)', color: 'white' } : {}}
            >
              {t.label}{t.count !== undefined ? ` (${t.count})` : ''}
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {tab === 'overview' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]">
                <h3 className="font-bold mb-2">In Scope</h3>
                <p className="whitespace-pre-wrap text-sm opacity-80">{project.in_scope}</p>
              </div>
              {project.out_of_scope && (
                <div className="p-5 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]">
                  <h3 className="font-bold mb-2">Out of Scope</h3>
                  <p className="whitespace-pre-wrap text-sm opacity-80">{project.out_of_scope}</p>
                </div>
              )}
              {Object.keys(project.testing_rules).length > 0 && (
                <div className="p-5 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]">
                  <h3 className="font-bold mb-3">Testing Rules</h3>
                  <dl className="space-y-2">
                    {Object.entries(project.testing_rules).map(([k, v]) => (
                      <div key={k} className="flex gap-2 text-sm">
                        <dt className="font-semibold min-w-[120px]">{k}:</dt>
                        <dd className="opacity-80">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          )}

          {tab === 'applications' && (
            <div className="space-y-3">
              {applications.length === 0 ? <p className="opacity-60 text-center py-12">No testers have applied yet.</p> : applications.map(app => (
                <div key={app.id} className="p-4 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{app.tester?.email ?? 'Tester'}</p>
                    {app.tester?.experience_level && <p className="text-xs opacity-60 capitalize">{app.tester.experience_level}</p>}
                    {app.tester?.skills && app.tester.skills.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {app.tester.skills.slice(0, 4).map(s => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-full border border-black/30 dark:border-white/30">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <StatusBadge status={app.status} size="sm" />
                    <p className="text-xs opacity-40 mt-1">{new Date(app.applied_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'reports' && (
            <div className="space-y-3">
              {reports.length === 0 ? <p className="opacity-60 text-center py-12">No reports submitted yet.</p> : reports.map(r => (
                <div key={r.id} className="p-4 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold">{r.title}</p>
                      <p className="text-sm opacity-60 mt-1 line-clamp-2">{r.description}</p>
                      <p className="text-xs opacity-40 mt-1">{new Date(r.submitted_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <SeverityBadge severity={r.severity} size="sm" />
                      <StatusBadge status={r.status} size="sm" />
                      {r.status === 'approved' && (
                        <motion.button
                          onClick={() => handleMarkFixed(r.id)}
                          disabled={actionLoading === r.id}
                          whileHover={{ scale: 1.05 }}
                          className="text-xs px-3 py-1 rounded-full border-2 border-black dark:border-white font-semibold disabled:opacity-50"
                          style={{ background: 'var(--accent-mint)', color: '#1a1a1a' }}
                        >
                          {actionLoading === r.id ? '...' : 'Mark Fixed'}
                        </motion.button>
                      )}
                      <button
                        onClick={() => setActiveChat(activeChat === r.id ? null : r.id)}
                        className="flex items-center gap-2 px-3 py-1 rounded-lg border-2 border-black dark:border-white text-xs font-bold hover:bg-black/5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {activeChat === r.id ? 'Close' : 'Chat'}
                      </button>
                    </div>
                  </div>
                  {activeChat === r.id && (
                    <div className="mt-4">
                      <ReportChat reportId={r.id} currentUserId={currentUser?.id ?? ''} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
