import { motion } from 'motion/react';
import { Shield, Zap, TrendingUp, Users } from 'lucide-react';

const stats = [
  {
    label: 'Cybersecurity Pros',
    value: '2.5k+',
    description: 'Expert testers ready to secure your software.',
    icon: Users,
    color: 'var(--primary)',
  },
  {
    label: 'Critical Vulnerabilities',
    value: '500+',
    description: 'Bugs found and fixed before exploitation.',
    icon: Shield,
    color: 'var(--accent-mint)',
  },
  {
    label: 'Fast Turnaround',
    value: '< 24h',
    description: 'Initial triage for most report submissions.',
    icon: Zap,
    color: 'var(--accent-pink)',
  },
  {
    label: 'Startup Growth',
    value: '$0 Cost',
    description: 'Non-profit marketplace for early stage startups.',
    icon: TrendingUp,
    color: 'var(--accent-yellow)',
  },
];

export function ImpactStats() {
  return (
    <section id="impact" className="py-24 px-6 bg-white dark:bg-[#262626]">
      <div className="max-w-7xl mx-auto">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1.5 rounded-full border-2 border-black dark:border-white mb-6" style={{ background: 'var(--accent-mint)' }}>
            <span className="text-xs font-bold text-black uppercase tracking-wider">Our Impact</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Securing the Next Generation
          </h2>
          <p className="text-lg opacity-60 max-w-2xl mx-auto">
            FixMyBits connects elite cybersecurity talent with non-profits and startups to build a safer digital world.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, rotate: index % 2 === 0 ? -1 : 1 }}
                className="p-8 rounded-3xl border-2 border-black dark:border-white bg-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative overflow-hidden group"
              >
                <div 
                  className="w-14 h-14 rounded-2xl border-2 border-black dark:border-white flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform"
                  style={{ background: stat.color }}
                >
                  <Icon className="w-8 h-8 text-black dark:text-white" />
                </div>
                
                <h3 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  {stat.value}
                </h3>
                <p className="font-bold text-lg mb-2">{stat.label}</p>
                <p className="text-sm opacity-60 line-height-relaxed">
                  {stat.description}
                </p>

                {/* Decorative element */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icon className="w-12 h-12" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
