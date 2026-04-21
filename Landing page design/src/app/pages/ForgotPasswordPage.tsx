import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { requestPasswordReset } from "../lib/api";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { AnimatedBackground } from "../components/AnimatedBackground";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; message: string }>({ type: "", message: "" });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.includes("@")) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setStatus({ type: "success", message: "If an account exists, a password reset link has been sent to your email." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Failed to request password reset." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-6 py-10 flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      <div className="w-full max-w-md relative z-10">
        <motion.a
          href="/login"
          className="inline-flex gap-2 items-center mb-6 text-sm underline underline-offset-4 hover:text-[var(--primary)] font-bold bg-white dark:bg-[#262626] px-4 py-2 rounded-full border-2 border-black dark:border-white w-max"
          whileHover={{ x: -3 }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to login
        </motion.a>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]"
          style={{ boxShadow: "10px 10px 0 0 rgba(79, 140, 255, 1)" }}
        >
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Forgot Password
          </h1>
          <p className="opacity-70 mb-6 text-sm">Enter your email address and we'll send you a link to reset your password.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="block text-sm mb-1 font-semibold">Email Account</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent outline-none focus:ring-2 ring-[var(--primary)]"
                placeholder="you@example.com"
              />
            </label>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full border-2 border-black dark:border-white bg-[var(--primary)] text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>

          {status.message && (
            <p className={`mt-6 text-sm font-bold text-center ${status.type === "success" ? "text-[var(--accent-mint)]" : "text-red-500"}`}>
              {status.message}
            </p>
          )}
        </motion.section>
      </div>
    </main>
  );
}
