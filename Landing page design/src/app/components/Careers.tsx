import { motion } from 'motion/react';
import { Briefcase, Heart, Code, Megaphone, Palette } from 'lucide-react';

const positions = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    icon: Code,
    color: 'var(--primary)',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    icon: Palette,
    color: 'var(--accent-pink)',
  },
  {
    title: 'Growth Marketing Manager',
    department: 'Marketing',
    location: 'Hybrid',
    type: 'Full-time',
    icon: Megaphone,
    color: 'var(--accent-yellow)',
  },
  {
    title: 'Community Manager',
    department: 'Operations',
    location: 'Remote',
    type: 'Part-time',
    icon: Heart,
    color: 'var(--accent-mint)',
  },
];

export function Careers() {
  return (
    <section id="careers" tabIndex={-1} className="py-32 px-6 bg-white dark:bg-[#262626]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <div className="inline-block px-6 py-3 rounded-full border-2 border-black dark:border-white mb-8" style={{ background: 'var(--accent-mint)' }}>
            <span className="text-sm font-bold text-black">BY THE PEOPLE, FOR THE PEOPLE</span>
          </div>
          <h2 className="text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Join Our Mission
          </h2>
          <p className="text-xl opacity-60 max-w-2xl mx-auto mb-4">
            Help us build the future of product testing and feedback
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mt-16">
          {positions.map((position, index) => {
            const Icon = position.icon;
            return (
              <motion.div
                key={position.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, rotate: index % 2 === 0 ? -1 : 1 }}
                className="p-6 rounded-2xl border-2 border-black dark:border-white bg-background shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full border-2 border-black dark:border-white flex items-center justify-center flex-shrink-0"
                      style={{ background: position.color }}
                    >
                      <Icon className="w-6 h-6 text-black dark:text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                        {position.title}
                      </h3>
                      <p className="text-sm opacity-60">{position.department}</p>
                    </div>
                  </div>
                  <Briefcase className="w-5 h-5 opacity-40" />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full border border-black dark:border-white text-xs">
                    {position.location}
                  </span>
                  <span className="px-3 py-1 rounded-full border border-black dark:border-white text-xs">
                    {position.type}
                  </span>
                </div>

                <motion.button
                  className="mt-4 w-full py-2 rounded-full border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Apply Now
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-lg opacity-70 mb-6">
            Don't see the right role? We're always looking for talented people.
          </p>
          <motion.button
            className="px-8 py-4 rounded-full border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(139,92,246,1)]"
            style={{ background: 'var(--primary)', color: 'white', fontSize: '1rem', fontWeight: 600 }}
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Send Us Your Resume
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
