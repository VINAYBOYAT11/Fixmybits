import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { confirmPasswordReset } from "../lib/api";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { useSearchParams } from "react-router";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; message: string }>({ type: "", message: "" });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }
    if (!token) {
      setStatus({ type: "error", message: "Invalid or missing reset token." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      await confirmPasswordReset({ token, password, confirm_password: confirmPassword });
      setStatus({ type: "success", message: "Password reset successfully. You can now login." });
      window.setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Failed to reset password." });
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
            Set New Password
          </h1>
          <p className="opacity-70 mb-6 text-sm">Enter your new password below.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="block text-sm mb-1 font-semibold">New Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent outline-none focus:ring-2 ring-[var(--primary)]"
                placeholder="••••••••"
              />
            </label>

            <label className="block">
              <span className="block text-sm mb-1 font-semibold">Confirm Password</span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-transparent outline-none focus:ring-2 ring-[var(--primary)]"
                placeholder="••••••••"
              />
            </label>

            <motion.button
              type="submit"
              disabled={isSubmitting || status.type === 'success'}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full border-2 border-black dark:border-white bg-[var(--primary)] text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
            >
              {isSubmitting ? "Updating..." : "Reset Password"}
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
