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
            const now = new Date();
            const todayString = now.toISOString().slice(0, 10);
            const activeDay = getGlobalDay();

            // If the actual calendar day has changed since our last check
            if (todayString !== activeDay) {
                console.log(`[DayManager] Day changed detected: ${activeDay} -> ${todayString}`);

                try {
                    // 1. Calculate and save score for the day that just ended
                    const { data: score, error } = await supabase.rpc('calculate_daily_score', {
                        target_date: activeDay
                    });

                    if (!error) {
                        console.log(`[DayManager] Saved score for ${activeDay}: ${score}%`);
                    } else {
                        console.error('[DayManager] Error saving daily score:', error);
                    }
                } catch (err) {
                    console.error('[DayManager] Unexpected error during reset:', err);
                }

                // 2. Update global day to today
                updateGlobalDay(todayString);
                setLastCheck(todayString);

                // 3. Show "Fresh Start" notification
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 8000);
            }
        };

        // Check every minute
        const interval = setInterval(checkDayChange, 60000);

        // Also check immediately on mount
        checkDayChange();

        return () => clearInterval(interval);
    }, []);

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
