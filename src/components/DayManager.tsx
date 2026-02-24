import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateGlobalDay, getGlobalDay } from '../hooks/usePersistedState';
import { supabase } from '../lib/supabase';

export default function DayManager() {
    const [showNotification, setShowNotification] = useState(false);
    const [lastCheck, setLastCheck] = useState(new Date().toISOString().slice(0, 10));

    useEffect(() => {
        const checkDayChange = async () => {
            const todayString = new Date().toISOString().slice(0, 10);
            const activeDay = getGlobalDay();

            // Notify if a NEW calendar day has started, but don't auto-reset anymore
            if (todayString !== activeDay && !showNotification) {
                setShowNotification(true);
                // Notification will show "Fresh Start" message or we can customize it
            }
        };

        // We still check occasionally to show the notification, but no auto-reset
        const interval = setInterval(checkDayChange, 60000);
        checkDayChange();

        return () => clearInterval(interval);
    }, [showNotification]);

    return (
        <AnimatePresence>
            {showNotification && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                >
                    <div className="glass-card !bg-amber-500/10 border-amber-500/20 px-6 py-4 flex items-center gap-4 shadow-2xl backdrop-blur-xl">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Fresh Start! 🌅</h3>
                            <p className="text-white/60 text-sm">A new day has begun. Your dashboard is ready for greatness.</p>
                        </div>
                    </div>

                    {/* Decorative sparkles */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 45, 0],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -top-2 -right-2 text-amber-300"
                    >
                        <Sparkles size={16} />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
