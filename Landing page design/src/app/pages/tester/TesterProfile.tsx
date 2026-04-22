import { useState, useEffect, type FormEvent } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { testerApi, type TesterProfile } from "../../lib/api";
import { motion } from "motion/react";
import { User, Code2, Wrench, Trophy, Save, AlertCircle, FileText } from "lucide-react";

export function TesterProfilePage() {
  const [profile, setProfile] = useState<TesterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await testerApi.getProfile();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await testerApi.updateProfile({
        skills: profile.skills,
        tools: profile.tools,
        experience_level: profile.experience_level,
        bio: profile.bio,
      });
      setProfile(updated);
      setError(null);
      // Show success inline
      const el = document.getElementById('profile-save-status');
      if (el) { el.textContent = 'Profile saved!'; el.className = 'text-sm text-green-600 dark:text-green-400 font-semibold'; setTimeout(() => { if (el) el.textContent = ''; }, 3000); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleArrayChange = (field: 'skills' | 'tools', value: string) => {
    // splits comma-separated string into array
    if (!profile) return;
    setProfile({ ...profile, [field]: value.split(',').map(s => s.trim()).filter(Boolean) });
  };

  if (loading) return <DashboardLayout role="tester"><div className="p-8">Loading profile...</div></DashboardLayout>;
  if (!profile) return <DashboardLayout role="tester"><div className="p-8 text-red-500">Error loading profile data.</div></DashboardLayout>;

  return (
    <DashboardLayout role="tester">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-between" style={{ fontFamily: 'var(--font-heading)' }}>
            Tester Profile
            <span className="text-xl font-bold bg-[#10b981] px-4 py-1 rounded-full border-2 border-black" title="Reputation Score">
              <Trophy className="w-5 h-5 inline mr-1" />
              {profile.reputation_score} Rep
            </span>
          </h1>
          <p className="text-lg opacity-60">Manage your skills and bio to attract better projects.</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-100 border-2 border-red-500 rounded-xl flex items-center gap-3 text-red-700 font-bold">
            <AlertCircle className="w-6 h-6" />
            <p>{error}</p>
          </div>
        )}

        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]"
          style={{ boxShadow: "8px 8px 0 0 rgba(139, 92, 246, 1)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-bold mb-2">
                    <User className="w-4 h-4" /> Experience Level
                  </span>
                  <select 
                    value={profile.experience_level}
                    onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent focus:outline-none focus:ring-2 ring-[var(--primary)] text-current"
                  >
                    <option value="beginner" className="text-black">Beginner</option>
                    <option value="intermediate" className="text-black">Intermediate</option>
                    <option value="advanced" className="text-black">Advanced</option>
                  </select>
                </label>

                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-bold mb-2">
                    <FileText className="w-4 h-4" /> Bio (About you)
                  </span>
                  <textarea
                    rows={6}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent focus:outline-none focus:ring-2 ring-[var(--primary)] resize-y"
                    placeholder="Tell startups about your background, favorite targets, and testing methodology..."
                  />
                </label>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-bold mb-2">
                    <Code2 className="w-4 h-4" /> Skills (Comma separated)
                  </span>
                  <input
                    type="text"
                    value={profile.skills?.join(", ") || ""}
                    onChange={(e) => handleArrayChange('skills', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent focus:outline-none focus:ring-2 ring-[var(--primary)]"
                    placeholder="e.g. XSS, SQLi, Penetration Testing, Source Code Review"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.skills?.map(s => (
                      <span key={s} className="text-xs px-2 py-1 rounded-md border border-black dark:border-white bg-[var(--accent-mint)] text-black">
                        {s}
                      </span>
                    ))}
                  </div>
                </label>

                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-bold mb-2">
                    <Wrench className="w-4 h-4" /> Tools (Comma separated)
                  </span>
                  <input
                    type="text"
                    value={profile.tools?.join(", ") || ""}
                    onChange={(e) => handleArrayChange('tools', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent focus:outline-none focus:ring-2 ring-[var(--primary)]"
                    placeholder="e.g. Burp Suite, OWASP ZAP, Metasploit, Nmap"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.tools?.map(t => (
                      <span key={t} className="text-xs px-2 py-1 rounded-md border border-black dark:border-white bg-[var(--accent-pink)] text-black">
                        {t}
                      </span>
                    ))}
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-black/10 dark:border-white/10 flex justify-between items-center">
              <span id="profile-save-status" className="text-sm"></span>
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: 1.02, rotate: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-8 py-4 rounded-full border-2 border-black dark:border-white font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                style={{ background: 'var(--primary)' }}
              >
                <Save className="w-5 h-5" />
                {saving ? "Saving Changes..." : "Save Profile"}
              </motion.button>
            </div>
          </form>
        </motion.section>
      </div>
    </DashboardLayout>
  );
}
