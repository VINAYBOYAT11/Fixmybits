import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { registerUser, type RegisterPayload } from '../lib/api';

export function CTA() {
  const [formData, setFormData] = useState<RegisterPayload>({
    email: '',
    password: '',
    confirm_password: '',
    role: 'tester',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');

  const submitLabel = isSubmitting ? 'Creating account...' : 'Create free account';

  const validate = () => {
    if (!formData.email.includes('@')) return 'Enter a valid email address.';
    if (formData.password.length < 8) return 'Password must be at least 8 characters.';
    if (formData.password !== formData.confirm_password) return 'Passwords do not match.';
    if (formData.role === 'startup' && !formData.company_name?.trim()) return 'Company name is required for startups.';
    return '';
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const validationError = validate();
    if (validationError) {
      setStatusType('error');
      setStatusMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setStatusType('');
    setStatusMessage('');
    try {
      await registerUser({
        ...formData,
        email: formData.email.trim().toLowerCase(),
        company_name: formData.company_name?.trim() || undefined,
      });
      setStatusType('success');
      setStatusMessage('Registration successful. You can now log in.');
      setFormData({ email: '', password: '', confirm_password: '', role: 'tester' });
    } catch (error) {
      setStatusType('error');
      setStatusMessage(error instanceof Error ? error.message : 'Unable to register now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="signup" tabIndex={-1} className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full" style={{ background: 'var(--accent-pink)' }} />
        <div className="absolute bottom-20 right-20 w-40 h-40 rotate-45" style={{ background: 'var(--accent-yellow)' }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full" style={{ background: 'var(--accent-mint)' }} />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-12 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]"
          style={{
            boxShadow: '12px 12px 0px 0px rgba(139, 92, 246, 1)',
          }}
        >
          <h2 className="text-5xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
            Ready to fix your bits?
          </h2>
          <p className="text-xl opacity-70 mb-10 max-w-2xl mx-auto">
            Join thousands of testers and startups building better products together.
          </p>

          <form onSubmit={onSubmit} className="max-w-2xl mx-auto text-left space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Work email"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-[#1f1f1f]"
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as RegisterPayload['role'] }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-[#1f1f1f]"
              >
                <option value="tester">Join as tester</option>
                <option value="startup">Join as startup</option>
              </select>
            </div>

            {formData.role === 'startup' && (
              <input
                required
                type="text"
                value={formData.company_name ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, company_name: e.target.value }))}
                placeholder="Company name"
                autoComplete="organization"
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-[#1f1f1f]"
              />
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <input
                required
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Password (min 8 chars)"
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-[#1f1f1f]"
              />
              <input
                required
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData((prev) => ({ ...prev, confirm_password: e.target.value }))}
                placeholder="Confirm password"
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-[#1f1f1f]"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-4">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 rounded-full border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(236,72,153,1)] flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'var(--accent-pink)', color: 'white', fontSize: '1.125rem', fontWeight: 600 }}
                whileHover={isSubmitting ? undefined : { scale: 1.05, rotate: -2 }}
                whileTap={isSubmitting ? undefined : { scale: 0.95 }}
              >
                {submitLabel}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
            {statusMessage && (
              <p className={`text-sm ${statusType === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {statusMessage}
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
