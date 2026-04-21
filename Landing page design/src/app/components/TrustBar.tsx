import { ShieldCheck, Lock, FileCheck2 } from 'lucide-react';

const marqueeTopics = [
  'OWASP Top 10',
  'Zero Trust',
  'Threat Modeling',
  'Vulnerability Triage',
  'Penetration Testing',
  'Cloud Security',
  'Secure SDLC',
  'Incident Response',
  'ISO 27001',
  'SOC 2',
];

const orgRequirements = [
  'SSO / SAML',
  'RBAC',
  'Audit Logs',
  'SLA-backed support',
  'GDPR-ready',
];

export function TrustBar() {
  return (
    <section className="border-y-2 border-black dark:border-white bg-white dark:bg-[#262626] overflow-hidden">
      <div className="py-8 px-6 border-b-2 border-black dark:border-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full border-2 border-black dark:border-white" style={{ background: 'var(--accent-mint)' }}>
              <ShieldCheck className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                Enterprise-ready
              </div>
              <div className="text-sm opacity-70">Security-first workflow for startups and testers</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full border-2 border-black dark:border-white" style={{ background: 'var(--accent-yellow)' }}>
              <Lock className="w-6 h-6 text-black" />
            </div>
            <div className="text-xl font-medium">Built for modern cybersecurity teams</div>
          </div>
        </div>
      </div>

      <div className="py-4 px-6 border-b-2 border-black dark:border-white">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 items-center justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-black dark:border-white text-sm font-semibold">
            <FileCheck2 className="w-4 h-4" />
            Organization essentials
          </span>
          {orgRequirements.map((item) => (
            <span
              key={item}
              className="px-3 py-1 rounded-full border-2 border-black dark:border-white text-sm bg-[var(--accent-pink)] text-white"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="relative py-6">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeTopics, ...marqueeTopics, ...marqueeTopics].map((topic, index) => (
            <div
              key={index}
              className="mx-8 text-xl font-bold opacity-70"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {topic}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
