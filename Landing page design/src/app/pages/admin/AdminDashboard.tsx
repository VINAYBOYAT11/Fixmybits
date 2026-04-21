import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { adminApi } from "../../lib/api";
import { Users, FolderOpen, FileText, CheckSquare, Activity, AlertTriangle, ArrowRight } from "lucide-react";

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout role="admin"><div className="p-8">Loading stats...</div></DashboardLayout>;
  if (!stats) return <DashboardLayout role="admin"><div className="p-8 text-red-500">Failed to load platform stats.</div></DashboardLayout>;

  return (
    <DashboardLayout role="admin" title="System Dashboard">
      <div className="max-w-6xl space-y-6">
        
        {/* Top-level Alerts */}
        {(stats.users.pending > 0 || stats.projects.pending_approval > 0 || stats.reports.pending > 0) && (
          <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-2xl p-4 flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-600 shrink-0 mt-1" />
            <div>
              <p className="font-bold text-red-800 dark:text-red-200 text-lg" style={{ fontFamily: 'var(--font-heading)' }}>Action Required</p>
              <ul className="list-disc pl-5 text-red-700 dark:text-red-300 font-medium">
                {stats.users.pending > 0 && <li>{stats.users.pending} users waiting for approval</li>}
                {stats.projects.pending_approval > 0 && <li>{stats.projects.pending_approval} projects waiting for approval</li>}
                {stats.reports.pending > 0 && <li>{stats.reports.pending} bug reports waiting for review</li>}
                {stats.applications.pending > 0 && <li>{stats.applications.pending} tester applications pending</li>}
              </ul>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users" value={stats.users.total} 
            subtitle={`${stats.users.startups} Startups, ${stats.users.testers} Testers`}
            icon={Users} color="var(--primary)" link="/admin/users"
          />
          <StatCard 
            title="Active Projects" value={stats.projects.in_progress} 
            subtitle={`${stats.projects.open} Open, ${stats.projects.completed} Completed`}
            icon={FolderOpen} color="var(--accent-mint)" link="/admin/projects"
          />
          <StatCard 
            title="Total Reports" value={stats.reports.total} 
            subtitle={`${stats.reports.approved} Approved, ${stats.reports.fixed} Fixed`}
            icon={FileText} color="var(--accent-pink)" link="/admin/reports"
          />
          <StatCard 
            title="Applications" value={stats.applications.total} 
            subtitle={`${stats.applications.accepted} Accepted`}
            icon={CheckSquare} color="var(--accent-yellow)" link="/admin/applications"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <motion.section 
            className="p-6 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a]"
            style={{ boxShadow: "8px 8px 0 0 rgba(139, 92, 246, 1)" }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[var(--primary)]" />
              Report Severity Distribution
            </h2>
            <div className="space-y-4">
              {Object.entries(stats.reports.by_severity).map(([sev, count]: any) => (
                <div key={sev} className="flex justify-between items-center border-b-2 border-black/10 dark:border-white/10 pb-2">
                  <span className="font-semibold uppercase tracking-wider text-sm">{sev}</span>
                  <span className="bg-black text-white dark:bg-white dark:text-black px-3 py-1 rounded-full font-bold text-xs">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color, link }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="p-6 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] flex flex-col relative overflow-hidden"
      style={{ boxShadow: `6px 6px 0 0 ${color}` }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-bold opacity-60 uppercase tracking-wider">{title}</p>
          <h3 className="text-4xl font-black mt-1" style={{ fontFamily: 'var(--font-heading)' }}>{value}</h3>
        </div>
        <div className="p-3 rounded-xl border-2 border-black dark:border-white" style={{ background: color }}>
          <Icon className="w-6 h-6 text-black" />
        </div>
      </div>
      <div className="flex justify-between items-end mt-auto">
        <p className="text-xs font-semibold opacity-70">{subtitle}</p>
        <a href={link} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter hover:underline">
          Manage <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  );
}
