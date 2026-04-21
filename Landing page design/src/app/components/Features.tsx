import { motion } from 'motion/react';
import { TestTube, Rocket, MessageSquare } from 'lucide-react';

const features = [
  {
    icon: TestTube,
    title: 'For Testers',
    description: 'Discover exciting products to test, earn rewards, and shape the future of innovation.',
    color: 'var(--accent-pink)',
    shadowColor: 'rgba(236, 72, 153, 1)',
  },
  {
    icon: Rocket,
    title: 'For Startups',
    description: 'Get real user feedback fast. Connect with testers who understand your vision.',
    color: 'var(--primary)',
    shadowColor: 'rgba(139, 92, 246, 1)',
  },
  {
    icon: MessageSquare,
    title: 'Report-based Chat',
    description: 'Structured feedback meets real-time conversation. Context-rich collaboration made simple.',
    color: 'var(--accent-mint)',
    shadowColor: 'rgba(52, 211, 153, 1)',
  },
];

export function Features() {
  return (
    <section id="features" tabIndex={-1} className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Everything you need
          </h2>
          <p className="text-xl opacity-60 max-w-2xl mx-auto">
            Whether you're testing or building, we've got you covered
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, rotate: index % 2 === 0 ? -2 : 2 }}
                className="p-8 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]"
                style={{
                  boxShadow: `8px 8px 0px 0px ${feature.shadowColor}`,
                }}
              >
                <div
                  className="w-16 h-16 rounded-full border-2 border-black dark:border-white flex items-center justify-center mb-6"
                  style={{ background: feature.color }}
                >
                  <Icon className="w-8 h-8 text-black dark:text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  {feature.title}
                </h3>
                <p className="opacity-70 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
