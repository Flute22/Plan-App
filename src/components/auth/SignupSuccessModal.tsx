import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail } from 'lucide-react';

interface SignupSuccessModalProps {
    isOpen: boolean;
    email: string;
    onClose: () => void;
}

export default function SignupSuccessModal({ isOpen, email, onClose }: SignupSuccessModalProps) {
    // Auto-dismiss after 10 seconds
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    const openGmail = () => {
        window.open('https://mail.google.com', '_blank', 'noopener,noreferrer');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="auth-card relative z-10 max-w-md w-full overflow-hidden"
                    >
                        <div className="text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
                            >
                                <Mail size={36} className="text-emerald-400" />
                            </motion.div>

                            <h2 className="text-2xl font-display font-bold text-white mb-2">Verification Email Sent! 📧</h2>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                                <p className="text-white/70 text-sm leading-relaxed">
                                    We've sent a verification link to <span className="text-white font-semibold">{email}</span>.
                                    Please check your inbox and click the link to activate your account.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={openGmail}
                                    className="auth-submit flex items-center justify-center gap-2"
                                >
                                    Open Gmail
                                    <span className="opacity-70">→</span>
                                </button>

                                <button
                                    onClick={onClose}
                                    className="w-full py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                                >
                                    OK, Got it!
                                </button>
                            </div>
                        </div>

                        {/* Progress bar for auto-dismiss */}
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 10, ease: "linear" }}
                            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#f6c857] to-[#e8737a] opacity-50"
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
