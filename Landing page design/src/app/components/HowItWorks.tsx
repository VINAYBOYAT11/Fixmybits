import { motion } from 'motion/react';
import { UserPlus, Search, CheckCircle, MessageCircle } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Sign Up',
    description: 'Create your account in seconds. Choose your role: Tester or Startup.',
    number: '01',
  },
  {
    icon: Search,
    title: 'Browse Projects',
    description: 'Explore available testing opportunities or post your product.',
    number: '02',
  },
  {
    icon: CheckCircle,
    title: 'Apply & Get Accepted',
    description: 'Testers apply to projects. Startups review and accept the best fit.',
    number: '03',
  },
  {
    icon: MessageCircle,
    title: 'Submit Reports & Chat',
    description: 'Share detailed feedback through reports and collaborate via chat.',
    number: '04',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" tabIndex={-1} className="py-32 px-6 bg-white dark:bg-[#262626]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            How it works
          </h2>
          <p className="text-xl opacity-60 max-w-2xl mx-auto">
            Get started in four simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const colors = [
              'var(--accent-pink)',
              'var(--primary)',
              'var(--accent-yellow)',
              'var(--accent-mint)',
            ];

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="absolute -top-4 -left-4 text-8xl font-bold opacity-10" style={{ fontFamily: 'var(--font-heading)' }}>
                  {step.number}
                </div>

                <div className="relative p-6 rounded-2xl border-2 border-black dark:border-white bg-background">
                  <div
                    className="w-14 h-14 rounded-full border-2 border-black dark:border-white flex items-center justify-center mb-4"
                    style={{ background: colors[index] }}
                  >
                    <Icon className="w-7 h-7 text-black dark:text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    {step.title}
                  </h3>
                  <p className="opacity-70 text-sm leading-relaxed">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-black dark:bg-white opacity-20" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
