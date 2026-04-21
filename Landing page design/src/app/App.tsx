import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { ImpactStats } from './components/ImpactStats';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { ScrollSound } from './components/ScrollSound';
import { AnimatedBackground } from './components/AnimatedBackground';

export default function App() {
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const handleAnchorNavigation = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const section = document.querySelector(href) as HTMLElement | null;
      if (!section) return;

      event.preventDefault();
      setIsNavigating(true);
      window.setTimeout(() => setIsNavigating(false), 420);
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => section.focus({ preventScroll: true }), 450);
    };

    document.addEventListener('click', handleAnchorNavigation);
    return () => document.removeEventListener('click', handleAnchorNavigation);
  }, []);

  return (
    <div className="min-h-screen relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only fixed left-4 top-4 z-[100] rounded-full border-2 border-black dark:border-white bg-white dark:bg-[#262626] px-4 py-2"
      >
        Skip to content
      </a>
      <AnimatedBackground />
      <ScrollSound />
      <div className={`relative z-10 nav-shell ${isNavigating ? 'is-navigating' : ''}`}>
        <Navbar />
        <main id="main-content">
          <Hero />
          <TrustBar />
          <Features />
          <HowItWorks />
          <ImpactStats />
          <CTA />
          <Footer />
        </main>
      </div>
    </div>
  );
}