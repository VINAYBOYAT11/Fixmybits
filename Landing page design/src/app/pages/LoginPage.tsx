import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { loginUser } from "../lib/api";
import { setTokens } from "../lib/auth";
import { ArrowRight } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; message: string }>({
    type: "",
    message: "",
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!email.includes("@")) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }
    if (!password) {
      setStatus({ type: "error", message: "Password is required." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      const response = await loginUser({ email: email.trim().toLowerCase(), password });
      setTokens(response.access, response.refresh, response.user);
      setStatus({ type: "success", message: `Welcome back, ${response.user.email}! Redirecting...` });
      window.setTimeout(() => {
        const role = response.user.role;
        window.location.href = role === "startup" ? "/startup/dashboard" : role === "tester" ? "/tester/dashboard" : "/admin/dashboard";
      }, 700);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Login failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-6 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        <motion.a
          href="/"
          className="inline-flex mb-6 text-sm underline underline-offset-4 hover:text-[var(--primary)]"
          whileHover={{ x: -3 }}
        >
          ← Back to landing page
        </motion.a>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#262626]"
          style={{ boxShadow: "10px 10px 0 0 rgba(139, 92, 246, 1)" }}
        >
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Login
          </h1>
          <p className="opacity-70 mb-6">For startups and testers.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="block text-sm mb-1">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>

            <label className="block">
              <span className="block text-sm mb-1">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent"
                placeholder="Your password"
                autoComplete="current-password"
              />
            </label>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-2 border-black" />
                <span className="opacity-60">Remember me</span>
              </label>
              <a href="/forgot-password" className="font-bold underline decoration-2 underline-offset-4 hover:text-[var(--primary)]">Forgot password?</a>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-black dark:border-white bg-[var(--primary)] text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Logging in..." : "Sign In"}
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <p className="text-center text-sm opacity-60 mt-4">
              Don't have an account? <a href="/register" className="font-bold underline decoration-2 underline-offset-4 hover:text-[var(--primary)]">Register here</a>
            </p>
          </form>

          {status.message && (
            <p
              aria-live="polite"
              className={`mt-4 text-sm ${status.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {status.message}
            </p>
          )}
        </motion.section>
      </div>
    </main>
  );
}
