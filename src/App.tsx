import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, Sun, CloudMoon, Sunset, Moon, LogOut, User } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import DailyPriorities from './components/DailyPriorities';
import TodoList from './components/TodoList';
import DailyAffirmation from './components/DailyAffirmation';
import WaterTracker from './components/WaterTracker';
import NotesSection from './components/NotesSection';
import PomodoroTimer from './components/PomodoroTimer';
import MusicPlayer from './components/MusicPlayer';
import SleepTracker from './components/SleepTracker';
import GratitudeJournal from './components/GratitudeJournal';
import MealTracker from './components/MealTracker';
import ActivityChart from './components/ActivityChart';
import Logo from './components/Logo';
import DayManager from './components/DayManager';
import LoginPage from './components/auth/LoginPage';
import SignUpPage from './components/auth/SignUpPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';

// Admin components
import AdminLoginPage from './components/admin/AdminLoginPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUserPanel from './components/admin/AdminUserPanel';
import AdminDataPanel from './components/admin/AdminDataPanel';
import AdminSettings from './components/admin/AdminSettings';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getTimeIcon() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return <Sun size={18} className="text-amber-400" />;
  if (hour >= 12 && hour < 17) return <Sunset size={18} className="text-orange-400" />;
  if (hour >= 17 && hour < 21) return <CloudMoon size={18} className="text-rose-300" />;
  return <Moon size={18} className="text-indigo-300" />;
}

// ─── Simple hash-based router ────────────────────────────────────────────────

type Page =
  | 'dashboard' | 'login' | 'signup' | 'forgot-password' | 'reset-password'
  | 'admin-login' | 'admin-dashboard' | 'admin-users' | 'admin-data' | 'admin-settings';

function getPageFromHash(): Page {
  const hash = window.location.hash.slice(2); // remove #/
  if (hash === 'login') return 'login';
  if (hash === 'signup') return 'signup';
  if (hash === 'forgot-password') return 'forgot-password';
  if (hash === 'reset-password') return 'reset-password';
  if (hash === 'admin/login') return 'admin-login';
  if (hash === 'admin' || hash === 'admin/dashboard') return 'admin-dashboard';
  if (hash === 'admin/users') return 'admin-users';
  if (hash === 'admin/data') return 'admin-data';
  if (hash === 'admin/settings') return 'admin-settings';
  return 'dashboard';
}

const ADMIN_PAGES: Page[] = ['admin-dashboard', 'admin-users', 'admin-data', 'admin-settings'];
const AUTH_PAGES: Page[] = ['login', 'signup', 'forgot-password'];

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const { user, loading, signOut, isAdmin } = useAuth();
  const [page, setPage] = useState<Page>(getPageFromHash);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Sync hash changes
  useEffect(() => {
    const onHashChange = () => setPage(getPageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Navigate helper
  const navigate = useCallback((target: string) => {
    window.location.hash = `#/${target === 'dashboard' ? '' : target}`;
  }, []);

  // Auth-based redirects
  useEffect(() => {
    if (loading) return;

    const isAdminPage = ADMIN_PAGES.includes(page);
    const isAdminLoginPage = page === 'admin-login';
    const isAuthPage = AUTH_PAGES.includes(page);
    const isResetPage = page === 'reset-password';

    // ── Admin route protection ──
    if (isAdminPage) {
      if (!user) {
        navigate('admin/login'); // Not logged in → admin login
        return;
      }
      if (!isAdmin) {
        navigate('dashboard'); // Regular user → block from admin
        return;
      }
      return; // Admin on admin page → OK
    }

    if (isAdminLoginPage) {
      if (user && isAdmin) {
        navigate('admin/dashboard'); // Already admin → go to admin dashboard
        return;
      }
      if (user && !isAdmin) {
        navigate('dashboard'); // Regular user on admin login → go to user dashboard
        return;
      }
      return; // Not logged in → show admin login
    }

    // ── Regular auth redirects ──
    if (user && isAdmin && !isAdminPage && !isAdminLoginPage) {
      // Admin on user pages → redirect to admin dashboard
      navigate('admin/dashboard');
      return;
    }

    if (user && !isAdmin && isAuthPage) {
      navigate('dashboard'); // Authenticated user on auth pages → dashboard
    } else if (!user && !isAuthPage && !isResetPage && !isAdminLoginPage) {
      navigate('login'); // Unauthenticated user on protected pages → login
    }
  }, [user, loading, page, navigate, isAdmin]);

  const handleFocusChange = useCallback((focused: boolean) => {
    setIsFocusMode(focused);
  }, []);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    await signOut();
    navigate('login');
    setLoggingOut(false);
  }, [signOut, navigate]);

  // ── Loading screen ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="orb w-72 h-72 bg-amber-500/20 top-[-5%] left-[10%]" style={{ animationDelay: '0s' }} />
        <div className="orb w-96 h-96 bg-rose-500/15 top-[30%] right-[-10%]" style={{ animationDelay: '5s' }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Logo variant="icon" size={56} />
          <div className="auth-spinner mx-auto mt-6" />
          <p className="text-white/30 text-sm mt-4 font-medium">Loading your day...</p>
        </motion.div>
      </div>
    );
  }

  // ── Admin Login Page ───────────────────────────────────────────────────
  if (page === 'admin-login' && !user) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="orb w-72 h-72 bg-amber-500/20 top-[-5%] left-[10%]" style={{ animationDelay: '0s' }} />
        <div className="orb w-96 h-96 bg-rose-500/15 top-[30%] right-[-10%]" style={{ animationDelay: '5s' }} />
        <div className="orb w-56 h-56 bg-orange-500/10 bottom-[10%] left-[30%]" style={{ animationDelay: '3s' }} />
        <AdminLoginPage onNavigate={navigate} />
      </div>
    );
  }

  // ── Admin Panel (dashboard, users, data, settings) ─────────────────────
  if (user && isAdmin && ADMIN_PAGES.includes(page)) {
    return (
      <div className="min-h-screen admin-bg">
        <AdminLayout activePage={page as 'admin-dashboard' | 'admin-users' | 'admin-data' | 'admin-settings'} onNavigate={navigate}>
          <AnimatePresence mode="wait">
            {page === 'admin-dashboard' && (
              <motion.div key="a-dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AdminDashboard onNavigate={navigate} />
              </motion.div>
            )}
            {page === 'admin-users' && (
              <motion.div key="a-users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AdminUserPanel />
              </motion.div>
            )}
            {page === 'admin-data' && (
              <motion.div key="a-data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AdminDataPanel />
              </motion.div>
            )}
            {page === 'admin-settings' && (
              <motion.div key="a-settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AdminSettings />
              </motion.div>
            )}
          </AnimatePresence>
        </AdminLayout>
      </div>
    );
  }

  // ── User Auth pages ────────────────────────────────────────────────────
  if (!user && (page === 'login' || page === 'signup' || page === 'forgot-password')) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="orb w-72 h-72 bg-amber-500/20 top-[-5%] left-[10%]" style={{ animationDelay: '0s' }} />
        <div className="orb w-96 h-96 bg-rose-500/15 top-[30%] right-[-10%]" style={{ animationDelay: '5s' }} />
        <div className="orb w-64 h-64 bg-teal-500/15 bottom-[10%] left-[20%]" style={{ animationDelay: '10s' }} />
        <div className="orb w-56 h-56 bg-violet-500/10 top-[5%] right-[30%]" style={{ animationDelay: '3s' }} />

        <AnimatePresence mode="wait">
          {page === 'login' && <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LoginPage onNavigate={navigate} /></motion.div>}
          {page === 'signup' && <motion.div key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SignUpPage onNavigate={navigate} /></motion.div>}
          {page === 'forgot-password' && <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ForgotPasswordPage onNavigate={navigate} /></motion.div>}
        </AnimatePresence>

      </div>
    );
  }

  // Reset password page (can be accessed with or without full auth — Supabase handles the token)
  if (page === 'reset-password') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="orb w-72 h-72 bg-amber-500/20 top-[-5%] left-[10%]" style={{ animationDelay: '0s' }} />
        <div className="orb w-96 h-96 bg-rose-500/15 top-[30%] right-[-10%]" style={{ animationDelay: '5s' }} />
        <ResetPasswordPage onNavigate={navigate} />
      </div>
    );
  }

  // ── Protected Dashboard ────────────────────────────────────────────────
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ===== Floating Background Orbs ===== */}
      <div className="orb w-72 h-72 bg-amber-500/20 top-[-5%] left-[10%]" style={{ animationDelay: '0s' }} />
      <div className="orb w-96 h-96 bg-rose-500/15 top-[30%] right-[-10%]" style={{ animationDelay: '5s' }} />
      <div className="orb w-64 h-64 bg-teal-500/15 bottom-[10%] left-[20%]" style={{ animationDelay: '10s' }} />
      <div className="orb w-48 h-48 bg-orange-400/10 top-[60%] left-[60%]" style={{ animationDelay: '8s' }} />
      <div className="orb w-56 h-56 bg-violet-500/10 top-[5%] right-[30%]" style={{ animationDelay: '3s' }} />

      {/* ===== Main Content ===== */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <DayManager />

        {/* ===== Header — hidden in focus mode ===== */}
        <motion.header
          animate={{ opacity: isFocusMode ? 0 : 1, height: isFocusMode ? 0 : 'auto', marginBottom: isFocusMode ? 0 : 40 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 overflow-hidden"
        >
          <div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-2">
              <Logo variant="horizontal" size={40} />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-tight">
              <span className="gradient-text">{getGreeting()}</span>
              <span className="text-white/80">, {userName.split(' ')[0]}</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
              className="text-white/25 mt-2 font-medium text-sm sm:text-base">
              Let's make today beautiful ✨
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-3">
            {/* User pill */}
            <div className="glass-card !rounded-2xl px-4 py-2.5 flex items-center gap-2.5 !bg-white/5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/30 to-rose-500/30 flex items-center justify-center">
                <User size={14} className="text-white/70" />
              </div>
              <span className="text-sm font-medium text-white/50 max-w-[120px] truncate">{userName}</span>
              <div className="w-px h-4 bg-white/10" />
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-white/30 hover:text-rose-400 transition-colors p-0.5"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
            {/* Date pill */}
            <div className="glass-card !rounded-2xl px-5 py-3 flex items-center gap-3 !bg-white/5">
              <Calendar size={16} className="text-white/30" />
              <span className="text-sm font-medium text-white/50">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              <div className="w-px h-4 bg-white/10" />
              {getTimeIcon()}
            </div>
          </motion.div>
        </motion.header>

        {/* ===== Focus Mode Indicator ===== */}
        {isFocusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="text-center text-xs font-bold uppercase tracking-[0.3em] text-orange-400/40 mb-6"
          >
            ● Focus Mode Active
          </motion.div>
        )}

        {/* ===== Dashboard Grid ===== */}
        <div className={isFocusMode
          ? 'flex flex-col items-center gap-6 max-w-3xl mx-auto'
          : 'grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6'
        }>

          {/* Left Column — hidden in focus mode */}
          <div className={`lg:col-span-5 space-y-5 lg:space-y-6 transition-all duration-500 ${isFocusMode ? 'hidden' : ''}`}>
            <DailyPriorities />
            <ActivityChart />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6">
              <DailyAffirmation />
              {!isFocusMode && <NotesSection />}
            </div>
          </div>

          {/* Center Column — hidden in focus mode */}
          <div className={`lg:col-span-4 space-y-5 lg:space-y-6 transition-all duration-500 ${isFocusMode ? 'hidden' : ''}`}>
            <TodoList />
            <GratitudeJournal />
            <MealTracker />
          </div>

          {/* Right Column / Focus: Timer only */}
          <div className={isFocusMode ? 'w-full max-w-sm mx-auto' : 'lg:col-span-3 space-y-5 lg:space-y-6'}>
            <PomodoroTimer onFocusChange={handleFocusChange} />
            {!isFocusMode && (
              <>
                <WaterTracker />
                <SleepTracker />
                <MusicPlayer />
              </>
            )}
          </div>

          {/* Focus mode: Notes + Music side-by-side */}
          {isFocusMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <NotesSection />
              <MusicPlayer />
            </div>
          )}
        </div>

        <footer className="mt-16 text-center pb-8">
          <p className="text-white/10 text-xs font-medium tracking-wide">
            © {new Date().getFullYear()} flow-Day • Crafted with 💖
          </p>
        </footer>
      </div>
    </div>
  );
}
