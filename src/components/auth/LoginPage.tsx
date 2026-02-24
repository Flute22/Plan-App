import { useState, useCallback, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import Logo from '../Logo';

export default function LoginPage({ onNavigate }: { onNavigate: (page: string) => void }) {
    const { signIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const canSubmit = email.length > 0 && password.length > 0;

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        setError('');

        const { error: authError } = await signIn(email, password);

        if (authError) {
            setError(
                authError.message === 'Invalid login credentials'
                    ? 'Incorrect email or password. Please try again.'
                    : authError.message
            );
            setLoading(false);
        }
        // On success, auth state change handles redirect
    }, [canSubmit, email, password, signIn]);

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
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-white/40 text-sm">Sign in to continue your productivity journey</p>
                </div>

                {/* Error/Notice */}
                {(!isSupabaseConfigured() || error) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={!isSupabaseConfigured() ? "auth-info" : "auth-error"}
                    >
                        {!isSupabaseConfigured() ? (
                            <>
                                <Sparkles size={16} className="text-amber-400" />
                                <div className="text-left">
                                    <p className="font-bold text-[11px] uppercase tracking-wider text-amber-400">Offline Mode</p>
                                    <p className="text-[10px] text-white/50">Using local storage. Cloud sync disabled.</p>
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
                        </div>
                    </div>

                    {/* Password */}
                    <div className="auth-field">
                        <label className="auth-label">Password</label>
                        <div className="auth-input-wrap">
                            <Lock size={18} className="auth-input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="auth-input"
                                autoComplete="current-password"
                            />
                            <button type="button" onClick={() => setShowPassword(p => !p)} className="auth-toggle-pw">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me + Forgot Password */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div
                                className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${rememberMe
                                    ? 'bg-amber-500/80 border-amber-500/80'
                                    : 'border-white/20 bg-white/5 group-hover:border-white/30'
                                    }`}
                                onClick={() => setRememberMe(r => !r)}
                            >
                                {rememberMe && (
                                    <motion.svg
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        viewBox="0 0 12 12"
                                        className="w-2.5 h-2.5 text-white"
                                    >
                                        <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                    </motion.svg>
                                )}
                            </div>
                            <span className="text-white/40 text-sm select-none">Remember me</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => onNavigate('forgot-password')}
                            className="auth-link text-sm"
                        >
                            Forgot password?
                        </button>
                    </div>

                    {/* Submit */}
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
                                <LogIn size={18} />
                                Sign In
                                <ArrowRight size={16} />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Footer */}
                <p className="text-center text-white/30 text-sm mt-6">
                    Don't have an account?{' '}
                    <button onClick={() => onNavigate('signup')} className="auth-link">
                        Create one
                    </button>
                </p>
            </motion.div>
        </div>
    );
}
