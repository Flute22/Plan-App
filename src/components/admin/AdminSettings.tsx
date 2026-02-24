import { useState, useCallback, useMemo, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Settings, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, User, Mail, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// ─── Password strength (reused logic) ────────────────────────────────────────

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

// ─── Settings ────────────────────────────────────────────────────────────────

export default function AdminSettings() {
    const { user, updatePassword } = useAuth();

    const adminName = user?.user_metadata?.full_name || 'Admin';
    const adminEmail = user?.email || '';

    // Password change
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState(false);

    const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
    const canSubmitPw = newPassword.length >= 8 && passwordsMatch;

    const handlePasswordChange = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!canSubmitPw) return;

        setPwLoading(true);
        setPwError('');
        setPwSuccess(false);

        const { error } = await updatePassword(newPassword);

        if (error) {
            setPwError(error.message);
        } else {
            setPwSuccess(true);
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPwSuccess(false), 3000);
        }
        setPwLoading(false);
    }, [canSubmitPw, newPassword, updatePassword]);

    return (
        <div>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex items-center gap-2">
                    <Settings size={22} className="text-amber-400" />
                    <h1 className="text-3xl font-display font-bold text-white">Settings</h1>
                </div>
                <p className="text-white/30 text-sm mt-1">Manage your admin account</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Info */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="admin-panel p-6"
                >
                    <h3 className="text-sm font-semibold text-white/70 mb-5 flex items-center gap-2">
                        <User size={16} className="text-amber-400" />
                        Admin Profile
                    </h3>

                    <div className="space-y-4">
                        {/* Avatar */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                                <span className="text-2xl font-bold text-amber-300">{adminName.charAt(0)}</span>
                            </div>
                            <div>
                                <p className="text-white/80 font-semibold">{adminName}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Shield size={12} className="text-amber-400" />
                                    <span className="text-amber-400/70 text-xs font-bold uppercase tracking-wider">Administrator</span>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="pt-4 border-t border-white/5 space-y-3">
                            <div className="flex items-center gap-3">
                                <User size={15} className="text-white/20" />
                                <div>
                                    <p className="text-white/30 text-xs">Full Name</p>
                                    <p className="text-white/70 text-sm font-medium">{adminName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail size={15} className="text-white/20" />
                                <div>
                                    <p className="text-white/30 text-xs">Email</p>
                                    <p className="text-white/70 text-sm font-medium">{adminEmail}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Shield size={15} className="text-white/20" />
                                <div>
                                    <p className="text-white/30 text-xs">Role</p>
                                    <p className="text-amber-400 text-sm font-medium">Admin</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Change Password */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="admin-panel p-6"
                >
                    <h3 className="text-sm font-semibold text-white/70 mb-5 flex items-center gap-2">
                        <Lock size={16} className="text-amber-400" />
                        Change Password
                    </h3>

                    {/* Success */}
                    {pwSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-4"
                        >
                            <CheckCircle2 size={16} />
                            <span>Password updated successfully!</span>
                        </motion.div>
                    )}

                    {pwError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="auth-error mb-4"
                        >
                            <AlertCircle size={16} />
                            <span>{pwError}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        {/* New Password */}
                        <div className="auth-field">
                            <label className="auth-label">New Password</label>
                            <div className="auth-input-wrap">
                                <Lock size={18} className="auth-input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Min. 8 characters"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="auth-input"
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowPassword(p => !p)} className="auth-toggle-pw">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {newPassword.length > 0 && (
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
                                    placeholder="Repeat password"
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
                            whileHover={{ scale: canSubmitPw ? 1.02 : 1 }}
                            whileTap={{ scale: canSubmitPw ? 0.98 : 1 }}
                            type="submit"
                            disabled={!canSubmitPw || pwLoading}
                            className="auth-submit !bg-gradient-to-r !from-amber-500 !to-orange-600"
                        >
                            {pwLoading ? (
                                <div className="auth-spinner" />
                            ) : (
                                <>
                                    <Lock size={16} />
                                    Update Password
                                </>
                            )}
                        </motion.button>
                    </form>
                </motion.div>
            </div>

            {/* Session Info */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="admin-panel p-6 mt-6"
            >
                <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                    <Shield size={16} className="text-amber-400" />
                    Session Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <p className="text-white/30 text-xs">User ID</p>
                        <p className="text-white/50 text-xs font-mono mt-1 truncate">{user?.id}</p>
                    </div>
                    <div>
                        <p className="text-white/30 text-xs">Created At</p>
                        <p className="text-white/50 text-sm mt-1">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</p>
                    </div>
                    <div>
                        <p className="text-white/30 text-xs">Last Sign In</p>
                        <p className="text-white/50 text-sm mt-1">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '—'}</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
