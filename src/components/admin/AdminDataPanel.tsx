import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Database, Search, Download, Trash2, X, ChevronLeft, ChevronRight,
    AlertTriangle, Filter, Eye, EyeOff
} from 'lucide-react';
import {
    fetchAllData, fetchAllUsers, deleteDataEntry, exportToCSV,
    type DataEntry, type UserProfile
} from '../../lib/adminService';

// ─── Data Panel ──────────────────────────────────────────────────────────────

export default function AdminDataPanel() {
    const [entries, setEntries] = useState<DataEntry[]>([]);
    const [allEntries, setAllEntries] = useState<DataEntry[]>([]); // for export
    const [total, setTotal] = useState(0);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [search, setSearch] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [expandedKey, setExpandedKey] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    const perPage = 20;
    const totalPages = Math.ceil(total / perPage);

    // Load users for the filter dropdown
    useEffect(() => {
        fetchAllUsers({ perPage: 100 }).then(({ users: u }) => setUsers(u));
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        const { entries: e, total: t } = await fetchAllData({
            search, userId: userFilter || undefined, page, perPage,
        });
        setEntries(e);
        setTotal(t);
        setLoading(false);
    }, [search, userFilter, page]);

    useEffect(() => { loadData(); }, [loadData]);

    // Get user name from ID
    const getUserName = (userId: string | null) => {
        if (!userId) return 'N/A';
        const user = users.find(u => u.id === userId);
        return user?.full_name || user?.email || userId.slice(0, 8);
    };

    // Handle delete
    const handleDelete = useCallback(async () => {
        if (!deleting) return;
        await deleteDataEntry(deleting);
        setDeleting(null);
        loadData();
    }, [deleting, loadData]);

    // Handle export
    const handleExport = useCallback(async () => {
        // Fetch all entries for export (no pagination)
        const { entries: all } = await fetchAllData({ search, userId: userFilter || undefined, perPage: 10000 });
        setAllEntries(all);
        exportToCSV(all, `flowday-data-${new Date().toISOString().slice(0, 10)}.csv`);
    }, [search, userFilter]);

    return (
        <div>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Database size={22} className="text-amber-400" />
                            <h1 className="text-3xl font-display font-bold text-white">Data</h1>
                            <span className="ml-2 px-2.5 py-0.5 rounded-full bg-white/5 text-white/40 text-xs font-medium">{total}</span>
                        </div>
                        <p className="text-white/30 text-sm mt-1">View and manage all user data</p>
                    </div>
                    <button onClick={handleExport} className="admin-export-btn">
                        <Download size={15} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </motion.div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2.5 border border-white/8">
                    <Search size={16} className="text-white/25" />
                    <input
                        type="text"
                        placeholder="Search by key..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-white/40"
                    />
                    {search && <button onClick={() => setSearch('')} className="text-white/30 hover:text-white/50"><X size={14} /></button>}
                </div>
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 border border-white/8">
                    <Filter size={14} className="text-white/25" />
                    <select
                        value={userFilter}
                        onChange={e => { setUserFilter(e.target.value); setPage(1); }}
                        className="bg-transparent border-none outline-none text-white/60 text-sm appearance-none cursor-pointer pr-4"
                    >
                        <option value="">All Users</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="admin-panel overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="auth-spinner" />
                    </div>
                ) : entries.length === 0 ? (
                    <div className="text-center py-16">
                        <Database size={32} className="text-white/10 mx-auto mb-3" />
                        <p className="text-white/25 text-sm">No data entries found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Key</th>
                                    <th>User</th>
                                    <th>Updated</th>
                                    <th>Value</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map(entry => (
                                    <tr key={entry.key}>
                                        <td className="text-white/70 text-sm font-mono text-xs max-w-[200px] truncate">{entry.key}</td>
                                        <td className="text-white/50 text-sm">{getUserName(entry.user_id)}</td>
                                        <td className="text-white/30 text-xs">{new Date(entry.updated_at).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                onClick={() => setExpandedKey(expandedKey === entry.key ? null : entry.key)}
                                                className="flex items-center gap-1 text-xs text-sky-400/70 hover:text-sky-400 transition-colors"
                                            >
                                                {expandedKey === entry.key ? <EyeOff size={12} /> : <Eye size={12} />}
                                                {expandedKey === entry.key ? 'Hide' : 'View'}
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => setDeleting(entry.key)}
                                                className="admin-table-action text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                                                title="Delete entry"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Expanded value viewer */}
                        <AnimatePresence>
                            {expandedKey && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="border-t border-white/5 p-4"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-mono text-white/40">{expandedKey}</span>
                                        <button onClick={() => setExpandedKey(null)} className="text-white/30 hover:text-white/50"><X size={14} /></button>
                                    </div>
                                    <pre className="admin-scrollable max-h-[200px] text-xs text-white/50 bg-black/20 rounded-xl p-3 overflow-auto whitespace-pre-wrap">
                                        {JSON.stringify(entries.find(e => e.key === expandedKey)?.value, null, 2)}
                                    </pre>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="admin-page-btn">
                            <ChevronLeft size={14} />
                        </button>
                        <span className="text-white/40 text-xs font-medium">{page} / {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="admin-page-btn">
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <AnimatePresence>
                {deleting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                        onClick={() => setDeleting(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="admin-panel max-w-sm w-full p-6 text-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-14 h-14 rounded-full bg-red-500/15 mx-auto mb-4 flex items-center justify-center">
                                <AlertTriangle size={24} className="text-red-400" />
                            </div>
                            <p className="text-white/80 text-sm mb-6">Delete this data entry? This cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleting(null)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white/50 text-sm font-medium hover:bg-white/10 transition-colors">Cancel</button>
                                <button onClick={handleDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-colors">Delete</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
