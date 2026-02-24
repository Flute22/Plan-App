import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, X } from 'lucide-react';

interface StartNewDayModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function StartNewDayModal({ isOpen, onClose, onConfirm }: StartNewDayModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md glass-card !bg-neutral-900/80 border-white/10 p-8 shadow-2xl overflow-hidden"
                    >
                        {/* Decorative Background Icon */}
                        <div className="absolute top-[-20px] right-[-20px] opacity-[0.03] rotate-12 pointer-events-none">
                            <BookOpen size={180} className="text-white" />
                        </div>

                        <div className="flex flex-col items-center text-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <BookOpen className="text-white" size={32} />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white font-display">Ready to Start Fresh? 📖</h3>
                                <p className="text-white/50 text-base leading-relaxed">
                                    This will archive today's progress and give you a clean new page for your journey.
                                </p>
                            </div>

                            <div className="flex w-full gap-3 mt-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3.5 rounded-xl border border-white/10 text-white/60 font-semibold hover:bg-white/5 hover:text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Flip the Page
                                </button>
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-white/30 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
