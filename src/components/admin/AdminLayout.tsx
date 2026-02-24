import { motion } from 'motion/react';
import { LayoutDashboard, Users, Database, Settings, LogOut, Shield, ChevronLeft, Menu } from 'lucide-react';
import { useState, useCallback, type ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../Logo';

type AdminPage = 'admin-dashboard' | 'admin-users' | 'admin-data' | 'admin-settings';

const NAV_ITEMS: { id: AdminPage; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-users', label: 'Users', icon: Users },
    { id: 'admin-data', label: 'Data', icon: Database },
    { id: 'admin-settings', label: 'Settings', icon: Settings },
];

interface AdminLayoutProps {
    activePage: AdminPage;
    onNavigate: (page: string) => void;
    children: ReactNode;
}

export default function AdminLayout({ activePage, onNavigate, children }: AdminLayoutProps) {
    const { user, signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const adminName = user?.user_metadata?.full_name || 'Admin';

    const handleLogout = useCallback(async () => {
        await signOut();
        onNavigate('admin/login');
    }, [signOut, onNavigate]);

    return (
        <div className="min-h-screen flex">
            {/* ===== Sidebar ===== */}
            <motion.aside
                animate={{ width: sidebarOpen ? 260 : 72 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="admin-sidebar fixed lg:relative z-30 h-screen flex flex-col"
            >
                {/* Logo + collapse */}
                <div className="flex items-center justify-between px-4 py-5">
                    {sidebarOpen && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                            <Logo variant="icon" size={28} />
                            <div>
                                <span className="text-white/90 font-semibold text-sm">flow-Day</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <Shield size={10} className="text-amber-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/70">Admin</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(prev => !prev)}
                        className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                    >
                        {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-3 py-2 space-y-1">
                    {NAV_ITEMS.map(item => {
                        const isActive = activePage === item.id;
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id.replace('admin-', 'admin/'))}
                                className={`admin-nav-item ${isActive ? 'admin-nav-active' : ''}`}
                                title={!sidebarOpen ? item.label : undefined}
                            >
                                <Icon size={18} />
                                {sidebarOpen && <span>{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* Admin profile + logout */}
                <div className="px-3 py-4 border-t border-white/5">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2.5 px-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-amber-300">{adminName.charAt(0)}</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-white/70 text-sm font-medium truncate">{adminName}</p>
                                <p className="text-white/30 text-xs truncate">{user?.email}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="admin-nav-item text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10"
                        title={!sidebarOpen ? 'Logout' : undefined}
                    >
                        <LogOut size={18} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* ===== Main Content ===== */}
            <main className="flex-1 min-h-screen overflow-auto">
                <div className="max-w-[1200px] mx-auto px-6 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
