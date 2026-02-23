import { motion } from 'motion/react';
import { Heart, Sparkle } from 'lucide-react';
import { usePersistedState } from '../hooks/usePersistedState';

export default function GratitudeJournal() {
    const [entries, setEntries] = usePersistedState<string[]>('gratitude', ['', '', '']);
    const handleChange = (index: number, value: string) => {
        const newEntries = [...entries];
        newEntries[index] = value;
        setEntries(newEntries);
    };

    const colors = [
        { gradient: 'from-amber-400 to-orange-500', border: 'border-amber-500/20', ring: 'focus:ring-amber-500/20' },
        { gradient: 'from-rose-400 to-pink-500', border: 'border-rose-500/20', ring: 'focus:ring-rose-500/20' },
        { gradient: 'from-teal-400 to-emerald-500', border: 'border-teal-500/20', ring: 'focus:ring-teal-500/20' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="glass-card p-6 relative overflow-hidden">
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-br from-teal-500/12 to-emerald-500/12 rounded-full blur-2xl" />
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20">
                        <Sparkle size={18} className="text-teal-400" />
                    </div>
                    <h2 className="font-heading text-lg font-bold text-white/90">Grateful For</h2>
                </div>
                <div className="space-y-3">
                    {entries.map((entry, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colors[index].gradient} flex items-center justify-center flex-shrink-0`}>
                                <Heart size={12} className="text-white" fill="white" />
                            </div>
                            <input type="text" value={entry} onChange={(e) => handleChange(index, e.target.value)}
                                placeholder={index === 0 ? 'Something that made me smile...' : index === 1 ? 'Someone I appreciate...' : 'A moment I treasure...'}
                                className={`w-full bg-white/5 border ${colors[index].border} rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 outline-none focus:ring-2 ${colors[index].ring} transition-all`} />
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
