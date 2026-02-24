import { useState, useCallback, useMemo, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Mail, Lock, Eye, EyeOff, User, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import Logo from '../Logo';
import SignupSuccessModal from './SignupSuccessModal';

// ─── Password strength ──────────────────────────────────────────────────────

type Strength = 'weak' | 'medium' | 'strong';

function getPasswordStrength(password: string): { level: Strength; score: number; label: string } {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 'weak', score: 33, label: 'Weak' };
    if (score <= 4) return { level: 'medium', score: 66, label: 'Medium' };
    return { level: 'strong', score: 100, label: 'Strong' };
}

const STRENGTH_COLORS: Record<Strength, string> = {
    weak: 'bg-red-500',
    medium: 'bg-amber-500',
    strong: 'bg-emerald-500',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SignUpPage({ onNavigate }: { onNavigate: (page: string) => void }) {
    const { signUp } = useAuth();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Real-time validation
    const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
    const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const canSubmit = fullName.trim().length > 0 && emailValid && password.length >= 8 && passwordsMatch;

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        setError('');

        const { error: authError } = await signUp(email, password, fullName.trim());

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else if (isSupabaseConfigured()) {
            setLoading(false);
            setShowSuccessModal(true);
        } else {
            // Offline mode: just proceed
            setSuccess(true);
        }
    }, [canSubmit, email, password, fullName, signUp]);

    // ── Pre-redirect Success screen (Offline Mode Only) ───────────────────
    if (success && !isSupabaseConfigured()) {
        return (
            <div className="auth-page">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="auth-card text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
                    >
                        <Sparkles size={36} className="text-emerald-400" />
                    </motion.div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">Welcome aboard! 🎉</h2>
                    <p className="text-white/50 text-sm">Your account has been created. Redirecting to your dashboard...</p>
                </motion.div>
            </div>
        );
    }

    // ── Form ───────────────────────────────────────────────────────────────
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
                    <div className="auth-logo flex justify-center mb-5">
                        <Logo variant="icon" size={48} />
                    </div>
                    <h1 className="auth-heading text-3xl font-display font-bold text-white mb-2">Create Account</h1>
                    <p className="text-white/40 text-sm">Start your productivity journey with flow-Day</p>
                </div>

                {/* Error/Notice */}
                {(!isSupabaseConfigured() || error) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`auth-error-banner ${!isSupabaseConfigured() ? "auth-info" : "auth-error"}`}
                    >
                        {!isSupabaseConfigured() ? (
                            <>
                                <Info size={16} className="text-sky-400" />
                                <div className="text-left">
                                    <p className="font-bold text-[11px] uppercase tracking-wider text-sky-400">Offline Mode</p>
                                    <p className="text-[10px] text-white/50">Your account will be stored locally on this device.</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </>
                        )}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div className="auth-field">
                        <label className="auth-label">Full Name</label>
                        <div className="auth-input-wrap">
                            <User size={18} className="auth-input-icon" />
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                className="auth-input"
                                autoComplete="name"
                            />
                            {fullName.trim().length > 0 && (
                                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="auth-field">
                        <label className="auth-label">Email Address</label>
                        <div className="auth-input-wrap">
                            <Mail size={18} className="auth-input-icon" />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="auth-input"
                                autoComplete="email"
                            />
                            {email.length > 0 && (
                                emailValid
                                    ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                                    : <AlertCircle size={16} className="text-red-400 shrink-0" />
                            )}
                        </div>
                        {email.length > 0 && !emailValid && (
                            <p className="text-red-400 text-xs mt-1 ml-1">Please enter a valid email address</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="auth-field">
                        <label className="auth-label">Password</label>
                        <div className="auth-input-wrap">
                            <Lock size={18} className="auth-input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Min. 8 characters"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="auth-input"
                                autoComplete="new-password"
                            />
                            <button type="button" onClick={() => setShowPassword(p => !p)} className="auth-toggle-pw">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {/* Strength indicator */}
                        {password.length > 0 && (
                            <div className="mt-2">
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${passwordStrength.score}%` }}
                                        className={`h-full rounded-full ${STRENGTH_COLORS[passwordStrength.level]}`}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                                <p className={`text-xs mt-1 ml-1 ${passwordStrength.level === 'weak' ? 'text-red-400' :
                                    passwordStrength.level === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                                    }`}>
                                    {passwordStrength.label} password
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="auth-field">
                        <label className="auth-label">Confirm Password</label>
                        <div className="auth-input-wrap">
                            <Lock size={18} className="auth-input-icon" />
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                placeholder="Repeat your password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="auth-input"
                                autoComplete="new-password"
                            />
                            <button type="button" onClick={() => setShowConfirm(p => !p)} className="auth-toggle-pw">
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            {confirmPassword.length > 0 && (
                                passwordsMatch
                                    ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                                    : <AlertCircle size={16} className="text-red-400 shrink-0" />
                            )}
                        </div>
                        {confirmPassword.length > 0 && !passwordsMatch && (
                            <p className="text-red-400 text-xs mt-1 ml-1">Passwords do not match</p>
                        )}
                    </div>

                    {/* Submit */}
                    <motion.button
                        whileHover={{ scale: canSubmit ? 1.02 : 1 }}
                        whileTap={{ scale: canSubmit ? 0.98 : 1 }}
                        type="submit"
                        disabled={!canSubmit || loading}
                        className="auth-submit auth-submit-btn"
                    >
                        {loading ? (
                            <div className="auth-spinner" />
                        ) : (
                            <>
                                <UserPlus size={18} />
                                Create Account
                                <ArrowRight size={16} />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Footer */}
                <Footer
                    onNavigate={onNavigate}
                    showSuccessModal={showSuccessModal}
                    email={email}
                />
            </motion.div>
        </div>
    );
}

const Footer = ({ onNavigate, showSuccessModal, email }: { onNavigate: (page: string) => void, showSuccessModal: boolean, email: string }) => {
    return (
        <>
            <p className="text-center text-white/30 text-sm mt-6">
                Already have an account?{' '}
                <button onClick={() => onNavigate('login')} className="auth-link">
                    Sign In
                </button>
            </p>
            <SignupSuccessModal
                isOpen={showSuccessModal}
                email={email}
                onClose={() => {
                    // Redirect or stay as per user's preference after "OK"
                    // But user said "Do NOT redirect or clear the form until user clicks OK"
                    // So we just close it for now.
                    window.location.reload(); // Simple way to clear/reset after confirmation
                }}
            />
        </>
    );
}
