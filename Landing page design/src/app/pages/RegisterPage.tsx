// ─── Registration Page ────────────────────────────────────────────────────────
import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Shield, Building2, UserCircle2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { registerUser } from '../lib/api';
import { setTokens } from '../lib/auth';
import { AnimatedBackground } from '../components/AnimatedBackground';

type Role = 'startup' | 'tester';

export function RegisterPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!role) { setError('Please select a role.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await registerUser({
        email,
        password,
        confirm_password: confirmPassword,
        role,
        company_name: role === 'startup' ? companyName : undefined,
        avatar_power: 'Tech',
      });
      // Auto-login: store tokens and redirect to dashboard
      setTokens(response.access, response.refresh, response.user);
      window.location.href = role === 'startup' ? '/startup/dashboard' : '/tester/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
        <AnimatedBackground />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 p-12 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] text-center max-w-md shadow-[10px_10px_0px_0px_rgba(52,211,153,1)]"
        >
          <div className="w-20 h-20 rounded-full bg-[var(--accent-mint)] flex items-center justify-center mx-auto mb-6 border-2 border-black">
            <CheckCircle2 className="w-12 h-12 text-black" />
          </div>
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Registration Success!</h2>
          <p className="opacity-60 mb-8">Your account has been created. You can now login to access your dashboard.</p>
          <motion.a 
            href="/login"
            whileHover={{ scale: 1.05, rotate: -1 }}
            className="block w-full py-4 rounded-full border-2 border-black dark:border-white font-bold text-white"
            style={{ background: 'var(--primary)', boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}
          >
            Go to Login
          </motion.a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-4xl grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Role Selection */}
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Join the Mission</h1>
            <p className="text-xl opacity-60">Select your path to continue.</p>
          </div>

          <div className="grid gap-6">
            <motion.button
              type="button"
              onClick={() => setRole('startup')}
              whileHover={{ x: 8 }}
              className={`p-6 rounded-3xl border-2 text-left transition-all ${
                role === 'startup' 
                ? 'border-black dark:border-white bg-[var(--primary)] text-white shadow-[8px_8px_0px_0px_rgba(236,72,153,1)]' 
                : 'border-black/20 dark:border-white/20 bg-white/5 hover:border-black dark:hover:border-white'
              }`}
            >
              <div className="flex items-center gap-4 mb-3">
                <Building2 className={`w-8 h-8 ${role === 'startup' ? 'text-white' : 'text-[var(--primary)]'}`} />
                <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>I am a Startup</span>
              </div>
              <p className={`text-sm ${role === 'startup' ? 'opacity-90' : 'opacity-60'}`}>
                I want to secure my software and connect with talented researchers.
              </p>
            </motion.button>

            <motion.button
              type="button"
              onClick={() => setRole('tester')}
              whileHover={{ x: 8 }}
              className={`p-6 rounded-3xl border-2 text-left transition-all ${
                role === 'tester' 
                ? 'border-black dark:border-white bg-[var(--accent-mint)] text-black shadow-[8px_8px_0px_0px_rgba(139,92,246,1)]' 
                : 'border-black/20 dark:border-white/20 bg-white/5 hover:border-black dark:hover:border-white'
              }`}
            >
              <div className="flex items-center gap-4 mb-3">
                <UserCircle2 className={`w-8 h-8 ${role === 'tester' ? 'text-black' : 'text-[var(--accent-mint)]'}`} />
                <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>I am a Tester</span>
              </div>
              <p className={`text-sm ${role === 'tester' ? 'opacity-90' : 'opacity-60'}`}>
                I want to hunt bugs, improve my skills, and build a reputation.
              </p>
            </motion.button>
          </div>
        </div>

        {/* Right Side: Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] shadow-[12px_12px_0px_0px_rgba(139,92,246,1)]"
        >
          <form onSubmit={onSubmit} className="space-y-5">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Create your account</h2>

            {role === 'startup' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block mb-1 text-sm font-semibold">Company Name *</label>
                <input
                  required
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corp"
                  autoComplete="organization"
                  className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent focus:outline-none focus:ring-2 ring-[var(--primary)] ring-offset-2 dark:ring-offset-[#262626]"
                />
              </motion.div>
            )}

            <div>
              <label className="block mb-1 text-sm font-semibold">Email Address *</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent focus:outline-none focus:ring-2 ring-[var(--primary)] ring-offset-2 dark:ring-offset-[#262626]"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-semibold">Password *</label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent focus:outline-none focus:ring-2 ring-[var(--primary)] ring-offset-2 dark:ring-offset-[#262626]"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold">Confirm Password *</label>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent focus:outline-none focus:ring-2 ring-[var(--primary)] ring-offset-2 dark:ring-offset-[#262626]"
                />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-500 font-semibold text-sm">
                <Shield className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading || !role}
              whileHover={{ scale: 1.02, rotate: -1 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-full border-2 border-black dark:border-white font-bold text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 transition-all ${
                loading || !role ? 'opacity-50 grayscale cursor-not-allowed' : ''
              }`}
              style={{ background: 'var(--primary)' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            
            <p className="text-center text-sm opacity-60 mt-4">
              Already have an account? <a href="/login" className="font-bold underline decoration-2 underline-offset-4 hover:text-[var(--primary)]">Login here</a>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
