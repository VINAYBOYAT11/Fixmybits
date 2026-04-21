// ─── Tester Project Detail & Report Submission ──────────────────────────────
import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { testerApi, type Project } from '../../lib/api';

function getIdFromPath() {
  const parts = window.location.pathname.split('/');
  return parts[parts.length - 1];
}

export function TesterProjectDetail() {
  const id = getIdFromPath();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Report form state
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [steps, setSteps] = useState('');
  const [sev, setSev] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Low');
  const [link, setLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  useEffect(() => {
    testerApi.getProjectDetail(id)
      .then(p => setProject(p))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    setActionLoading(true);
    setMsg(null);
    try {
      await testerApi.applyToProject(id);
      setProject(p => p ? { ...p, has_applied: true } : null);
      setMsg({ type: 'success', text: 'Application submitted! Startup will review it.' });
    } catch (e) {
      setMsg({ type: 'error', text: e instanceof Error ? e.message : 'Failed to apply' });
    } finally { setActionLoading(false); }
  };

  const handleCancelApplication = async () => {
    if (!window.confirm("Are you sure you want to cancel your application?")) return;
    setActionLoading(true);
    setMsg(null);
    try {
      await testerApi.cancelApplication(id);
      setProject(p => p ? { ...p, has_applied: false } : null);
      setMsg({ type: 'success', text: 'Application cancelled successfully.' });
    } catch (e) {
      setMsg({ type: 'error', text: e instanceof Error ? e.message : 'Failed to cancel application' });
    } finally { setActionLoading(false); }
  };

  const submitReport = async (e: FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMsg(null);
    try {
      const parts = new FormData();
      parts.append('title', title);
      parts.append('description', desc);
      parts.append('steps_to_reproduce', steps);
      parts.append('severity', sev);
      if (link) parts.append('drive_link', link);
      if (file) parts.append('screenshot', file);

      await testerApi.submitReport(id, parts);
      setReportSubmitted(true);
      setMsg({ type: 'success', text: 'Report submitted successfully!' });
      // Reset form
      setTitle(''); setDesc(''); setSteps(''); setSev('Low'); setLink(''); setFile(null);
    } catch (e) {
      setMsg({ type: 'error', text: e instanceof Error ? e.message : 'Failed to submit report' });
    } finally { setActionLoading(false); }
  };

  if (loading) return <DashboardLayout role="tester"><div className="flex justify-center py-16"><div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} /></div></DashboardLayout>;
  if (!project) return <DashboardLayout role="tester"><p className="opacity-60">Project not found.</p></DashboardLayout>;

  // A tester is assigned if project.assigned_tester exists and they are viewing it from /tester/projects/mine
  // We'll infer assigned status by checking if it's "in_progress"
  const isAssigned = project.status === 'in_progress' || project.status === 'completed';

  return (
    <DashboardLayout role="tester" title="Project Details">
      <div className="max-w-4xl space-y-6">
        <motion.button onClick={() => window.history.back()} whileHover={{ x: -3 }} className="inline-flex items-center gap-1 text-sm opacity-60 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back
        </motion.button>

        {/* Header */}
        <div className="p-6 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{project.name}</h2>
              <p className="text-sm opacity-60 mt-1">Status: <StatusBadge status={project.status} size="sm" /></p>
            </div>
            {!isAssigned && project.status === 'open' && !project.has_applied && (
              <motion.button
                onClick={handleApply}
                disabled={actionLoading}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-6 py-2 rounded-full border-2 border-black dark:border-white font-bold disabled:opacity-50 text-white"
                style={{ background: 'var(--primary)', boxShadow: '4px 4px 0px 0px rgba(139,92,246,1)' }}
              >
                {actionLoading ? 'Applying...' : 'Apply to Test'}
              </motion.button>
            )}
            {!isAssigned && project.has_applied && (
               <div className="flex flex-col items-end gap-2">
                 <div className="px-4 py-2 rounded-full border-2 border-dashed border-black/40 dark:border-white/40 flex items-center gap-2">
                   <CheckCircle className="w-4 h-4 text-green-500" />
                   <span className="text-sm font-semibold opacity-60">Application Pending</span>
                 </div>
                 <button 
                  onClick={handleCancelApplication}
                  disabled={actionLoading}
                  className="text-xs font-bold text-red-500 hover:underline disabled:opacity-50"
                 >
                   {actionLoading ? 'Cancelling...' : 'Cancel Application'}
                 </button>
               </div>
            )}
          </div>
          {msg && !reportSubmitted && <p className={`mt-4 text-sm ${msg.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{msg.text}</p>}
        </div>

        {/* Scope Info */}
        <div className="grid md:grid-cols-2 gap-6">
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
        </div>

        {/* Bug Report Form (if assigned) */}
        {isAssigned && (
          <div className="pt-6 border-t-2 border-black/20 dark:border-white/20">
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Submit Bug Report</h3>
            {reportSubmitted && msg?.type === 'success' ? (
              <div className="p-6 rounded-2xl border-2 border-green-500 bg-green-50 dark:bg-green-950 flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
                <p className="font-bold text-green-800 dark:text-green-200">Report Submitted!</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">You can view it in your Reports tab.</p>
                <button onClick={() => setReportSubmitted(false)} className="mt-4 px-4 py-2 border-2 border-green-500 rounded-full text-xs font-semibold hover:bg-green-100 dark:hover:bg-green-900 text-green-800 dark:text-green-200">Submit another</button>
              </div>
            ) : (
              <motion.form onSubmit={submitReport} className="space-y-4 p-6 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]" style={{ boxShadow: '8px 8px 0px 0px rgba(52,211,153,1)' }}>
                <label className="block">
                  <span className="block text-sm font-semibold mb-1">Title *</span>
                  <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Broken access control on /admin" className="w-full px-4 py-2 rounded-xl border-2 border-black dark:border-white bg-transparent" />
                </label>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-sm font-semibold mb-1">Severity</span>
                    <select value={sev} onChange={e => setSev(e.target.value as any)} className="w-full px-4 py-2 rounded-xl border-2 border-black dark:border-white bg-transparent">
                      <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-sm font-semibold mb-1">Drive Link (Optional)</span>
                    <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="Google Drive video link" className="w-full px-4 py-2 rounded-xl border-2 border-black dark:border-white bg-transparent" />
                  </label>
                </div>

                <label className="block">
                  <span className="block text-sm font-semibold mb-1">Description *</span>
                  <textarea required rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="What is the bug?" className="w-full px-4 py-2 rounded-xl border-2 border-black dark:border-white bg-transparent resize-none" />
                </label>

                <label className="block">
                  <span className="block text-sm font-semibold mb-1">Steps to Reproduce *</span>
                  <textarea required rows={3} value={steps} onChange={e => setSteps(e.target.value)} placeholder="1. Go to... 2. Click..." className="w-full px-4 py-2 rounded-xl border-2 border-black dark:border-white bg-transparent resize-none" />
                </label>

                <div>
                  <span className="block text-sm font-semibold mb-1">Screenshot (Optional)</span>
                  <label className="flex items-center gap-3 w-max cursor-pointer px-4 py-2 border-2 border-dashed border-black/40 dark:border-white/40 hover:border-black dark:hover:border-white rounded-xl">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">{file ? file.name : 'Upload Image'}</span>
                    <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="sr-only" />
                  </label>
                </div>

                {msg && <p className="text-red-500 text-sm mt-2">{msg.text}</p>}
                
                <motion.button type="submit" disabled={actionLoading} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-full border-2 border-black dark:border-white font-bold disabled:opacity-50"
                  style={{ background: 'var(--accent-mint)', color: '#1a1a1a', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                >
                  {actionLoading ? 'Submitting...' : 'Submit Report'}
                </motion.button>
              </motion.form>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
