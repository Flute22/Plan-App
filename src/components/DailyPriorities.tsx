import { useState, useRef, type KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import { Check, Lock, Unlock, Target, Circle } from 'lucide-react';
import { usePersistedState } from '../hooks/usePersistedState';
import { useAutoResize } from '../hooks/useAutoResize';

interface PriorityInputProps {
  index: number;
  priority: string;
  isLocked: boolean;
  completed: boolean;
  hasDigit: boolean;
  inputRef: (el: HTMLTextAreaElement | null) => void;
  onChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
}

function PriorityInput({ index, priority, isLocked, completed, hasDigit, inputRef, onChange, onKeyDown }: PriorityInputProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useAutoResize(ref, priority);

  return (
    <textarea
      ref={(el) => {
        ref.current = el;
        inputRef(el);
      }}
      rows={1}
      value={priority}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      disabled={isLocked}
      placeholder={index === 0 ? 'Most important task...' : index === 1 ? 'Second priority...' : 'Also get to...'}
      className={`w-full pl-14 pr-12 py-3.5 rounded-xl border transition-all outline-none text-sm resize-none overflow-hidden
        ${completed
          ? 'bg-white/3 border-white/5 text-white/25 line-through'
          : isLocked
            ? 'bg-white/5 border-white/5 text-white/60'
            : `bg-white/5 border-white/10 placeholder-white/15 focus:border-amber-500/30 focus:ring-2 focus:ring-amber-500/10 focus:bg-white/8 ${hasDigit ? 'text-amber-400' : 'text-white/80'}`
        }`}
    />
  );
}

export default function DailyPriorities() {
  const [priorities, setPriorities] = usePersistedState<string[]>('priorities', ['', '', '']);
  const [isLocked, setIsLocked] = usePersistedState<boolean>('priorities-locked', false);
  const [completed, setCompleted] = usePersistedState<boolean[]>('priorities-completed', [false, false, false]);

  const toggleComplete = (index: number) => {
    if (!priorities[index].trim()) return;
    const newCompleted = [...completed];
    newCompleted[index] = !newCompleted[index];
    setCompleted(newCompleted);
  };
  const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([null, null, null]);

  const handleChange = (index: number, value: string) => {
    if (isLocked) return;
    const newPriorities = [...priorities];
    newPriorities[index] = value;
    setPriorities(newPriorities);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextIndex = index + 1;
      if (nextIndex < 3) {
        inputRefs.current[nextIndex]?.focus();
      } else {
        // Blur the last input on Enter
        inputRefs.current[index]?.blur();
      }
    }
  };

  const hasDigit = (text: string) => /\d/.test(text);

  const checkGradients = [
    'from-amber-400 to-orange-500',
    'from-rose-400 to-pink-500',
    'from-teal-400 to-emerald-500',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      <div className="absolute -top-16 -left-16 w-40 h-40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
              <Target size={18} className="text-amber-400" />
            </div>
            <h2 className="font-heading text-lg font-bold text-white/90">Top 3 Priorities</h2>
          </div>
          <motion.button
            onClick={() => setIsLocked(!isLocked)}
            whileTap={{ scale: 0.9 }}
            className={`p-2.5 rounded-xl transition-all ${isLocked
              ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 glow-gold'
              : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50'}`}
          >
            {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
          </motion.button>
        </div>

        <div className="space-y-3">
          {priorities.map((priority, index) => (
            <div key={index} className="relative group">
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-lg font-semibold text-sm transition-all ${priority.trim()
                ? `bg-gradient-to-br ${checkGradients[index]} text-white shadow-lg`
                : 'border border-white/10 text-white/35'
                }`}>
                {index + 1}
              </div>
              <PriorityInput
                index={index}
                priority={priority}
                isLocked={isLocked}
                completed={completed[index]}
                hasDigit={hasDigit(priority)}
                inputRef={(el) => { inputRefs.current[index] = el; }}
                onChange={(value) => handleChange(index, value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
              />
              {priority.trim() && (
                <button
                  onClick={() => toggleComplete(index)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-all"
                >
                  {completed[index] ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.3 }}>
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${checkGradients[index]} flex items-center justify-center`}>
                        <Check size={12} className="text-white" />
                      </div>
                    </motion.div>
                  ) : (
                    <Circle size={20} className="text-white/15 hover:text-white/30 transition-colors" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
