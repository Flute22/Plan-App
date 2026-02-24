import { motion } from 'motion/react';
import { Droplets, Plus, Minus } from 'lucide-react';
import { usePersistedState } from '../hooks/usePersistedState';
import CircularProgress from './CircularProgress';
import { useCircleSize } from '../hooks/useCircleSize';

export default function WaterTracker() {
  const [glasses, setGlasses] = usePersistedState<number>('water-glasses', 0);
  const GOAL = 8;
  const addGlass = () => setGlasses(Math.min(glasses + 1, GOAL));
  const removeGlass = () => setGlasses(Math.max(glasses - 1, 0));

  const circleSize = useCircleSize();

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
      className="glass-card flex flex-col items-center relative overflow-visible">
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-sky-400/15 to-teal-400/15 rounded-full blur-2xl" />

      <div className="widget-card-inner relative z-10 w-full">
        <div className="widget-card-header">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-sky-400/20 to-teal-400/20">
              <Droplets size={18} className="text-sky-400" />
            </div>
            <h2 className="font-heading text-lg font-bold text-white/90">Hydration</h2>
          </div>
        </div>

        <div className="widget-circle-container">
          <CircularProgress
            size={circleSize}
            value={glasses}
            max={GOAL}
            color="#00D4FF"
            trackColor="rgba(0,212,255,0.10)"
            label={String(glasses)}
            sublabel={`of ${GOAL} glasses`}
            strokeWidth={circleSize < 110 ? 6 : 8}
          />
        </div>

        <div className="widget-controls">
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

        <div className="widget-status">
          {glasses < GOAL && <p>Keep drinking! 💧</p>}
          {glasses >= GOAL && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-teal-400 font-bold">Goal reached! 🎉</motion.p>}
        </div>
      </div>
    </motion.div>
  );
}
