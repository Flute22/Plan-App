import { useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Quote } from 'lucide-react';

const AFFIRMATIONS = [
  "I am capable of achieving great things.",
  "Today is full of possibilities.",
  "I choose to be happy and love myself today.",
  "My potential is limitless.",
  "I am in charge of how I feel and today I am choosing happiness.",
  "I am growing and learning every day.",
  "I believe in myself and my abilities.",
  "I radiate positivity and good vibes.",
  "I am enough, just as I am.",
  "Challenges are opportunities to grow."
];

export default function DailyAffirmation() {
  const [index, setIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const refreshAffirmation = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 500);
    setIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden rounded-3xl p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(251,146,60,0.12) 0%, rgba(251,113,133,0.12) 50%, rgba(245,158,11,0.08) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
      }}>
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-rose-500/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-3 right-4 opacity-[0.06]"><Quote size={100} className="text-white" /></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 font-heading">✨ Daily Affirmation</h2>
          <motion.button onClick={refreshAffirmation} whileTap={{ scale: 0.9 }}
            className="text-white/25 hover:text-white/50 transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <RefreshCw size={16} className={isSpinning ? 'animate-spin' : ''} />
          </motion.button>
        </div>
        <div className="min-h-[70px] flex items-center justify-center text-center px-2">
          <motion.p key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-lg font-display font-medium italic leading-relaxed gradient-text-cool">
            "{AFFIRMATIONS[index]}"
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
