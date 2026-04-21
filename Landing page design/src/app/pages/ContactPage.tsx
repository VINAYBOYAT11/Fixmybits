import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { sendContactRequest, type ContactPayload } from "../lib/api";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { AnimatedBackground } from "../components/AnimatedBackground";

export function ContactPage() {
  const [formData, setFormData] = useState<ContactPayload>({ name: "", email: "", message: "", category: "general" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; message: string }>({ type: "", message: "" });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.email.includes("@")) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }
    if (!formData.message.trim()) {
      setStatus({ type: "error", message: "Message cannot be empty." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      await sendContactRequest({
        ...formData,
        email: formData.email.trim().toLowerCase(),
      });
      setStatus({ type: "success", message: "Message sent! We'll get back to you shortly." });
      setFormData({ name: "", email: "", message: "", category: "general" });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Failed to send message." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-6 py-10 flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      <div className="w-full max-w-2xl relative z-10 my-8">
        <motion.a
          href="/"
          className="inline-flex gap-2 items-center mb-6 text-sm underline underline-offset-4 hover:text-[var(--primary)] font-bold bg-white dark:bg-[#262626] px-4 py-2 rounded-full border-2 border-black dark:border-white w-max"
          whileHover={{ x: -3 }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </motion.a>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 md:p-12 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]"
          style={{ boxShadow: "12px 12px 0 0 rgba(79, 140, 255, 1)" }}
        >
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Contact Us
          </h1>
          <p className="opacity-70 mb-8 text-lg">Have a question or want to partner with us? Reach out below.</p>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <label className="block">
                <span className="block text-sm mb-2 font-semibold">Your Name</span>
                <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent outline-none focus:ring-2 ring-[var(--primary)]"
                    placeholder="John Doe"
                />
                </label>

                <label className="block">
                <span className="block text-sm mb-2 font-semibold">Email Address</span>
                <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent outline-none focus:ring-2 ring-[var(--primary)]"
                    placeholder="you@example.com"
                />
                </label>
            </div>

            <label className="block">
              <span className="block text-sm mb-2 font-semibold">Category</span>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as ContactPayload["category"]})}
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent outline-none focus:ring-2 ring-[var(--primary)] text-current"
              >
                <option value="general" className="text-black">General Inquiry</option>
                <option value="startup" className="text-black">Startup Support</option>
                <option value="tester" className="text-black">Tester Support</option>
                <option value="partnership" className="text-black">Partnership Opportunity</option>
              </select>
            </label>

            <label className="block">
              <span className="block text-sm mb-2 font-semibold">Message</span>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent outline-none focus:ring-2 ring-[var(--primary)] resize-y"
                placeholder="How can we help you?"
              />
            </label>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full border-2 border-black dark:border-white bg-[var(--primary)] text-white font-bold text-lg disabled:opacity-60 disabled:cursor-not-allowed shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>

          {status.message && (
            <p className={`mt-6 text-sm font-bold text-center p-4 rounded-lg border-2 border-black dark:border-white ${status.type === "success" ? "bg-[var(--accent-mint)] text-black" : "bg-red-500 text-white"}`}>
              {status.message}
            </p>
          )}
        </motion.section>
      </div>
    </main>
  );
}
