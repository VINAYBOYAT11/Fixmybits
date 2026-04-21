// ─── Tester Open Projects ─────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { testerApi, type Project } from '../../lib/api';

export function OpenProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Only fetch when search changes (basic implementation)
    const timeoutId = setTimeout(() => {
      setLoading(true);
      testerApi.getOpenProjects(search)
        .then(r => setProjects(r.results))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <DashboardLayout role="tester" title="Browse Open Projects">
      <div className="max-w-5xl space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects by name..."
            className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent"
          />
        </div>

        {/* Projects */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]">
            <p className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>No open projects found</p>
            <p className="opacity-60">Check back later or try a different search.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project, i) => (
              <motion.a
                key={project.id}
                href={`/tester/projects/${project.id}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-5 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] hover:shadow-[5px_5px_0px_0px_rgba(251,191,36,1)] transition-all"
              >
                <div>
                  <p className="font-bold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>{project.name}</p>
                  <p className="text-sm opacity-60 mt-1 line-clamp-1">{project.in_scope}</p>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <StatusBadge status={project.status} />
                  {project.has_applied ? (
                    <span className="text-xs font-semibold px-2 py-1 bg-black/10 dark:bg-white/10 rounded-full">Applied</span>
                  ) : (
                    <span className="text-xs opacity-40">View Details →</span>
                  )}
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
