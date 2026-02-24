import { motion } from 'motion/react';
import { Moon, Minus, Plus, BedDouble } from 'lucide-react';
import { usePersistedState } from '../hooks/usePersistedState';

export default function SleepTracker() {
  const [hours, setHours] = usePersistedState<number>('sleep-hours', 7);
  const GOAL = 8;
  const addHour = () => setHours(Math.min(hours + 0.5, 12));
  const removeHour = () => setHours(Math.max(hours - 0.5, 0));
  const percentage = Math.min((hours / GOAL) * 100, 100);
  const circumference = 2 * Math.PI * 48;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
      className="glass-card p-6 flex flex-col items-center relative overflow-hidden">
      <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-gradient-to-br from-violet-500/12 to-purple-500/12 rounded-full blur-2xl" />
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="flex items-center gap-2 mb-5 self-start">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
            <Moon size={18} className="text-violet-400" />
          </div>
          <h2 className="font-heading text-lg font-bold text-white/90">Sleep</h2>
        </div>

        <div className="relative w-28 h-28 mb-5 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="56" cy="56" r="48" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <motion.circle cx="56" cy="56" r="48" fill="transparent"
              stroke="url(#sleepGrad)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: circumference * (1 - percentage / 100) }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.4))' }} />
            <defs>
              <linearGradient id="sleepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#e879f9" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-bold text-white/90">{hours}</span>
            <span className="text-[9px] text-white/25 font-medium">hours</span>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <motion.button onClick={removeHour} whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-xl bg-white/5 text-violet-400/60 hover:bg-white/10 hover:text-violet-400 transition-all border border-white/5">
            <Minus size={16} />
          </motion.button>
          <div className="text-violet-400/30"><BedDouble size={20} /></div>
          <motion.button onClick={addHour} whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg transition-all"
            style={{ boxShadow: '0 4px 15px rgba(139,92,246,0.3)' }}>
            <Plus size={16} />
          </motion.button>
        </div>
        <div className="mt-3 text-center h-5">
          {hours >= 7 && hours <= 9 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-violet-400 font-bold">Perfect rest! 🌙</motion.p>}
          {hours < 7 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-violet-400/50 font-medium">Need more sleep 😴</motion.p>}
          {hours > 9 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-violet-400/50 font-medium">Hibernation mode! 🐻</motion.p>}
        </div>
      </div>
    </motion.div>
  );
}
