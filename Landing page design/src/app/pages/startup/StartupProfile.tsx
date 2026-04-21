// ─── Startup Profile ─────────────────────────────────────────────────────────
import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { motion } from 'motion/react';
import { Building2, Globe, ImagePlus } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { startupApi, type StartupProfile as ProfileType } from '../../lib/api';

export function StartupProfile() {
  const [profile, setProfile] = useState<ProfileType>({ company_name: '', website: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    startupApi.getProfile()
      .then(p => { setProfile(p); if (p.logo) setLogoPreview(p.logo); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const formData = new FormData();
      formData.append('company_name', profile.company_name);
      formData.append('website', profile.website ?? '');
      if (logoFile) formData.append('logo', logoFile);
      const updated = await startupApi.updateProfile(formData);
      setProfile(updated);
      setStatus({ type: 'success', text: 'Profile updated successfully!' });
    } catch (e) {
      setStatus({ type: 'error', text: e instanceof Error ? e.message : 'Failed to save.' });
    } finally { setSaving(false); }
  };

  return (
    <DashboardLayout role="startup" title="Profile">
      <div className="max-w-2xl">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} /></div>
        ) : (
          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] space-y-6"
            style={{ boxShadow: '8px 8px 0px 0px rgba(52,211,153,1)' }}
          >
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Company Profile</h2>

            {/* Logo */}
            <div>
              <p className="text-sm font-semibold mb-3">Company Logo</p>
              <label className="cursor-pointer">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-black dark:border-white flex items-center justify-center overflow-hidden hover:border-[var(--primary)] transition-colors">
                  {logoPreview ? (
                    <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 opacity-40">
                      <ImagePlus className="w-6 h-6" />
                      <span className="text-xs">Upload</span>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="sr-only" />
              </label>
            </div>

            {/* Company name */}
            <label className="block">
              <span className="flex items-center gap-2 text-sm font-semibold mb-1"><Building2 className="w-4 h-4" />Company Name *</span>
              <input
                required value={profile.company_name}
                onChange={e => setProfile(p => ({ ...p, company_name: e.target.value }))}
                placeholder="Acme Corp"
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent"
              />
            </label>

            {/* Website */}
            <label className="block">
              <span className="flex items-center gap-2 text-sm font-semibold mb-1"><Globe className="w-4 h-4" />Website</span>
              <input
                type="url" value={profile.website ?? ''}
                onChange={e => setProfile(p => ({ ...p, website: e.target.value }))}
                placeholder="https://mycompany.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent"
              />
            </label>

            {status && (
              <p className={`text-sm ${status.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {status.text}
              </p>
            )}

            <motion.button
              type="submit" disabled={saving}
              whileHover={saving ? undefined : { scale: 1.02, rotate: -1 }}
              whileTap={saving ? undefined : { scale: 0.98 }}
              className="w-full py-3 rounded-full border-2 border-black dark:border-white font-bold text-white disabled:opacity-60"
              style={{ background: 'var(--primary)', boxShadow: '4px 4px 0px 0px rgba(52,211,153,1)' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </motion.form>
        )}
      </div>
    </DashboardLayout>
  );
}
