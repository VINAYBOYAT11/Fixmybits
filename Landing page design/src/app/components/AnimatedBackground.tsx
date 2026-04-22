import { useMemo } from 'react';
import { motion } from 'motion/react';

// Stars use pure CSS keyframes — zero JS animation overhead
const STAR_CSS = `
@keyframes star-rise {
  0%   { transform: translateY(0);    opacity: 0; }
  10%  { opacity: 0.6; }
  90%  { opacity: 0.4; }
  100% { transform: translateY(-100vh); opacity: 0; }
}
@keyframes cloud-left {
  from { transform: translateX(-300px); }
  to   { transform: translateX(110vw);  }
}
@keyframes cloud-right {
  from { transform: translateX(110vw);  }
  to   { transform: translateX(-300px); }
}
@keyframes dot-rise {
  0%   { transform: translateY(0) scale(1);   opacity: 0; }
  15%  { opacity: 0.6; }
  85%  { opacity: 0.4; }
  100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
}
`;

// Fixed seed so values never change between renders
const STARS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: ((i * 37 + 11) % 97),          // deterministic pseudo-random
  y: ((i * 53 + 7)  % 95),
  size: (i % 3) + 1,
  delay: (i * 0.4) % 5,
  duration: ((i % 4) + 4) * 3,
}));

const DOTS = [
  { left: '20%', color: 'var(--accent-pink)',   delay: 0,  duration: 8  },
  { left: '40%', color: 'var(--accent-mint)',   delay: 4,  duration: 7  },
  { left: '60%', color: 'var(--accent-yellow)', delay: 1,  duration: 9  },
  { left: '75%', color: 'var(--primary)',        delay: 2,  duration: 10 },
  { left: '88%', color: 'var(--accent-pink)',   delay: 3,  duration: 11 },
];

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Inject CSS once */}
      <style>{STAR_CSS}</style>

      {/* Stars — pure CSS, no JS per frame */}
      {STARS.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full opacity-60"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: 'currentColor',
            animation: `star-rise ${star.duration}s linear ${star.delay}s infinite`,
            willChange: 'transform, opacity',
          }}
        />
      ))}

      {/* Clouds — pure CSS translate (compositor-only) */}
      {[
        { top: '8%',  w: 200, h: 80,  dir: 'left',  dur: 40, delay: 0  },
        { top: '25%', w: 250, h: 100, dir: 'right', dur: 50, delay: 0  },
        { top: '55%', w: 180, h: 70,  dir: 'left',  dur: 35, delay: 15 },
        { top: '67%', w: 220, h: 90,  dir: 'left',  dur: 45, delay: 5  },
        { top: '82%', w: 280, h: 110, dir: 'right', dur: 55, delay: 10 },
      ].map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: c.top,
            [c.dir === 'left' ? 'left' : 'right']: 0,
            width: `${c.w}px`,
            height: `${c.h}px`,
            background: 'rgba(200,200,200,0.3)',
            filter: 'blur(15px)',
            opacity: 0.5,
            animation: `cloud-${c.dir} ${c.dur}s linear ${c.delay}s infinite`,
            willChange: 'transform',
          }}
        />
      ))}

      {/* Planet — only 1 motion element, gentle float */}
      <motion.div
        className="absolute"
        style={{ top: '15%', right: '10%' }}
        animate={{ y: [0, 20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full opacity-30 border-2 border-current"
            style={{ background: 'var(--accent-mint)' }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-32 h-12 rounded-full opacity-20 border-2 border-current"
            style={{
              background: 'transparent',
              transform: 'translateX(-50%) translateY(-50%) rotateX(75deg)',
            }}
          />
        </div>
      </motion.div>

      {/* Small planet — only 1 motion element */}
      <motion.div
        className="absolute w-12 h-12 rounded-full opacity-25 border-2 border-current"
        style={{ bottom: '25%', left: '15%', background: 'var(--accent-yellow)' }}
        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Rising dots — pure CSS */}
      {DOTS.map((d, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            bottom: '0%',
            left: d.left,
            background: d.color,
            animation: `dot-rise ${d.duration}s linear ${d.delay}s infinite`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
}
