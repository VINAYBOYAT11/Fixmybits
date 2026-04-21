// ─── Tester Dashboard ─────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star, Briefcase, FileText, Search, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { testerApi, type Project, type Report, type TesterProfile } from '../../lib/api';

export function TesterDashboard() {
  const [profile, setProfile] = useState<TesterProfile | null>(null);
  const [assigned, setAssigned] = useState<Project[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([testerApi.getProfile(), testerApi.getAssignedProjects(), testerApi.listReports()])
      .then(([p, a, r]) => { setProfile(p); setAssigned(a.results); setReports(r.results); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fixedCount = reports.filter(r => r.status === 'fixed').length;
  const approvedCount = reports.filter(r => r.status === 'approved').length;

  const stats = [
    { label: 'Reputation', value: profile?.reputation_score ?? 0, icon: Star, color: 'var(--accent-yellow)', shadow: 'rgba(251,191,36,1)' },
    { label: 'Assigned Projects', value: assigned.length, icon: Briefcase, color: 'var(--primary)', shadow: 'rgba(139,92,246,1)' },
    { label: 'Reports Submitted', value: reports.length, icon: FileText, color: 'var(--accent-pink)', shadow: 'rgba(236,72,153,1)' },
    { label: 'Bugs Fixed', value: fixedCount, icon: FileText, color: 'var(--accent-mint)', shadow: 'rgba(52,211,153,1)' },
  ];

  return (
    <DashboardLayout role="tester" title="Dashboard">
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} /></div>
      ) : (
        <div className="space-y-8 max-w-6xl">
          {/* Greeting + level */}
          {profile && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]"
              style={{ boxShadow: '6px 6px 0px 0px rgba(139,92,246,1)' }}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="opacity-60 text-sm">Level</p>
                  <p className="text-2xl font-bold capitalize" style={{ fontFamily: 'var(--font-heading)' }}>{profile.experience_level} Tester</p>
                  {profile.bio && <p className="text-sm opacity-70 mt-1 max-w-lg">{profile.bio}</p>}
                </div>
                {profile.skills.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {profile.skills.slice(0, 6).map(s => (
                      <span key={s} className="text-xs px-3 py-1 rounded-full border-2 border-black dark:border-white">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="p-5 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]"
                  style={{ boxShadow: `5px 5px 0px 0px ${s.shadow}` }}
                >
                  <div className="w-10 h-10 rounded-full border-2 border-black dark:border-white flex items-center justify-center mb-3" style={{ background: s.color }}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{s.value}</div>
                  <div className="text-sm opacity-60">{s.label}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]"
              style={{ boxShadow: '5px 5px 0px 0px rgba(236,72,153,1)' }}
            >
              <h2 className="font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Quick Actions</h2>
              <div className="space-y-3">
                {[
                  { label: 'Browse Open Projects', href: '/tester/projects/open', icon: Search },
                  { label: 'My Assigned Projects', href: '/tester/projects/mine', icon: Briefcase },
                  { label: 'My Reports', href: '/tester/reports', icon: FileText },
                ].map(({ label, href, icon: Icon }) => (
                  <motion.a key={href} href={href} whileHover={{ x: 4 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                  >
                    <Icon className="w-4 h-4" /><span className="font-medium">{label}</span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Recent assigned */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="p-6 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]"
              style={{ boxShadow: '5px 5px 0px 0px rgba(52,211,153,1)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>Active Projects</h2>
                <a href="/tester/projects/mine" className="text-xs opacity-60 hover:underline">View all →</a>
              </div>
              {assigned.length === 0 ? (
                <p className="opacity-60 text-sm">No assigned projects yet. Browse open ones!</p>
              ) : (
                <div className="space-y-2">
                  {assigned.slice(0, 3).map(p => (
                    <a key={p.id} href={`/tester/projects/${p.id}`}
                      className="flex items-center justify-between p-3 rounded-xl border border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white transition-all"
                    >
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <StatusBadge status={p.status} size="sm" />
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Recent reports */}
          {reports.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>Recent Reports</h2>
                <a href="/tester/reports" className="text-sm hover:underline" style={{ color: 'var(--primary)' }}>View all →</a>
              </div>
              <div className="space-y-2">
                {reports.slice(0, 3).map(r => (
                  <div key={r.id} className="flex items-center justify-between p-4 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]">
                    <p className="font-medium text-sm truncate">{r.title}</p>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
