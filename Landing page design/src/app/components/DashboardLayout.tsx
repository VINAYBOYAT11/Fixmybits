// ─── DashboardLayout ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu } from 'lucide-react';
import { requireAuth, type AuthUser } from '../lib/auth';
import { Sidebar } from './shared/Sidebar';

type Props = { children: React.ReactNode; role: 'startup' | 'tester' | 'admin'; title?: string };

export function DashboardLayout({ children, role, title }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const u = requireAuth(role);
    if (u) setUser(u);
    // requireAuth handles redirect if not authenticated
  }, [role]);

  // Show spinner only briefly while checking auth from localStorage
  // (synchronous check, so this resolves on first render in practice)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar user={user} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
            >
              <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b-2 border-black dark:border-white px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg border-2 border-black dark:border-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          {title && (
            <h1 className="text-xl font-bold truncate" style={{ fontFamily: 'var(--font-heading)' }}>
              {title}
            </h1>
          )}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm opacity-60 hidden sm:block">{user.email}</span>
            <div
              className="w-8 h-8 rounded-full border-2 border-black dark:border-white flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'var(--primary)' }}
            >
              {user.email[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 p-6"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
