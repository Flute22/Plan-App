import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, UserCheck, UserX, UserPlus, TrendingUp, Database, Activity, ArrowRight } from 'lucide-react';
import { fetchAdminStats, fetchActivityLog, type AdminStats, type ActivityEntry } from '../../lib/adminService';

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, delay = 0 }: {
    label: string; value: number | string; icon: typeof Users; color: string; delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="admin-stat-card"
        >
            <div className={`admin-stat-icon ${color}`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-white/40 text-xs font-medium mt-0.5">{label}</p>
            </div>
        </motion.div>
    );
}

// ─── Activity Item ───────────────────────────────────────────────────────────

function ActivityItem({ entry }: { entry: ActivityEntry }) {
    const actionMap: Record<string, { label: string; color: string }> = {
        signup: { label: '🆕 New user signed up', color: 'text-emerald-400' },
        login: { label: '🔑 User logged in', color: 'text-sky-400' },
        user_blocked: { label: '🚫 User blocked', color: 'text-red-400' },
        user_unblocked: { label: '✅ User unblocked', color: 'text-emerald-400' },
        user_deleted: { label: '🗑️ User deleted', color: 'text-red-400' },
    };

    const info = actionMap[entry.action] ?? { label: entry.action, color: 'text-white/50' };
    const email = (entry.details as Record<string, string>)?.email ?? '';
    const time = new Date(entry.created_at).toLocaleString();

    return (
        <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
            <div className={`text-xs font-medium ${info.color}`}>{info.label}</div>
            {email && <span className="text-white/30 text-xs truncate">{email}</span>}
            <span className="text-white/15 text-[10px] ml-auto shrink-0">{time}</span>
        </div>
    );
}

// ─── Mini Growth Chart (SVG) ─────────────────────────────────────────────────

function GrowthChart({ stats }: { stats: AdminStats }) {
    // Simple bar chart: today, this week, this month
    const maxVal = Math.max(stats.signups_today, stats.signups_week, stats.signups_month, 1);
    const bars = [
        { label: 'Today', value: stats.signups_today, color: '#f6c857' },
        { label: 'Week', value: stats.signups_week, color: '#f09c67' },
        { label: 'Month', value: stats.signups_month, color: '#e8737a' },
    ];

    return (
        <div className="flex items-end gap-4 h-28 px-4">
            {bars.map(bar => (
                <div key={bar.label} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max((bar.value / maxVal) * 80, 4)}px` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="w-full max-w-[40px] rounded-t-lg"
                        style={{ background: bar.color }}
                    />
                    <span className="text-[10px] text-white/30 font-medium">{bar.label}</span>
                    <span className="text-xs text-white/60 font-semibold -mt-1">{bar.value}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function AdminDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [activity, setActivity] = useState<ActivityEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const [s, a] = await Promise.all([
                fetchAdminStats(),
                fetchActivityLog(15),
            ]);
            setStats(s);
            setActivity(a);
            setLoading(false);
        })();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="auth-spinner" />
            </div>
        );
    }

    const s = stats ?? {
        total_users: 0, active_users: 0, blocked_users: 0,
        signups_today: 0, signups_week: 0, signups_month: 0,
        total_data_entries: 0,
    };

    return (
        <div>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>
                <p className="text-white/30 text-sm mt-1">Overview of your application</p>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Users" value={s.total_users} icon={Users} color="bg-sky-500/15 text-sky-400" delay={0} />
                <StatCard label="Active Users" value={s.active_users} icon={UserCheck} color="bg-emerald-500/15 text-emerald-400" delay={0.05} />
                <StatCard label="Blocked Users" value={s.blocked_users} icon={UserX} color="bg-red-500/15 text-red-400" delay={0.1} />
                <StatCard label="Data Entries" value={s.total_data_entries} icon={Database} color="bg-violet-500/15 text-violet-400" delay={0.15} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Signups Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="admin-panel lg:col-span-1"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={16} className="text-amber-400" />
                        <h3 className="text-sm font-semibold text-white/70">User Growth</h3>
                    </div>
                    <GrowthChart stats={s} />
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                        <UserPlus size={14} className="text-white/30" />
                        <span className="text-xs text-white/40">{s.signups_today} new today</span>
                    </div>
                </motion.div>

                {/* Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="admin-panel lg:col-span-2"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Activity size={16} className="text-amber-400" />
                            <h3 className="text-sm font-semibold text-white/70">Recent Activity</h3>
                        </div>
                    </div>
                    <div className="admin-scrollable max-h-[300px]">
                        {activity.length === 0 ? (
                            <p className="text-white/20 text-sm text-center py-8">No activity yet</p>
                        ) : (
                            activity.map(entry => {
                                const actionMap: Record<string, { label: string; color: string }> = {
                                    signup: { label: '🆕 New user signed up', color: 'text-emerald-400' },
                                    login: { label: '🔑 User logged in', color: 'text-sky-400' },
                                    user_blocked: { label: '🚫 User blocked', color: 'text-red-400' },
                                    user_unblocked: { label: '✅ User unblocked', color: 'text-emerald-400' },
                                    user_deleted: { label: '🗑️ User deleted', color: 'text-red-400' },
                                };
                                const info = actionMap[entry.action] ?? { label: entry.action, color: 'text-white/50' };
                                const email = (entry.details as Record<string, string>)?.email ?? '';
                                const time = new Date(entry.created_at).toLocaleString();
                                return (
                                    <div key={entry.id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                                        <div className={`text-xs font-medium ${info.color}`}>{info.label}</div>
                                        {email && <span className="text-white/30 text-xs truncate">{email}</span>}
                                        <span className="text-white/15 text-[10px] ml-auto shrink-0">{time}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6"
            >
                {[
                    { label: 'Manage Users', target: 'admin/users', icon: Users, color: 'from-sky-500/20 to-sky-600/10' },
                    { label: 'View Data', target: 'admin/data', icon: Database, color: 'from-violet-500/20 to-violet-600/10' },
                    { label: 'Settings', target: 'admin/settings', icon: Activity, color: 'from-amber-500/20 to-amber-600/10' },
                ].map(item => (
                    <button
                        key={item.target}
                        onClick={() => onNavigate(item.target)}
                        className={`admin-action-btn bg-gradient-to-br ${item.color}`}
                    >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                        <ArrowRight size={14} className="ml-auto opacity-40" />
                    </button>
                ))}
            </motion.div>
        </div>
    );
}
