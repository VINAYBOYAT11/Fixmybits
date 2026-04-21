import React from 'react';
import { motion } from 'motion/react';
import { ThemeToggle } from './ThemeToggle';
import logo from '../../assets/logo.png';
import { Menu, X, Shield, ArrowRight } from 'lucide-react';

import { useEffect, useState } from 'react';
import { getUser, type AuthUser } from '../lib/auth';

export function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b-2 border-black dark:border-white">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        <motion.a
          href="/"
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer"
        >
          <img src={logo} alt="FixMyBits" className="h-32 w-auto dark:invert" />
        </motion.a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="hover:text-[var(--primary)] transition-colors rounded-md px-1">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-[var(--primary)] transition-colors rounded-md px-1">
            How it Works
          </a>
          <a href="/contact" className="hover:text-[var(--primary)] transition-colors rounded-md px-1">
            Contact
          </a>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {user ? (
            <motion.a
              href={user.role === 'startup' ? '/startup/dashboard' : user.role === 'tester' ? '/tester/dashboard' : '/'}
              className="px-6 py-2 rounded-full border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(139,92,246,1)] flex items-center gap-2"
              style={{ background: 'var(--primary)', color: 'white' }}
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              Dashboard <ArrowRight className="w-4 h-4" />
            </motion.a>
          ) : (
            <>
              <motion.a
                href="/login"
                className="hidden md:block px-6 py-2 rounded-full border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.a>

              <motion.a
                href="/register"
                className="px-6 py-2 rounded-full border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(139,92,246,1)]"
                style={{ background: 'var(--primary)', color: 'white' }}
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up
              </motion.a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
