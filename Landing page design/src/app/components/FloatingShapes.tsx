import { motion } from 'motion/react';

// Only gentle float animations — no continuous rotation in JS
export function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Pink circle */}
      <motion.div
        className="absolute top-20 left-[10%] w-20 h-20 rounded-full"
        style={{ background: 'var(--accent-pink)', willChange: 'transform' }}
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Yellow square */}
      <motion.div
        className="absolute top-40 right-[15%] w-16 h-16 rotate-45"
        style={{ background: 'var(--accent-yellow)', willChange: 'transform' }}
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Mint circle */}
      <motion.div
        className="absolute bottom-40 left-[20%] w-12 h-12 rounded-full"
        style={{ background: 'var(--accent-mint)', willChange: 'transform' }}
        animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Triangle — CSS spin instead of JS */}
      <div
        className="absolute top-[60%] right-[25%] w-8 h-8"
        style={{
          background: 'var(--primary)',
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          animation: 'spin 20s linear infinite',
          willChange: 'transform',
        }}
      />

      {/* Small pink dot — CSS pulse */}
      <div
        className="absolute bottom-[20%] right-[10%] w-6 h-6 rounded-full"
        style={{
          background: 'var(--accent-pink)',
          animation: 'pulse 4s ease-in-out infinite',
          willChange: 'transform',
        }}
      />

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }
      `}</style>
    </div>
  );
}
