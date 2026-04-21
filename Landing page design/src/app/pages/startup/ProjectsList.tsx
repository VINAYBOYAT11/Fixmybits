// ─── Startup Projects List ────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { startupApi, type Project } from '../../lib/api';

const STATUS_FILTERS = ['all', 'draft', 'pending_approval', 'open', 'in_progress', 'completed', 'rejected'];

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    startupApi.listProjects()
      .then(r => setProjects(r.results))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p => {
    const matchStatus = filter === 'all' || p.status === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <DashboardLayout role="startup" title="My Projects">
      <div className="max-w-5xl space-y-6">
        {/* Search + New button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent"
            />
          </div>
          <motion.a
            href="/startup/projects/new"
            whileHover={{ scale: 1.03, rotate: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-black dark:border-white font-semibold whitespace-nowrap"
            style={{ background: 'var(--primary)', color: 'white', boxShadow: '4px 4px 0px 0px rgba(236,72,153,1)' }}
          >
            <Plus className="w-4 h-4" /> New Project
          </motion.a>
        </div>

        {/* Status filter chips */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <motion.button
              key={s}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full border-2 text-sm font-medium capitalize transition-all ${
                filter === s ? 'border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(139,92,246,1)]' : 'border-black/40 dark:border-white/40'
              }`}
              style={filter === s ? { background: 'var(--primary)', color: 'white' } : {}}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </motion.button>
          ))}
        </div>

        {/* Projects */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]">
            <p className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>No projects found</p>
            <p className="opacity-60 mb-6">Create your first project to get started.</p>
            <a href="/startup/projects/new" className="px-6 py-3 rounded-full border-2 border-black dark:border-white font-semibold" style={{ background: 'var(--primary)', color: 'white' }}>
              + New Project
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((project, i) => (
              <motion.a
                key={project.id}
                href={`/startup/projects/${project.id}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-5 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] hover:shadow-[5px_5px_0px_0px_rgba(139,92,246,1)] transition-all"
              >
                <div>
                  <p className="font-bold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>{project.name}</p>
                  <p className="text-sm opacity-60 mt-1 line-clamp-1">{project.in_scope}</p>
                  <p className="text-xs opacity-40 mt-1">{new Date(project.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <StatusBadge status={project.status} />
                  <span className="text-xs opacity-40">View →</span>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
