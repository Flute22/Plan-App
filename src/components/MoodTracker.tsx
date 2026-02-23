import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles } from 'lucide-react';

const MOODS = [
  { emoji: '😢', label: 'Awful', color: 'from-sky-400 to-blue-500', glow: 'rgba(56,189,248,0.4)' },
  { emoji: '😕', label: 'Meh', color: 'from-teal-400 to-emerald-500', glow: 'rgba(45,212,191,0.4)' },
  { emoji: '😐', label: 'Okay', color: 'from-amber-400 to-yellow-500', glow: 'rgba(251,191,36,0.4)' },
  { emoji: '😊', label: 'Good', color: 'from-orange-400 to-amber-500', glow: 'rgba(251,146,60,0.4)' },
  { emoji: '😄', label: 'Amazing', color: 'from-rose-400 to-pink-500', glow: 'rgba(251,113,133,0.4)' },
];

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [weekMoods] = useState([3, 4, 2, 4, null, null, null]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="glass-card p-6 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-rose-500/15 to-orange-500/15 rounded-full blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20">
            <Heart size={18} className="text-rose-400" />
          </div>
          <h2 className="font-heading text-lg font-bold text-white/90">How are you feeling?</h2>
        </div>

        <div className="flex justify-between gap-2 mb-6">
          {MOODS.map((mood, i) => (
            <motion.button key={i} onClick={() => setSelectedMood(i)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1.5 group">
              <motion.div animate={{
                scale: selectedMood === i ? 1.2 : 1,
                boxShadow: selectedMood === i ? `0 0 25px ${mood.glow}` : '0 0 0px transparent',
              }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${selectedMood === i ? `bg-gradient-to-br ${mood.color}` : 'bg-white/5 hover:bg-white/10'}`}>
                {mood.emoji}
              </motion.div>
              <span className={`text-[10px] font-medium transition-colors ${selectedMood === i ? 'text-white' : 'text-white/30'}`}>{mood.label}</span>
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Sparkles size={12} className="text-white/20 mr-1" />
          <div className="flex gap-2.5 flex-1">
            {DAYS.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full transition-all ${weekMoods[i] !== null ? `bg-gradient-to-br ${MOODS[weekMoods[i]!].color} shadow-sm` : 'bg-white/10 border border-white/10'}`} />
                <span className="text-[9px] text-white/25 font-medium">{day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
