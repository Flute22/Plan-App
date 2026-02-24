import { useState, useCallback, useMemo, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../Logo';

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

export default function ResetPasswordPage({ onNavigate }: { onNavigate: (page: string) => void }) {
    const { updatePassword } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
    const canSubmit = password.length >= 8 && passwordsMatch;

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        setError('');

        const { error: authError } = await updatePassword(password);

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setTimeout(() => onNavigate('dashboard'), 2000);
        }
    }, [canSubmit, password, updatePassword, onNavigate]);

    if (success) {
        return (
            <div className="auth-page">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="auth-card text-center"
                >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={36} className="text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">Password Updated!</h2>
                    <p className="text-white/50 text-sm">Redirecting to your dashboard...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="auth-card"
            >
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-5">
                        <Logo variant="icon" size={48} />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">New Password</h1>
                    <p className="text-white/40 text-sm">Choose a strong password for your account</p>
                </div>

                {error && (
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
                    {/* New Password */}
                    <div className="auth-field">
                        <label className="auth-label">New Password</label>
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
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Repeat your password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="auth-input"
                                autoComplete="new-password"
                            />
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

                    <motion.button
                        whileHover={{ scale: canSubmit ? 1.02 : 1 }}
                        whileTap={{ scale: canSubmit ? 0.98 : 1 }}
                        type="submit"
                        disabled={!canSubmit || loading}
                        className="auth-submit"
                    >
                        {loading ? (
                            <div className="auth-spinner" />
                        ) : (
                            <>
                                <Lock size={18} />
                                Update Password
                                <ArrowRight size={16} />
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
