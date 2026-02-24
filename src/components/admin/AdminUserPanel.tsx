import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Users, Search, Filter, ChevronLeft, ChevronRight,
    Ban, CheckCircle2, Trash2, AlertTriangle, X, UserCheck, UserX
} from 'lucide-react';
import { fetchAllUsers, updateUserStatus, type UserProfile } from '../../lib/adminService';

// ─── Confirm Modal ───────────────────────────────────────────────────────────

function ConfirmModal({ message, onConfirm, onCancel, variant = 'danger' }: {
    message: string; onConfirm: () => void; onCancel: () => void; variant?: 'danger' | 'warning';
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="admin-panel max-w-sm w-full p-6 text-center"
                onClick={e => e.stopPropagation()}
            >
                <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${variant === 'danger' ? 'bg-red-500/15' : 'bg-amber-500/15'
                    }`}>
                    <AlertTriangle size={24} className={variant === 'danger' ? 'text-red-400' : 'text-amber-400'} />
                </div>
                <p className="text-white/80 text-sm mb-6">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white/50 text-sm font-medium hover:bg-white/10 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${variant === 'danger' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                        }`}>
                        Confirm
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        active: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Active' },
        blocked: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Blocked' },
        deleted: { bg: 'bg-gray-500/15', text: 'text-gray-400', label: 'Deleted' },
    };
    const c = config[status] ?? config.active;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {c.label}
        </span>
    );
}

// ─── User Panel ──────────────────────────────────────────────────────────────

export default function AdminUserPanel() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [confirm, setConfirm] = useState<{ userId: string; action: string; message: string } | null>(null);

    const perPage = 10;
    const totalPages = Math.ceil(total / perPage);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        const { users: u, total: t } = await fetchAllUsers({ search, status: statusFilter, page, perPage });
        setUsers(u);
        setTotal(t);
        setLoading(false);
    }, [search, statusFilter, page]);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    const handleAction = useCallback(async () => {
        if (!confirm) return;
        const { userId, action } = confirm;
        const status = action === 'block' ? 'blocked' : action === 'unblock' ? 'active' : 'deleted';
        await updateUserStatus(userId, status);
        setConfirm(null);
        loadUsers();
    }, [confirm, loadUsers]);

    return (
        <div>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center gap-2">
                    <Users size={22} className="text-amber-400" />
                    <h1 className="text-3xl font-display font-bold text-white">Users</h1>
                    <span className="ml-2 px-2.5 py-0.5 rounded-full bg-white/5 text-white/40 text-xs font-medium">{total}</span>
                </div>
                <p className="text-white/30 text-sm mt-1">Manage all registered users</p>
            </motion.div>

            {/* Search + Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2.5 border border-white/8">
                    <Search size={16} className="text-white/25" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-white/40"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="text-white/30 hover:text-white/50">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 border border-white/8">
                    <Filter size={14} className="text-white/25" />
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-transparent border-none outline-none text-white/60 text-sm appearance-none cursor-pointer pr-4"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="admin-panel overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="auth-spinner" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-16">
                        <Users size={32} className="text-white/10 mx-auto mb-3" />
                        <p className="text-white/25 text-sm">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Joined</th>
                                    <th>Last Login</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500/20 to-violet-500/20 flex items-center justify-center shrink-0">
                                                    <span className="text-[10px] font-bold text-white/60">
                                                        {(user.full_name || '?').charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="text-white/80 text-sm font-medium truncate max-w-[140px]">
                                                    {user.full_name || 'Unnamed'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-white/50 text-sm">{user.email}</td>
                                        <td className="text-white/30 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="text-white/30 text-xs">{user.last_login ? new Date(user.last_login).toLocaleDateString() : '—'}</td>
                                        <td><StatusBadge status={user.status} /></td>
                                        <td>
                                            <div className="flex items-center gap-1.5">
                                                {user.status === 'active' ? (
                                                    <button
                                                        onClick={() => setConfirm({ userId: user.id, action: 'block', message: `Block ${user.full_name || user.email}? They won't be able to log in.` })}
                                                        className="admin-table-action text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10"
                                                        title="Block user"
                                                    >
                                                        <Ban size={14} />
                                                    </button>
                                                ) : user.status === 'blocked' ? (
                                                    <button
                                                        onClick={() => setConfirm({ userId: user.id, action: 'unblock', message: `Unblock ${user.full_name || user.email}?` })}
                                                        className="admin-table-action text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10"
                                                        title="Unblock user"
                                                    >
                                                        <CheckCircle2 size={14} />
                                                    </button>
                                                ) : null}
                                                <button
                                                    onClick={() => setConfirm({ userId: user.id, action: 'delete', message: `Permanently delete ${user.full_name || user.email}? This cannot be undone.` })}
                                                    className="admin-table-action text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                                                    title="Delete user"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-1">
                    <span className="text-white/25 text-xs">
                        Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="admin-page-btn"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <span className="text-white/40 text-xs font-medium">
                            {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="admin-page-btn"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirm && (
                    <ConfirmModal
                        message={confirm.message}
                        variant={confirm.action === 'delete' ? 'danger' : 'warning'}
                        onConfirm={handleAction}
                        onCancel={() => setConfirm(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
