import { motion } from 'motion/react';
import { FloatingShapes } from './FloatingShapes';
import { Sparkles, Zap } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
      <FloatingShapes />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#262626] border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] mb-8"
        >
          <Sparkles className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          <span className="text-sm">Connect. Test. Improve.</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1.1
          }}
        >
          Connect Testers with{' '}
          <span
            className="inline-block px-4 rounded-2xl border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
            style={{ background: 'var(--accent-yellow)', color: '#1a1a1a' }}
          >
            Startups
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl max-w-2xl mx-auto mb-12 opacity-80"
        >
          Get real feedback from real users. Build better products through report-based collaboration and instant chat.
        </motion.p>
        <p className="text-base sm:text-lg font-semibold mb-10" style={{ color: 'var(--primary)' }}>
          By the people, for the people.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a
            href="#signup"
            className="px-8 py-4 rounded-full border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(139,92,246,1)] flex items-center gap-2"
            style={{ background: 'var(--primary)', color: 'white', fontSize: '1.125rem', fontWeight: 600 }}
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="w-5 h-5" />
            Join as Tester
          </motion.a>

          <motion.a
            href="#signup"
            className="px-8 py-4 rounded-full border-2 border-black dark:border-white bg-white dark:bg-[#262626] shadow-[6px_6px_0px_0px_rgba(236,72,153,1)] flex items-center gap-2"
            style={{ fontSize: '1.125rem', fontWeight: 600 }}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-pink)' }} />
            Join as Startup
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-20 text-sm opacity-60"
        >
          Scroll to explore
        </motion.div>
      </div>
    </section>
  );
}
