import { useState, useCallback, useRef, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../Logo';

// ─── Client-side rate limiting ───────────────────────────────────────────────

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

export default function AdminLoginPage({ onNavigate }: { onNavigate: (page: string) => void }) {
    const { signIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Rate limiting state
    const attempts = useRef(0);
    const [lockedUntil, setLockedUntil] = useState<number | null>(null);
    const [lockCountdown, setLockCountdown] = useState(0);

    const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
    const canSubmit = email.length > 0 && password.length > 0 && !isLocked;

    // Countdown timer
    const startCountdown = useCallback((seconds: number) => {
        setLockCountdown(seconds);
        const interval = setInterval(() => {
            setLockCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setLockedUntil(null);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        setError('');

        const { error: authError } = await signIn(email, password);

        if (authError) {
            attempts.current++;

            if (attempts.current >= MAX_ATTEMPTS) {
                const lockTime = Date.now() + LOCKOUT_SECONDS * 1000;
                setLockedUntil(lockTime);
                startCountdown(LOCKOUT_SECONDS);
                attempts.current = 0;
                setError(`Too many failed attempts. Locked for ${LOCKOUT_SECONDS} seconds.`);
            } else {
                setError(
                    authError.message === 'Invalid login credentials'
                        ? `Invalid credentials. ${MAX_ATTEMPTS - attempts.current} attempts remaining.`
                        : authError.message
                );
            }
            setLoading(false);
            return;
        }

        // Login succeeded — but we need to verify this is an admin
        // The onAuthStateChange in AuthContext will update isAdmin.
        // App.tsx will handle routing based on role.
        attempts.current = 0;
        setLoading(false);
    }, [canSubmit, email, password, signIn, startCountdown]);

    return (
        <div className="auth-page">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="auth-card"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-5">
                        <Logo variant="icon" size={48} />
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Shield size={18} className="text-amber-400" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400/80">Admin Panel</span>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Login</h1>
                    <p className="text-white/40 text-sm">Authorized personnel only</p>
                </div>

                {/* Lockout warning */}
                {isLocked && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm mb-4"
                    >
                        <AlertTriangle size={16} />
                        <span>Locked for {lockCountdown}s — too many failed attempts</span>
                    </motion.div>
                )}

                {/* Error */}
                {error && !isLocked && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="auth-error"
                    >
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="auth-field">
                        <label className="auth-label">Admin Email</label>
                        <div className="auth-input-wrap">
                            <Mail size={18} className="auth-input-icon" />
                            <input
                                type="email"
                                placeholder="admin@flowday.app"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="auth-input"
                                autoComplete="email"
                                disabled={isLocked}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="auth-field">
                        <label className="auth-label">Password</label>
                        <div className="auth-input-wrap">
                            <Lock size={18} className="auth-input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter admin password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="auth-input"
                                autoComplete="current-password"
                                disabled={isLocked}
                            />
                            <button type="button" onClick={() => setShowPassword(p => !p)} className="auth-toggle-pw">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <motion.button
                        whileHover={{ scale: canSubmit ? 1.02 : 1 }}
                        whileTap={{ scale: canSubmit ? 0.98 : 1 }}
                        type="submit"
                        disabled={!canSubmit || loading}
                        className="auth-submit !bg-gradient-to-r !from-amber-500 !to-orange-600"
                    >
                        {loading ? (
                            <div className="auth-spinner" />
                        ) : (
                            <>
                                <Shield size={18} />
                                Access Admin Panel
                                <ArrowRight size={16} />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Footer — link back to user login */}
                <p className="text-center text-white/20 text-xs mt-6">
                    Not an admin?{' '}
                    <button onClick={() => onNavigate('login')} className="auth-link !text-white/40 hover:!text-white/60">
                        User Login
                    </button>
                </p>
            </motion.div>
        </div>
    );
}
