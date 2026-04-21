import { motion } from 'motion/react';

export function AnimatedBackground() {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full opacity-60"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: 'currentColor',
          }}
          animate={{
            y: [0, -100],
            opacity: [0, 0.6, 1, 0.6, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: star.duration * 3,
            repeat: Infinity,
            delay: star.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* Floating Clouds */}
      <motion.div
        className="absolute top-10 left-0 rounded-full opacity-60"
        style={{
          width: '200px',
          height: '80px',
          background: 'rgba(200, 200, 200, 0.3)',
          filter: 'blur(15px)',
        }}
        animate={{
          x: ['-200px', '100vw'],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div
        className="absolute top-1/4 right-0 rounded-full opacity-50"
        style={{
          width: '250px',
          height: '100px',
          background: 'rgba(200, 200, 200, 0.3)',
          filter: 'blur(18px)',
        }}
        animate={{
          x: ['100vw', '-250px'],
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div
        className="absolute bottom-1/3 left-0 rounded-full opacity-55"
        style={{
          width: '220px',
          height: '90px',
          background: 'rgba(200, 200, 200, 0.3)',
          filter: 'blur(16px)',
        }}
        animate={{
          x: ['-220px', '100vw'],
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: 'linear',
          delay: 5,
        }}
      />

      <motion.div
        className="absolute bottom-20 right-0 rounded-full opacity-50"
        style={{
          width: '280px',
          height: '110px',
          background: 'rgba(200, 200, 200, 0.3)',
          filter: 'blur(20px)',
        }}
        animate={{
          x: ['100vw', '-280px'],
        }}
        transition={{
          duration: 55,
          repeat: Infinity,
          ease: 'linear',
          delay: 10,
        }}
      />

      {/* Additional clouds for more coverage */}
      <motion.div
        className="absolute top-1/2 left-0 rounded-full opacity-45"
        style={{
          width: '180px',
          height: '70px',
          background: 'rgba(200, 200, 200, 0.3)',
          filter: 'blur(14px)',
        }}
        animate={{
          x: ['-180px', '100vw'],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: 'linear',
          delay: 15,
        }}
      />

      {/* Planet with Ring */}
      <motion.div
        className="absolute"
        style={{
          top: '15%',
          right: '10%',
        }}
        animate={{
          y: [0, 20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="relative">
          {/* Planet */}
          <div
            className="w-20 h-20 rounded-full opacity-30 border-2 border-current"
            style={{ background: 'var(--accent-mint)' }}
          />
          {/* Ring */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-12 rounded-full opacity-20 border-2 border-current"
            style={{
              background: 'transparent',
              transform: 'translateX(-50%) translateY(-50%) rotateX(75deg)',
            }}
          />
        </div>
      </motion.div>

      {/* Small Planet */}
      <motion.div
        className="absolute w-12 h-12 rounded-full opacity-25 border-2 border-current"
        style={{
          bottom: '25%',
          left: '15%',
          background: 'var(--accent-yellow)',
        }}
        animate={{
          y: [0, -15, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Decorative Dots - Moving Upward */}
      <motion.div
        className="absolute w-3 h-3 rounded-full opacity-40"
        style={{
          bottom: '0%',
          left: '20%',
          background: 'var(--accent-pink)',
        }}
        animate={{
          y: [0, -1000],
          scale: [1, 1.5, 1],
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div
        className="absolute w-4 h-4 rounded-full opacity-40"
        style={{
          bottom: '0%',
          right: '25%',
          background: 'var(--primary)',
        }}
        animate={{
          y: [0, -1000],
          scale: [1, 1.3, 1],
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          delay: 2,
          ease: 'linear',
        }}
      />

      <motion.div
        className="absolute w-2 h-2 rounded-full opacity-50"
        style={{
          bottom: '0%',
          left: '40%',
          background: 'var(--accent-mint)',
        }}
        animate={{
          y: [0, -1000],
          scale: [1, 1.8, 1],
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          delay: 4,
          ease: 'linear',
        }}
      />

      <motion.div
        className="absolute w-3 h-3 rounded-full opacity-45"
        style={{
          bottom: '0%',
          left: '60%',
          background: 'var(--accent-yellow)',
        }}
        animate={{
          y: [0, -1000],
          scale: [1, 1.4, 1],
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          delay: 1,
          ease: 'linear',
        }}
      />

      <motion.div
        className="absolute w-2 h-2 rounded-full opacity-50"
        style={{
          bottom: '0%',
          right: '15%',
          background: 'var(--accent-pink)',
        }}
        animate={{
          y: [0, -1000],
          scale: [1, 1.6, 1],
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          delay: 3,
          ease: 'linear',
        }}
      />
    </div>
  );
}
