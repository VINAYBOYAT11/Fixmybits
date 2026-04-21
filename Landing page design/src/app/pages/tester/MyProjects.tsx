// ─── Tester Assigned Projects ────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { testerApi, type Project } from '../../lib/api';

export function MyProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testerApi.getAssignedProjects()
      .then(r => setProjects(r.results))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="tester" title="My Assigned Projects">
      <div className="max-w-5xl space-y-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]">
            <p className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>No assigned projects yet</p>
            <p className="opacity-60 mb-6">Browse and apply to open projects to get started.</p>
            <a href="/tester/projects/open" className="px-6 py-3 rounded-full border-2 border-black dark:border-white font-semibold" style={{ background: 'var(--primary)', color: 'white' }}>
              Browse Projects
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project, i) => (
              <motion.a
                key={project.id}
                href={`/tester/projects/${project.id}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-5 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] hover:shadow-[5px_5px_0px_0px_rgba(52,211,153,1)] transition-all"
              >
                <div>
                  <p className="font-bold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>{project.name}</p>
                  <p className="text-xs opacity-40 mt-1">Assigned on {new Date(project.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <StatusBadge status={project.status} />
                  <span className="text-xs opacity-40">View / Submit Bug →</span>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
