// ─── Sidebar ─────────────────────────────────────────────────────────────────
import { motion } from 'motion/react';
import { logout, type AuthUser } from '../../lib/auth';
import logo from '../../../assets/logo.png';
import {
  LayoutDashboard, FolderOpen, FilePlus, FileText, User,
  Search, Briefcase, LogOut, Shield, X,
} from 'lucide-react';

type NavItem = { label: string; href: string; icon: React.ElementType };

const STARTUP_NAV: NavItem[] = [
  { label: 'Dashboard',    href: '/startup/dashboard', icon: LayoutDashboard },
  { label: 'Projects',     href: '/startup/projects',  icon: FolderOpen },
  { label: 'New Project',  href: '/startup/projects/new', icon: FilePlus },
  { label: 'Reports',      href: '/startup/reports',   icon: FileText },
  { label: 'Profile',      href: '/startup/profile',   icon: User },
];

const TESTER_NAV: NavItem[] = [
  { label: 'Dashboard',       href: '/tester/dashboard',      icon: LayoutDashboard },
  { label: 'Browse Projects',  href: '/tester/projects/open',  icon: Search },
  { label: 'My Projects',      href: '/tester/projects/mine',  icon: Briefcase },
  { label: 'My Reports',       href: '/tester/reports',        icon: FileText },
  { label: 'Profile',          href: '/tester/profile',        icon: User },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard',    href: '/admin/dashboard',    icon: LayoutDashboard },
  { label: 'Pending Users',href: '/admin/users',        icon: User },
  { label: 'Projects',     href: '/admin/projects',     icon: FolderOpen },
  { label: 'Applications', href: '/admin/applications', icon: Briefcase },
  { label: 'Reports',      href: '/admin/reports',      icon: FileText },
];

type Props = { user: AuthUser; onClose?: () => void };

export function Sidebar({ user, onClose }: Props) {
  const nav = user.role === 'admin' ? ADMIN_NAV : user.role === 'startup' ? STARTUP_NAV : TESTER_NAV;
  const current = window.location.pathname;

  const handleLogout = async () => {
    logout();
  };

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-[#262626] border-r-2 border-black dark:border-white w-64 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-black dark:border-white">
        <motion.a href="/" whileHover={{ scale: 1.03 }}>
          <img src={logo} alt="FixMyBits" className="h-14 w-auto dark:invert" />
        </motion.a>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role badge */}
      <div className="px-4 py-3 border-b-2 border-black dark:border-white">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          <div>
            <p className="text-xs opacity-60 capitalize">{user.role}</p>
            <p className="text-sm font-semibold truncate max-w-[170px]">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.href || current.startsWith(item.href + '/');
          return (
            <motion.a
              key={item.href}
              href={item.href}
              whileHover={{ x: 4 }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-sm font-medium ${
                isActive
                  ? 'border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(139,92,246,1)]'
                  : 'border-transparent hover:border-black dark:hover:border-white'
              }`}
              style={isActive ? { background: 'var(--primary)', color: 'white' } : {}}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </motion.a>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t-2 border-black dark:border-white">
        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 4, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-transparent hover:border-red-500 text-sm font-medium transition-all text-red-600 dark:text-red-400"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </motion.button>
      </div>
    </aside>
  );
}
