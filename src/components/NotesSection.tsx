import { useRef } from 'react';
import { motion } from 'motion/react';
import { StickyNote } from 'lucide-react';
import { usePersistedState } from '../hooks/usePersistedState';
import { useAutoResize } from '../hooks/useAutoResize';

interface NotesInputProps {
  value: string;
  onChange: (val: string) => void;
}

function NotesInput({ value, onChange }: NotesInputProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useAutoResize(ref, value);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Ideas, dreams, random thoughts..."
      className="w-full bg-transparent border-none resize-none outline-none text-white/60 placeholder-white/15 text-sm leading-relaxed custom-scrollbar min-h-[120px] overflow-hidden"
      spellCheck={false}
    />
  );
}

export default function NotesSection() {
  const [note, setNote] = usePersistedState<string>('brain-dump', '', { perDay: false });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-6 flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(245,158,11,0.04) 100%)',
      }}
    >
      <div className="absolute -right-8 -top-8 w-28 h-28 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <StickyNote size={18} className="text-amber-400" />
          </div>
          <h2 className="font-heading text-lg font-bold text-white/90">Brain Dump</h2>
        </div>

        <NotesInput
          value={note}
          onChange={setNote}
        />

        <div className="text-[10px] text-white/15 text-right mt-2 font-medium">
          Auto-saving...
        </div>
      </div>
    </motion.div>
  );
}
