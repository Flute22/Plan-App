import { motion, AnimatePresence } from 'motion/react';
import { Target, Clock, ArrowRight, X, Calendar, CheckCircle2 } from 'lucide-react';

interface PriorityCheckInModalProps {
    isOpen: boolean;
    priorities: string[];
    onWorking: () => void;
    onSoon: () => void;
    onReschedule: (index: number) => void;
    onClose: () => void;
}

export default function PriorityCheckInModal({
    isOpen,
    priorities,
    onWorking,
    onSoon,
    onReschedule,
    onClose
}: PriorityCheckInModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="glass-card w-full max-w-md overflow-hidden relative"
                    >
                        {/* Background Accents */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />

                        <div className="p-6 relative z-10">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-display font-bold text-white/90">Priority Check-In</h2>
                                        <p className="text-xs text-white/30 font-medium">It's been 2 hours ⏰</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/20 hover:text-white/50 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <p className="text-white/60 text-sm mb-6 leading-relaxed">
                                How are your priorities going? You still have these items to tackle:
                            </p>

                            {/* Priority List */}
                            <div className="space-y-3 mb-8">
                                {priorities.map((priority, i) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/30">
                                                {i + 1}
                                            </div>
                                            <span className="text-sm text-white/80 truncate font-medium">{priority}</span>
                                        </div>
                                        <button
                                            onClick={() => onReschedule(i)}
                                            className="text-[10px] font-bold uppercase tracking-wider text-white/20 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-all ml-2"
                                            title="Reschedule to another time"
                                        >
                                            Reschedule
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onWorking}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={16} />
                                    Yes, I'm working on it
                                </motion.button>

                                <div className="grid grid-cols-2 gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onSoon}
                                        className="py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-xs hover:bg-white/8 hover:text-white/90 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Clock size={14} />
                                        I'll get to it soon
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onReschedule(0)}
                                        className="py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-xs hover:bg-white/8 hover:text-white/90 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Calendar size={14} />
                                        Reschedule all
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
