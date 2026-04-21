import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  FolderOpen, 
  FileText, 
  User, 
  LogOut, 
  Menu, 
  X,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isStartup, isTester, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/reports', icon: FileText, label: 'Reports' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <Shield className="navbar-brand-icon" />
          <span className="navbar-brand-text">FixMyBits</span>
        </Link>

        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="navbar-link">
              <link.icon size={18} />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          <div className="navbar-user">
            <div className="navbar-user-avatar">
              <User size={18} />
            </div>
            <div className="navbar-user-info">
              <span className="navbar-user-email">{user?.email}</span>
              <span className="navbar-user-role">
                {isStartup && 'Startup'}
                {isTester && 'Tester'}
                {isAdmin && 'Admin'}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut size={18} />}
          >
            Logout
          </Button>
        </div>

        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <motion.div
          className="navbar-mobile-menu"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="navbar-mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </Link>
          ))}
          <button className="navbar-mobile-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
