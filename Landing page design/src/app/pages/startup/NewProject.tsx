// ─── New Project Form ─────────────────────────────────────────────────────────
import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { startupApi } from '../../lib/api';

export function NewProject() {
  const [name, setName] = useState('');
  const [inScope, setInScope] = useState('');
  const [outOfScope, setOutOfScope] = useState('');
  const [rules, setRules] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addRule = () => setRules(r => [...r, { key: '', value: '' }]);
  const removeRule = (i: number) => setRules(r => r.filter((_, idx) => idx !== i));
  const updateRule = (i: number, field: 'key' | 'value', val: string) =>
    setRules(r => r.map((rule, idx) => idx === i ? { ...rule, [field]: val } : rule));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !inScope.trim()) { setError('Name and scope are required.'); return; }
    setLoading(true);
    setError('');
    try {
      const testing_rules = rules
        .filter(r => r.key.trim() && r.value.trim())
        .reduce<Record<string, string>>((acc, r) => ({ ...acc, [r.key.trim()]: r.value.trim() }), {});
      const project = await startupApi.createProject({ name: name.trim(), in_scope: inScope.trim(), out_of_scope: outOfScope.trim(), testing_rules });
      window.location.href = `/startup/projects/${project.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="startup" title="New Project">
      <div className="max-w-2xl">
        <motion.a href="/startup/projects" whileHover={{ x: -3 }} className="inline-flex items-center gap-1 text-sm mb-6 hover:underline opacity-60">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </motion.a>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] space-y-6"
          style={{ boxShadow: '8px 8px 0px 0px rgba(139,92,246,1)' }}
        >
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Create Project</h2>
          <p className="opacity-60 text-sm -mt-4">Your project will be saved as a draft. Submit it for admin approval when ready.</p>

          <label className="block">
            <span className="block text-sm font-semibold mb-1">Project Name *</span>
            <input
              required value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. FixMyBits API Security Audit"
              className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-semibold mb-1">In-Scope *</span>
            <p className="text-xs opacity-50 mb-1">What should testers test? Be specific about domains, APIs, features.</p>
            <textarea
              required rows={4} value={inScope} onChange={e => setInScope(e.target.value)}
              placeholder="e.g. REST API at api.myapp.com, user authentication flow, payment endpoints..."
              className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent resize-none"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-semibold mb-1">Out-of-Scope</span>
            <textarea
              rows={2} value={outOfScope} onChange={e => setOutOfScope(e.target.value)}
              placeholder="e.g. Third-party payment providers, CDN infrastructure..."
              className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent resize-none"
            />
          </label>

          {/* Testing Rules */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Testing Rules</span>
              <motion.button type="button" onClick={addRule} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 text-xs px-3 py-1 rounded-full border-2 border-black dark:border-white"
              >
                <Plus className="w-3 h-3" /> Add Rule
              </motion.button>
            </div>
            <div className="space-y-2">
              {rules.map((rule, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={rule.key} onChange={e => updateRule(i, 'key', e.target.value)}
                    placeholder="Rule name"
                    className="flex-1 px-3 py-2 rounded-lg border-2 border-black dark:border-white bg-transparent text-sm"
                  />
                  <input
                    value={rule.value} onChange={e => updateRule(i, 'value', e.target.value)}
                    placeholder="Rule details"
                    className="flex-1 px-3 py-2 rounded-lg border-2 border-black dark:border-white bg-transparent text-sm"
                  />
                  <motion.button type="button" onClick={() => removeRule(i)} whileHover={{ scale: 1.1 }}
                    className="p-2 rounded-lg border-2 border-black dark:border-white text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

          <motion.button
            type="submit" disabled={loading}
            whileHover={loading ? undefined : { scale: 1.02, rotate: -1 }}
            whileTap={loading ? undefined : { scale: 0.98 }}
            className="w-full py-3 rounded-full border-2 border-black dark:border-white font-bold text-white disabled:opacity-60"
            style={{ background: 'var(--primary)', boxShadow: '5px 5px 0px 0px rgba(236,72,153,1)' }}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </motion.button>
        </motion.form>
      </div>
    </DashboardLayout>
  );
}
