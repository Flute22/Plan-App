import { motion } from 'motion/react';
import { Moon, Plus, Minus } from 'lucide-react';
import { usePersistedState } from '../hooks/usePersistedState';
import CircularProgress from './CircularProgress';
import { useCircleSize } from '../hooks/useCircleSize';

export default function SleepTracker() {
  const [hours, setHours] = usePersistedState<number>('sleep-hours', 7.5);
  const GOAL = 8;
  const addHour = () => setHours(Math.min(hours + 0.5, 12));
  const removeHour = () => setHours(Math.max(hours - 0.5, 0));

  const circleSize = useCircleSize();

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
      className="glass-card flex flex-col items-center relative overflow-visible">
      <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-2xl" />

      <div className="widget-card-inner relative z-10 w-full">
        <div className="widget-card-header">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
              <Moon size={18} className="text-violet-400" />
            </div>
            <h2 className="font-heading text-lg font-bold text-white/90">Sleep</h2>
          </div>
        </div>

        <div className="widget-circle-container">
          <CircularProgress
            size={circleSize}
            value={hours}
            max={GOAL}
            color="#9B59FF"
            trackColor="rgba(155,89,255,0.12)"
            label={String(hours)}
            sublabel="hours"
            strokeWidth={circleSize < 110 ? 6 : 8}
          />
        </div>

        <div className="widget-controls">
          <motion.button onClick={removeHour} whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-xl bg-white/5 text-violet-400/60 hover:bg-white/10 hover:text-violet-400 transition-all border border-white/5">
            <Minus size={16} />
          </motion.button>
          {/* Status text or icon could go here if needed, keeping it clean */}
          <motion.button onClick={addHour} whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg transition-all"
            style={{ boxShadow: '0 4px 15px rgba(139,92,246,0.3)' }}>
            <Plus size={16} />
          </motion.button>
        </div>

        <div className="widget-status">
          {hours < 7 && <p>Need more sleep 😴</p>}
          {hours >= 7 && hours < 9 && <p>Balanced sleep! ✨</p>}
          {hours >= 9 && <p>Deep rest! 🌙</p>}
        </div>
      </div>
    </motion.div>
  );
}
