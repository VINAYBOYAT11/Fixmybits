import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { adminApi } from "../../lib/api";
import {
  Users, FolderOpen, FileText, CheckSquare,
  AlertTriangle, ArrowRight, TrendingUp, Shield,
  Clock, CheckCircle2, XCircle, Activity,
  UserCheck, Layers, RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Stats = {
  users: {
    total: number; testers: number; startups: number; admins: number;
    approved: number; pending: number; banned: number;
  };
  projects: {
    total: number; draft: number; pending_approval: number; open: number;
    in_progress: number; completed: number; rejected: number;
  };
  reports: {
    total: number; pending: number; approved: number; fixed: number;
    spam: number; duplicate: number;
    by_severity: { Critical: number; High: number; Medium: number; Low: number };
  };
  applications: {
    total: number; pending: number; accepted: number; rejected: number;
  };
};

// ─── Severity bar colours ─────────────────────────────────────────────────────
const SEV_COLORS: Record<string, string> = {
  Critical: "#ef4444",
  High:     "#f97316",
  Medium:   "var(--accent-yellow)",
  Low:      "#22c55e",
};

// ─── Mini bar chart row ───────────────────────────────────────────────────────
function SeverityRow({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="font-semibold">{label}</span>
        <span className="font-bold tabular-nums">{count} <span className="opacity-40 font-normal text-xs">({pct}%)</span></span>
      </div>
      <div className="h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: SEV_COLORS[label] }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  );
}

// ─── Project pipeline step ────────────────────────────────────────────────────
function PipelineStep({
  label, count, color, shadow, delay,
}: { label: string; count: number; color: string; shadow: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex-1 min-w-[90px] p-4 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] text-center"
      style={{ boxShadow: `4px 4px 0 0 ${shadow}` }}
    >
      <div
        className="w-8 h-8 rounded-full border-2 border-black dark:border-white mx-auto mb-2 flex items-center justify-center"
        style={{ background: color }}
      />
      <p className="text-2xl font-black" style={{ fontFamily: "var(--font-heading)" }}>{count}</p>
      <p className="text-xs font-semibold opacity-60 mt-0.5 capitalize">{label.replace("_", " ")}</p>
    </motion.div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  title, value, subtitle, icon: Icon, color, shadow, link, badge,
}: {
  title: string; value: number; subtitle: string;
  icon: React.ElementType; color: string; shadow: string;
  link: string; badge?: { label: string; urgent: boolean };
}) {
  return (
    <motion.a
      href={link}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.15 } }}
      className="p-6 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] flex flex-col relative overflow-hidden cursor-pointer"
      style={{ boxShadow: `6px 6px 0 0 ${shadow}` }}
    >
      {badge && (
        <span
          className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full border border-black/20 ${
            badge.urgent
              ? "bg-red-500 text-white animate-pulse"
              : "bg-black/10 dark:bg-white/10"
          }`}
        >
          {badge.label}
        </span>
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-bold opacity-50 uppercase tracking-widest">{title}</p>
          <h3 className="text-4xl font-black mt-1" style={{ fontFamily: "var(--font-heading)" }}>
            {value}
          </h3>
        </div>
        <div
          className="p-3 rounded-xl border-2 border-black dark:border-white"
          style={{ background: color }}
        >
          <Icon className="w-6 h-6 text-black" />
        </div>
      </div>
      <div className="flex justify-between items-end mt-auto">
        <p className="text-xs font-semibold opacity-60">{subtitle}</p>
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter opacity-60 hover:opacity-100">
          Manage <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </motion.a>
  );
}

// ─── Quick action button ──────────────────────────────────────────────────────
function QuickAction({
  label, href, icon: Icon, color, count,
}: { label: string; href: string; icon: React.ElementType; color: string; count?: number }) {
  return (
    <motion.a
      href={href}
      whileHover={{ x: 5 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] hover:shadow-[4px_4px_0_0_rgba(139,92,246,0.6)] transition-all"
    >
      <div className="p-2 rounded-lg border-2 border-black dark:border-white" style={{ background: color }}>
        <Icon className="w-4 h-4 text-black" />
      </div>
      <span className="font-semibold text-sm flex-1">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
          {count}
        </span>
      )}
      <ArrowRight className="w-4 h-4 opacity-40" />
    </motion.a>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const data = await adminApi.getStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalPending =
    (stats?.users.pending ?? 0) +
    (stats?.projects.pending_approval ?? 0) +
    (stats?.reports.pending ?? 0) +
    (stats?.applications.pending ?? 0);

  // ── Loading ──
  if (loading) {
    return (
      <DashboardLayout role="admin" title="Admin Dashboard">
        <div className="max-w-6xl space-y-6 animate-pulse">
          <div className="h-20 rounded-2xl bg-black/10 dark:bg-white/10" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-black/10 dark:bg-white/10" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64 rounded-2xl bg-black/10 dark:bg-white/10" />
            <div className="h-64 rounded-2xl bg-black/10 dark:bg-white/10" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Error ──
  if (error || !stats) {
    return (
      <DashboardLayout role="admin" title="Admin Dashboard">
        <div className="max-w-md mx-auto mt-16 p-8 rounded-3xl border-2 border-red-500 bg-red-50 dark:bg-red-950 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="font-bold text-lg mb-2">Failed to load dashboard</p>
          <p className="text-sm opacity-70 mb-6">{error}</p>
          <button
            onClick={() => fetchStats()}
            className="px-6 py-3 rounded-full border-2 border-black dark:border-white font-bold bg-red-500 text-white"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const totalReports = Object.values(stats.reports.by_severity).reduce((a, b) => a + b, 0);

  return (
    <DashboardLayout role="admin" title="Admin Dashboard">
      <div className="max-w-6xl space-y-8">

        {/* ── Header row ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black" style={{ fontFamily: "var(--font-heading)" }}>
              Platform Overview
            </h2>
            {lastUpdated && (
              <p className="text-xs opacity-40 mt-0.5">
                Last updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
          <motion.button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-black dark:border-white text-sm font-bold disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </motion.button>
        </div>

        {/* ── Action required banner ── */}
        {totalPending > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border-2 border-red-500 bg-red-50 dark:bg-red-950/50 flex items-start gap-4"
          >
            <div className="p-2 rounded-xl bg-red-500 border-2 border-black shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-red-800 dark:text-red-200 mb-2">
                {totalPending} item{totalPending !== 1 ? "s" : ""} need your attention
              </p>
              <div className="flex flex-wrap gap-3">
                {stats.users.pending > 0 && (
                  <a href="/admin/users" className="flex items-center gap-1.5 text-sm font-semibold text-red-700 dark:text-red-300 hover:underline">
                    <Users className="w-3.5 h-3.5" />
                    {stats.users.pending} pending user{stats.users.pending !== 1 ? "s" : ""}
                  </a>
                )}
                {stats.projects.pending_approval > 0 && (
                  <a href="/admin/projects" className="flex items-center gap-1.5 text-sm font-semibold text-red-700 dark:text-red-300 hover:underline">
                    <FolderOpen className="w-3.5 h-3.5" />
                    {stats.projects.pending_approval} pending project{stats.projects.pending_approval !== 1 ? "s" : ""}
                  </a>
                )}
                {stats.reports.pending > 0 && (
                  <a href="/admin/reports" className="flex items-center gap-1.5 text-sm font-semibold text-red-700 dark:text-red-300 hover:underline">
                    <FileText className="w-3.5 h-3.5" />
                    {stats.reports.pending} pending report{stats.reports.pending !== 1 ? "s" : ""}
                  </a>
                )}
                {stats.applications.pending > 0 && (
                  <a href="/admin/applications" className="flex items-center gap-1.5 text-sm font-semibold text-red-700 dark:text-red-300 hover:underline">
                    <UserCheck className="w-3.5 h-3.5" />
                    {stats.applications.pending} pending application{stats.applications.pending !== 1 ? "s" : ""}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl border-2 border-green-500 bg-green-50 dark:bg-green-950/40 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm font-semibold text-green-800 dark:text-green-200">
              All clear — no pending items require your attention.
            </p>
          </motion.div>
        )}

        {/* ── 4 stat cards ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Users" value={stats.users.total}
            subtitle={`${stats.users.startups} startups · ${stats.users.testers} testers`}
            icon={Users} color="var(--primary)" shadow="rgba(139,92,246,1)"
            link="/admin/users"
            badge={stats.users.pending > 0 ? { label: `${stats.users.pending} pending`, urgent: true } : undefined}
          />
          <StatCard
            title="Projects" value={stats.projects.total}
            subtitle={`${stats.projects.in_progress} active · ${stats.projects.completed} done`}
            icon={FolderOpen} color="var(--accent-mint)" shadow="rgba(52,211,153,1)"
            link="/admin/projects"
            badge={stats.projects.pending_approval > 0 ? { label: `${stats.projects.pending_approval} pending`, urgent: true } : undefined}
          />
          <StatCard
            title="Bug Reports" value={stats.reports.total}
            subtitle={`${stats.reports.approved} approved · ${stats.reports.fixed} fixed`}
            icon={FileText} color="var(--accent-pink)" shadow="rgba(236,72,153,1)"
            link="/admin/reports"
            badge={stats.reports.pending > 0 ? { label: `${stats.reports.pending} pending`, urgent: true } : undefined}
          />
          <StatCard
            title="Applications" value={stats.applications.total}
            subtitle={`${stats.applications.accepted} accepted · ${stats.applications.rejected} rejected`}
            icon={CheckSquare} color="var(--accent-yellow)" shadow="rgba(251,191,36,1)"
            link="/admin/applications"
            badge={stats.applications.pending > 0 ? { label: `${stats.applications.pending} pending`, urgent: true } : undefined}
          />
        </div>

        {/* ── Middle row: project pipeline + quick actions ── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Project pipeline */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a]"
            style={{ boxShadow: "6px 6px 0 0 rgba(52,211,153,1)" }}
          >
            <h2 className="font-bold text-lg mb-1 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
              <Layers className="w-5 h-5 text-[var(--accent-mint)]" />
              Project Pipeline
            </h2>
            <p className="text-xs opacity-50 mb-5">All {stats.projects.total} projects by stage</p>
            <div className="flex gap-2 flex-wrap">
              <PipelineStep label="Draft"    count={stats.projects.draft}            color="#6b7280"              shadow="rgba(107,114,128,0.5)" delay={0.1} />
              <PipelineStep label="Pending"  count={stats.projects.pending_approval} color="var(--accent-yellow)" shadow="rgba(251,191,36,0.6)"  delay={0.15} />
              <PipelineStep label="Open"     count={stats.projects.open}             color="var(--accent-mint)"   shadow="rgba(52,211,153,0.6)"  delay={0.2} />
              <PipelineStep label="Active"   count={stats.projects.in_progress}      color="#3b82f6"              shadow="rgba(59,130,246,0.6)"  delay={0.25} />
              <PipelineStep label="Done"     count={stats.projects.completed}        color="#22c55e"              shadow="rgba(34,197,94,0.6)"   delay={0.3} />
              <PipelineStep label="Rejected" count={stats.projects.rejected}         color="#ef4444"              shadow="rgba(239,68,68,0.5)"   delay={0.35} />
            </div>
          </motion.section>

          {/* Quick actions */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a]"
            style={{ boxShadow: "6px 6px 0 0 rgba(139,92,246,1)" }}
          >
            <h2 className="font-bold text-lg mb-1 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
              <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
              Quick Actions
            </h2>
            <p className="text-xs opacity-50 mb-5">Jump to items needing review</p>
            <div className="space-y-2">
              <QuickAction label="Review Pending Users"    href="/admin/users"        icon={Users}      color="var(--primary)"       count={stats.users.pending} />
              <QuickAction label="Approve Projects"        href="/admin/projects"     icon={FolderOpen} color="var(--accent-mint)"   count={stats.projects.pending_approval} />
              <QuickAction label="Review Bug Reports"      href="/admin/reports"      icon={FileText}   color="var(--accent-pink)"   count={stats.reports.pending} />
              <QuickAction label="Tester Applications"     href="/admin/applications" icon={UserCheck}  color="var(--accent-yellow)" count={stats.applications.pending} />
            </div>
          </motion.section>
        </div>

        {/* ── Bottom row: severity chart + user breakdown ── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Severity distribution */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-6 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a]"
            style={{ boxShadow: "6px 6px 0 0 rgba(236,72,153,1)" }}
          >
            <h2 className="font-bold text-lg mb-1 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
              <Activity className="w-5 h-5 text-[var(--accent-pink)]" />
              Report Severity
            </h2>
            <p className="text-xs opacity-50 mb-5">{totalReports} total reports across all severities</p>
            {totalReports === 0 ? (
              <p className="text-sm opacity-50 text-center py-8">No reports submitted yet.</p>
            ) : (
              <div className="space-y-4">
                {(["Critical", "High", "Medium", "Low"] as const).map((sev) => (
                  <SeverityRow
                    key={sev}
                    label={sev}
                    count={stats.reports.by_severity[sev]}
                    total={totalReports}
                  />
                ))}
              </div>
            )}

            {/* Report status summary */}
            <div className="mt-6 pt-4 border-t-2 border-black/10 dark:border-white/10 grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Approved", value: stats.reports.approved, color: "#22c55e" },
                { label: "Fixed",    value: stats.reports.fixed,    color: "var(--accent-mint)" },
                { label: "Spam",     value: stats.reports.spam,     color: "#6b7280" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className="text-xl font-black" style={{ fontFamily: "var(--font-heading)", color }}>{value}</p>
                  <p className="text-xs opacity-60 font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* User breakdown */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a]"
            style={{ boxShadow: "6px 6px 0 0 rgba(251,191,36,1)" }}
          >
            <h2 className="font-bold text-lg mb-1 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
              <Shield className="w-5 h-5 text-[var(--accent-yellow)]" />
              User Breakdown
            </h2>
            <p className="text-xs opacity-50 mb-5">{stats.users.total} registered accounts</p>

            <div className="space-y-3">
              {[
                { label: "Startups",  value: stats.users.startups, color: "var(--accent-pink)",   bg: "rgba(236,72,153,0.15)" },
                { label: "Testers",   value: stats.users.testers,  color: "var(--primary)",        bg: "rgba(139,92,246,0.15)" },
                { label: "Admins",    value: stats.users.admins,   color: "var(--accent-yellow)",  bg: "rgba(251,191,36,0.15)" },
              ].map(({ label, value, color, bg }) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border-2 border-black/10 dark:border-white/10"
                  style={{ background: bg }}
                >
                  <span className="font-semibold text-sm">{label}</span>
                  <span className="text-2xl font-black" style={{ fontFamily: "var(--font-heading)", color }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Account health */}
            <div className="mt-5 pt-4 border-t-2 border-black/10 dark:border-white/10 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider opacity-50 mb-3">Account Health</p>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Approved
                </span>
                <span className="font-bold">{stats.users.approved}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" /> Pending Approval
                </span>
                <span className={`font-bold ${stats.users.pending > 0 ? "text-red-500" : ""}`}>
                  {stats.users.pending}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" /> Banned
                </span>
                <span className="font-bold">{stats.users.banned}</span>
              </div>
            </div>
          </motion.section>
        </div>

      </div>
    </DashboardLayout>
  );
}
