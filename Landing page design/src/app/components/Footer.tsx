import { motion } from 'motion/react';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { sendContactRequest, type ContactPayload } from '../lib/api';

const footerLinks = {
  Product: ['Features', 'Pricing', 'How it Works', 'FAQ'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Resources: ['Documentation', 'Help Center', 'Community', 'Contact'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Mail, href: '#', label: 'Email' },
];

export function Footer() {
  const [contact, setContact] = useState<ContactPayload>({
    name: '',
    email: '',
    category: 'general',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });

  const validateContact = () => {
    if (contact.name.trim().length < 2) return 'Please enter your name.';
    if (!contact.email.includes('@')) return 'Please enter a valid email.';
    if (contact.message.trim().length < 10) return 'Message should be at least 10 characters.';
    return '';
  };

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const validationError = validateContact();
    if (validationError) {
      setStatus({ type: 'error', message: validationError });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      const response = await sendContactRequest({
        ...contact,
        name: contact.name.trim(),
        email: contact.email.trim().toLowerCase(),
        message: contact.message.trim(),
      });
      setStatus({ type: 'success', message: response.message });
      setContact({ name: '', email: '', category: 'general', message: '' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not send your message.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer id="contact" tabIndex={-1} className="border-t-2 border-black dark:border-white bg-white dark:bg-[#262626] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          <div className="md:col-span-1">
            <motion.div
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
              whileHover={{ scale: 1.05 }}
            >
              FixMyBits
            </motion.div>
            <p className="text-sm opacity-60 mb-6">
              Connecting testers and startups to build better products.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full border-2 border-black dark:border-white flex items-center justify-center hover:bg-[var(--primary)] hover:border-[var(--primary)] transition-colors"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm opacity-60 hover:opacity-100 hover:text-[var(--primary)] transition-all"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-2xl border-2 border-black dark:border-white mb-12">
          <h3 className="font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Contact us
          </h3>
          <form onSubmit={submitContact} className="grid md:grid-cols-2 gap-4">
            <input
              required
              type="text"
              placeholder="Your name"
              value={contact.name}
              onChange={(e) => setContact((prev) => ({ ...prev, name: e.target.value }))}
              className="px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent"
            />
            <input
              required
              type="email"
              placeholder="Email address"
              value={contact.email}
              onChange={(e) => setContact((prev) => ({ ...prev, email: e.target.value }))}
              className="px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent"
            />
            <select
              value={contact.category}
              onChange={(e) => setContact((prev) => ({ ...prev, category: e.target.value as ContactPayload['category'] }))}
              className="px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent"
            >
              <option value="general">General</option>
              <option value="startup">Startup</option>
              <option value="tester">Tester</option>
              <option value="partnership">Partnership</option>
            </select>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl border-2 border-black dark:border-white bg-[var(--primary)] text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send message'}
            </button>
            <textarea
              required
              rows={4}
              placeholder="Tell us what you need"
              value={contact.message}
              onChange={(e) => setContact((prev) => ({ ...prev, message: e.target.value }))}
              className="md:col-span-2 px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent"
            />
          </form>
          {status.message && (
            <p className={`mt-3 text-sm ${status.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {status.message}
            </p>
          )}
        </div>

        <div className="pt-8 border-t-2 border-black dark:border-white text-center text-sm opacity-60">
          <p>&copy; {new Date().getFullYear()} FixMyBits. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
