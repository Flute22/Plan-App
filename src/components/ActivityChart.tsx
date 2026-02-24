import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ActivityChart() {
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<number[]>(new Array(7).fill(20)); // Fallback/skeleton values

    useEffect(() => {
        const fetchHistory = async () => {
            if (!supabase) {
                setLoading(false);
                return;
            }
            try {
                // Fetch last 7 entries for this user
                const { data, error } = await supabase
                    .from('activity_history')
                    .select('day, score')
                    .order('day', { ascending: false })
                    .limit(7);

                if (!error && data) {
                    // Map history to the correct days (last 7 days logic)
                    const scores = new Array(7).fill(0);
                    const today = new Date();

                    // Supabase returns descending, so we map backwards from today
                    for (let i = 0; i < 7; i++) {
                        const targetDate = new Date();
                        targetDate.setDate(today.getDate() - i);
                        const dateStr = targetDate.toISOString().slice(0, 10);

                        const entry = data.find(d => d.day === dateStr);
                        // index 0=Mon, 6=Sun. Mapping dateStr to Mon-Sun
                        const dayIdx = (targetDate.getDay() + 6) % 7;
                        scores[dayIdx] = entry ? entry.score : 15; // 15 is a "barely active" baseline for display
                    }
                    setHistory(scores);
                }
            } catch (err) {
                console.error('Error fetching activity history:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const maxVal = Math.max(...history, 100);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-card p-6 relative overflow-hidden group">
            <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                            {loading ? <Loader2 size={18} className="text-amber-400 animate-spin" /> : <TrendingUp size={18} className="text-amber-400" />}
                        </div>
                        <div>
                            <h2 className="font-heading text-lg font-bold text-white/90">Weekly Activity</h2>
                            <p className="text-[11px] text-white/30 font-medium">Your productivity streak</p>
                        </div>
                    </div>
                    {!loading && (
                        <div className="text-right">
                            <p className="text-2xl font-bold gradient-text">
                                {Math.round(history.reduce((a, b) => a + b, 0) / history.filter(v => v > 0).length || 0)}%
                            </p>
                            <p className="text-[10px] text-white/30">avg score</p>
                        </div>
                    )}
                </div>

                <div className="flex items-end justify-between gap-2 h-32">
                    {history.map((value, i) => {
                        const isToday = i === (new Date().getDay() + 6) % 7;
                        return (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full">
                                <div className="flex-1 w-full flex items-end">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(value / maxVal) * 100}%` }}
                                        transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                                        className="w-full rounded-xl relative overflow-hidden min-h-[8px]"
                                        style={{
                                            background: `linear-gradient(180deg, 
                                                ${isToday ? 'rgba(251,113,133,0.85)' : 'rgba(251,191,36,0.6)'} 0%, 
                                                ${isToday ? 'rgba(251,146,60,0.85)' : 'rgba(245,158,11,0.35)'} 100%)`
                                        }}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent" />

                                        {/* Value tooltip on hover */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <span className="text-[8px] font-bold text-white">{value}%</span>
                                        </div>
                                    </motion.div>
                                </div>
                                <span className={`text-[10px] font-medium ${isToday ? 'text-rose-400' : 'text-white/30'}`}>{DAYS_SHORT[i]}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
