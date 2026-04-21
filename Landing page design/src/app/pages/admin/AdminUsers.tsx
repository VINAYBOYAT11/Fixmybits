import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { adminApi } from "../../lib/api";
import { ShieldAlert, CheckCircle, XCircle } from "lucide-react";

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    adminApi.getPendingUsers()
      .then((data: any) => setUsers(data.results || []))
      .catch((err: any) => console.error("Failed to fetch pending users", err))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: string, email: string) => {
    setActionLoading(id);
    try {
      await adminApi.approveUser(id);
      setUsers(users.filter(u => u.id !== id));
      alert(`User ${email} approved successfully.`);
    } catch (err: any) {
      alert(err.message || "Failed to approve user.");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <DashboardLayout role="admin" title="Pending Users Approvals">
      <div className="max-w-5xl space-y-6">
        <div className="flex items-center gap-3 p-4 bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500 rounded-2xl">
          <ShieldAlert className="w-6 h-6 text-yellow-600 dark:text-yellow-400 shrink-0" />
          <p className="text-yellow-800 dark:text-yellow-200 font-medium text-sm">
            Users listed here have registered but cannot use the platform until an administrator approves their account.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 rounded-full border-4 animate-spin border-[var(--primary)] border-t-transparent" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border-2 border-black dark:border-white bg-white dark:bg-[#262626] shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
            <CheckCircle className="w-12 h-12 text-[var(--accent-mint)] mx-auto mb-4" />
            <p className="font-bold text-xl font-heading">No pending users</p>
            <p className="opacity-60">All new registrations have been handled.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-[5px_5px_0_0_rgba(79,140,255,1)] transition-all"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-lg">{user.email}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border-2 border-black dark:border-white ${
                      user.role === 'startup' ? 'bg-[var(--accent-pink)] text-white' : 'bg-[var(--accent-mint)] text-black'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-sm opacity-60">Registered: {new Date(user.date_joined).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <motion.button
                    onClick={() => handleApprove(user.id, user.email)}
                    disabled={actionLoading === user.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 md:flex-none flex justify-center items-center gap-2 px-6 py-2 rounded-full border-2 border-black dark:border-white font-bold bg-[var(--accent-mint)] text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none transition-all disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {actionLoading === user.id ? "Approving..." : "Approve"}
                  </motion.button>
                  {/* Option for rejecting could be added later if API supports deleting/banning directly from here */}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
