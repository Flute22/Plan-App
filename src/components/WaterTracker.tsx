import { motion } from 'motion/react';
import { Droplets, Plus, Minus } from 'lucide-react';
import { usePersistedState } from '../hooks/usePersistedState';

export default function WaterTracker() {
  const [glasses, setGlasses] = usePersistedState<number>('water-glasses', 0);
  const GOAL = 8;
  const addGlass = () => setGlasses(Math.min(glasses + 1, GOAL));
  const removeGlass = () => setGlasses(Math.max(glasses - 1, 0));
  const percentage = (glasses / GOAL) * 100;
  const circumference = 2 * Math.PI * 52;

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
      className="glass-card p-6 flex flex-col items-center relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-sky-400/15 to-teal-400/15 rounded-full blur-2xl" />

      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="flex items-center gap-2 mb-5 self-start">
          <div className="p-2 rounded-xl bg-gradient-to-br from-sky-400/20 to-teal-400/20">
            <Droplets size={18} className="text-sky-400" />
          </div>
          <h2 className="font-heading text-lg font-bold text-white/90">Hydration</h2>
        </div>

        <div className="relative w-36 h-36 flex items-center justify-center mb-5">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="72" cy="72" r="52" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            <motion.circle cx="72" cy="72" r="52" fill="transparent"
              stroke="url(#waterGrad)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - percentage / 100) }}
              transition={{ type: "spring", stiffness: 40, damping: 15 }}
              style={{ filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.4))' }} />
            <defs>
              <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#2dd4bf" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-bold text-white/90">{glasses}</span>
            <span className="text-[10px] text-white/25 font-medium">of {GOAL} glasses</span>
          </div>
        </div>

        <div className="flex gap-4">
          <motion.button onClick={removeGlass} whileTap={{ scale: 0.9 }}
            className="p-3 rounded-xl bg-white/5 text-sky-400/60 hover:bg-white/10 hover:text-sky-400 transition-all border border-white/5">
            <Minus size={18} />
          </motion.button>
          <motion.button onClick={addGlass} whileTap={{ scale: 0.9 }}
            className="p-3 rounded-xl bg-gradient-to-r from-sky-400 to-teal-400 text-white shadow-lg transition-all"
            style={{ boxShadow: '0 4px 15px rgba(56,189,248,0.3)' }}>
            <Plus size={18} />
          </motion.button>
        </div>
        <div className="h-5 mt-3">
          {glasses < GOAL && <p className="text-[11px] text-sky-400/40 font-medium">Keep drinking! 💧</p>}
          {glasses >= GOAL && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[11px] text-teal-400 font-bold">Goal reached! 🎉</motion.p>}
        </div>
      </div>
    </motion.div>
  );
}
