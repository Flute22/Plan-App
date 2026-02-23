import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DATA = [65, 80, 45, 90, 70, 55, 85];

export default function ActivityChart() {
    const maxVal = Math.max(...DATA);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-card p-6 relative overflow-hidden">
            <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                            <TrendingUp size={18} className="text-amber-400" />
                        </div>
                        <div>
                            <h2 className="font-heading text-lg font-bold text-white/90">Weekly Activity</h2>
                            <p className="text-[11px] text-white/30 font-medium">Your productivity streak</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold gradient-text">{Math.round(DATA.reduce((a, b) => a + b, 0) / 7)}%</p>
                        <p className="text-[10px] text-white/30">avg score</p>
                    </div>
                </div>

                <div className="flex items-end justify-between gap-2 h-32">
                    {DATA.map((value, i) => {
                        const isToday = i === (new Date().getDay() + 6) % 7; // Monday = 0
                        return (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1">
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
                                </motion.div>
                                <span className={`text-[10px] font-medium ${isToday ? 'text-rose-400' : 'text-white/30'}`}>{DAYS[i]}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
