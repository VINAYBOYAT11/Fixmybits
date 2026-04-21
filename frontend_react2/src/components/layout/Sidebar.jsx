import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  FolderOpen, 
  FileText, 
  User, 
  LogOut, 
  Shield,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout, isStartup, isTester, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/reports', icon: FileText, label: 'Reports' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="sidebar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'sidebar--mobile-open' : ''}`}
        initial={false}
        animate={{ width: collapsed ? '80px' : '280px' }}
        transition={{ duration: 0.3 }}
      >
        <div className="sidebar-content">
          {/* Header */}
          <div className="sidebar-header">
            <Link to="/dashboard" className="sidebar-brand">
              <div className="sidebar-brand-icon">
                <Shield size={collapsed ? 24 : 28} />
              </div>
              {!collapsed && <span className="sidebar-brand-text">FixMyBits</span>}
            </Link>
            
            {/* Desktop Collapse Toggle */}
            <button 
              className="sidebar-collapse-toggle"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            {/* Mobile Close Button */}
            <button 
              className="sidebar-mobile-close"
              onClick={() => setMobileOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          {/* User Profile */}
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              <User size={collapsed ? 20 : 24} />
            </div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-email">{user?.email}</span>
                <span className="sidebar-user-role">
                  {isStartup && 'Startup'}
                  {isTester && 'Tester'}
                  {isAdmin && 'Admin'}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`sidebar-nav-link ${isActive(link.to) ? 'sidebar-nav-link--active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <link.icon size={20} />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="sidebar-footer">
            <button
              className={`sidebar-logout ${collapsed ? 'sidebar-logout--collapsed' : ''}`}
              onClick={handleLogout}
            >
              <LogOut size={20} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
