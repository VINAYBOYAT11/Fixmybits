// ─── Startup Dashboard ───────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FolderOpen, FileText, AlertCircle, CheckCircle, Plus, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { startupApi, type Project, type Report } from '../../lib/api';

export function StartupDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([startupApi.listProjects(), startupApi.listReports()])
      .then(([p, r]) => { setProjects(p.results); setReports(r.results); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusCounts = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  const openReports = reports.filter(r => r.status === 'approved').length;
  const pendingReports = reports.filter(r => r.status === 'pending_admin_review').length;

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderOpen, color: 'var(--primary)', shadow: 'rgba(139,92,246,1)' },
    { label: 'Open Reports', value: openReports, icon: CheckCircle, color: 'var(--accent-mint)', shadow: 'rgba(52,211,153,1)' },
    { label: 'Pending Reports', value: pendingReports, icon: AlertCircle, color: 'var(--accent-yellow)', shadow: 'rgba(251,191,36,1)' },
    { label: 'Total Reports', value: reports.length, icon: FileText, color: 'var(--accent-pink)', shadow: 'rgba(236,72,153,1)' },
  ];

  return (
    <DashboardLayout role="startup" title="Dashboard">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="space-y-8 max-w-6xl">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="p-5 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]"
                  style={{ boxShadow: `5px 5px 0px 0px ${stat.shadow}` }}
                >
                  <div className="w-10 h-10 rounded-full border-2 border-black dark:border-white flex items-center justify-center mb-3" style={{ background: stat.color }}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{stat.value}</div>
                  <div className="text-sm opacity-60">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Projects by status + quick actions */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Project status breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]"
              style={{ boxShadow: '6px 6px 0px 0px rgba(139,92,246,1)' }}
            >
              <h2 className="font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Projects by Status</h2>
              {Object.keys(statusCounts).length === 0 ? (
                <p className="opacity-60 text-sm">No projects yet.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <StatusBadge status={status} />
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="p-6 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]"
              style={{ boxShadow: '6px 6px 0px 0px rgba(236,72,153,1)' }}
            >
              <h2 className="font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Quick Actions</h2>
              <div className="space-y-3">
                <motion.a href="/startup/projects/new" whileHover={{ x: 4 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                >
                  <Plus className="w-4 h-4" /><span className="font-medium">Create New Project</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </motion.a>
                <motion.a href="/startup/projects" whileHover={{ x: 4 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                >
                  <FolderOpen className="w-4 h-4" /><span className="font-medium">View All Projects</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </motion.a>
                <motion.a href="/startup/reports" whileHover={{ x: 4 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                >
                  <FileText className="w-4 h-4" /><span className="font-medium">View All Reports</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Recent projects */}
          {projects.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>Recent Projects</h2>
                <a href="/startup/projects" className="text-sm hover:underline" style={{ color: 'var(--primary)' }}>View all →</a>
              </div>
              <div className="space-y-3">
                {projects.slice(0, 4).map((project) => (
                  <motion.a
                    key={project.id}
                    href={`/startup/projects/${project.id}`}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-4 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] hover:shadow-[4px_4px_0px_0px_rgba(139,92,246,1)] transition-all"
                  >
                    <div>
                      <p className="font-semibold">{project.name}</p>
                      <p className="text-xs opacity-60 mt-0.5">{new Date(project.created_at).toLocaleDateString()}</p>
                    </div>
                    <StatusBadge status={project.status} size="sm" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
