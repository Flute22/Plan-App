import { useState, useCallback, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../Logo';

export default function ForgotPasswordPage({ onNavigate }: { onNavigate: (page: string) => void }) {
    const { resetPassword } = useAuth();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError('');

        const { error: authError } = await resetPassword(email);

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            setSent(true);
            setLoading(false);
        }
    }, [email, resetPassword]);

    return (
        <div className="auth-page">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="auth-card"
            >
                {/* Back button */}
                <button onClick={() => onNavigate('login')} className="auth-back">
                    <ArrowLeft size={16} />
                    Back to Login
                </button>

                {/* Header */}
                <div className="text-center mb-8 mt-4">
                    <div className="flex justify-center mb-5">
                        <Logo variant="icon" size={48} />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Reset Password</h1>
                    <p className="text-white/40 text-sm">
                        Enter your email and we'll send you a link to reset your password
                    </p>
                </div>

                {sent ? (
                    /* Success state */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4"
                    >
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} className="text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Check your email</h3>
                        <p className="text-white/40 text-sm mb-6">
                            We've sent a password reset link to<br />
                            <span className="text-white/60 font-medium">{email}</span>
                        </p>
                        <button onClick={() => onNavigate('login')} className="auth-link text-sm">
                            Return to Login
                        </button>
                    </motion.div>
                ) : (
                    <>
                        {/* Error */}
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
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: email ? 1.02 : 1 }}
                                whileTap={{ scale: email ? 0.98 : 1 }}
                                type="submit"
                                disabled={!email || loading}
                                className="auth-submit"
                            >
                                {loading ? (
                                    <div className="auth-spinner" />
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Send Reset Link
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
}
