import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Timer, ChevronDown, Brain, Coffee, Dumbbell, BookOpen } from 'lucide-react';
import { usePersistedState } from '../hooks/usePersistedState';

// Timer presets
const PRESETS = [
  { key: 'focus', label: 'Focus', icon: 'timer', work: 50 * 60, break: 10 * 60, workColor: 'from-orange-500 to-rose-500', breakColor: 'from-teal-500 to-emerald-500', accent: 'orange' },
  { key: 'meditation', label: 'Meditation', icon: 'brain', work: 15 * 60, break: 5 * 60, workColor: 'from-violet-500 to-purple-500', breakColor: 'from-teal-500 to-emerald-500', accent: 'violet' },
  { key: 'deepwork', label: 'Deep Work', icon: 'book', work: 90 * 60, break: 15 * 60, workColor: 'from-sky-500 to-blue-500', breakColor: 'from-teal-500 to-emerald-500', accent: 'sky' },
  { key: 'exercise', label: 'Exercise', icon: 'gym', work: 30 * 60, break: 5 * 60, workColor: 'from-rose-500 to-pink-500', breakColor: 'from-teal-500 to-emerald-500', accent: 'rose' },
  { key: 'shortbreak', label: 'Short Break', icon: 'coffee', work: 5 * 60, break: 0, workColor: 'from-amber-400 to-yellow-500', breakColor: 'from-teal-500 to-emerald-500', accent: 'amber' },
];

const ICONS: Record<string, React.ReactNode> = {
  timer: <Timer size={18} />,
  brain: <Brain size={18} />,
  book: <BookOpen size={18} />,
  gym: <Dumbbell size={18} />,
  coffee: <Coffee size={18} />,
};

interface Props {
  onFocusChange?: (isFocused: boolean) => void;
}

function playAlertSound() {
  try {
    const ctx = new AudioContext();
    const playBeep = (startTime: number, freq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    };
    const now = ctx.currentTime;
    playBeep(now, 880);
    playBeep(now + 0.25, 1100);
    playBeep(now + 0.5, 880);
    playBeep(now + 0.75, 1320);
    playBeep(now + 1.0, 880);
    setTimeout(() => ctx.close(), 2000);
  } catch { /* silent fallback */ }
}

export default function PomodoroTimer({ onFocusChange }: Props) {
  const [presetIndex, setPresetIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PRESETS[0].work);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [sessions, setSessions] = usePersistedState<number>('pomodoro-sessions', 0);
  const [showPresets, setShowPresets] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const presetRef = useRef<HTMLDivElement>(null);

  const preset = PRESETS[presetIndex];

  // Close preset dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (presetRef.current && !presetRef.current.contains(e.target as Node)) {
        setShowPresets(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    onFocusChange?.(isActive && mode === 'work');
  }, [isActive, mode, onFocusChange]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      playAlertSound();
      if (mode === 'work' && preset.break > 0) {
        setSessions(s => s + 1);
        setMode('break');
        setTimeLeft(preset.break);
      } else {
        setMode('work');
        setTimeLeft(preset.work);
        if (mode === 'work') setSessions(s => s + 1);
      }
      setIsActive(false);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft, mode, preset]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setMode('work'); setTimeLeft(preset.work); };

  const selectPreset = (index: number) => {
    if (isActive) return; // Don't switch while running
    setPresetIndex(index);
    setTimeLeft(PRESETS[index].work);
    setMode('work');
    setShowPresets(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60); const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const totalDuration = mode === 'work' ? preset.work : preset.break;
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
  const circumference = 2 * Math.PI * 80;
  const isWork = mode === 'work';

  const accentMap: Record<string, { text: string; bg20: string; glow: string; gradW: [string, string] }> = {
    orange: { text: 'text-orange-400', bg20: 'from-orange-500/20 to-amber-500/20', glow: 'rgba(251,146,60,0.4)', gradW: ['#fb923c', '#f43f5e'] },
    violet: { text: 'text-violet-400', bg20: 'from-violet-500/20 to-purple-500/20', glow: 'rgba(139,92,246,0.4)', gradW: ['#8b5cf6', '#a855f7'] },
    sky: { text: 'text-sky-400', bg20: 'from-sky-500/20 to-blue-500/20', glow: 'rgba(56,189,248,0.4)', gradW: ['#38bdf8', '#3b82f6'] },
    rose: { text: 'text-rose-400', bg20: 'from-rose-500/20 to-pink-500/20', glow: 'rgba(251,113,133,0.4)', gradW: ['#fb7185', '#ec4899'] },
    amber: { text: 'text-amber-400', bg20: 'from-amber-400/20 to-yellow-500/20', glow: 'rgba(251,191,36,0.4)', gradW: ['#fbbf24', '#eab308'] },
  };
  const a = accentMap[preset.accent];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      className="glass-card p-6 flex flex-col items-center relative overflow-hidden">
      <div className={`absolute -top-16 -left-16 w-40 h-40 rounded-full blur-3xl transition-colors duration-1000 ${isWork ? `bg-${preset.accent}-500/10` : 'bg-teal-500/10'}`} />

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Header with preset selector */}
        <div className="flex items-center gap-2 mb-5 self-start w-full" ref={presetRef}>
          <div className={`p-2 rounded-xl transition-colors duration-300 bg-gradient-to-br ${isWork ? a.bg20 : 'from-teal-500/20 to-emerald-500/20'}`}>
            <span className={isWork ? a.text : 'text-teal-400'}>{ICONS[preset.icon]}</span>
          </div>

          {/* Preset dropdown trigger */}
          <div className="relative flex-1">
            <button
              onClick={() => !isActive && setShowPresets(!showPresets)}
              className={`flex items-center gap-1.5 font-heading text-lg font-bold text-white/90 ${isActive ? 'cursor-default' : 'hover:text-white'}`}
            >
              {preset.label}
              {!isActive && <ChevronDown size={14} className={`text-white/30 transition-transform ${showPresets ? 'rotate-180' : ''}`} />}
            </button>

            <AnimatePresence>
              {showPresets && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 left-0 w-48 rounded-xl overflow-hidden z-30"
                  style={{ background: 'rgba(20,15,35,0.96)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
                >
                  {PRESETS.map((p, i) => (
                    <button key={p.key} onClick={() => selectPreset(i)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm transition-all hover:bg-white/8 ${i === presetIndex ? 'bg-white/5' : ''}`}>
                      <span className={`${accentMap[p.accent].text}`}>{ICONS[p.icon]}</span>
                      <span className="font-medium text-white/70">{p.label}</span>
                      <span className="ml-auto text-[10px] text-white/20">{Math.floor(p.work / 60)}m</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="text-[10px] text-white/20 font-medium">
            {mode === 'work' ? `${Math.floor(preset.work / 60)} min` : `${Math.floor(preset.break / 60)} min break`}
          </span>
        </div>

        {/* Timer ring */}
        <div className="relative w-44 h-44 flex items-center justify-center mb-6">
          {isActive && (
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.3, 0.15] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className={`absolute inset-[-12px] rounded-full border-2 ${isWork ? `border-${preset.accent}-500/30` : 'border-teal-500/30'}`}
              style={{ filter: 'blur(4px)' }}
            />
          )}
          {isActive && (
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.18, 0.08] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0.5 }}
              className={`absolute inset-[-24px] rounded-full border ${isWork ? `border-${preset.accent}-500/15` : 'border-teal-500/15'}`}
              style={{ filter: 'blur(8px)' }}
            />
          )}

          <svg className="w-full h-full transform -rotate-90">
            <circle cx="88" cy="88" r="80" fill="transparent" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
            <motion.circle cx="88" cy="88" r="80" fill="transparent"
              stroke={`url(#timerGrad${isWork ? 'W' : 'B'})`}
              strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference}
              animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
              transition={{ duration: 1, ease: "linear" }}
              style={{ filter: `drop-shadow(0 0 10px ${isWork ? a.glow : 'rgba(45,212,191,0.4)'})` }} />
            <defs>
              <linearGradient id="timerGradW" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={a.gradW[0]} />
                <stop offset="100%" stopColor={a.gradW[1]} />
              </linearGradient>
              <linearGradient id="timerGradB" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-bold text-white/90 font-mono tracking-wider">{formatTime(timeLeft)}</span>
            <span className={`text-xs font-bold uppercase tracking-[0.2em] mt-1.5 ${isWork ? a.text + '/60' : 'text-teal-400/60'}`}>
              {mode === 'break' ? 'break' : preset.label}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-5">
          <motion.button onClick={toggleTimer} whileTap={{ scale: 0.9 }}
            className={`p-4 rounded-2xl transition-all shadow-lg text-white ${isActive
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
              : `bg-gradient-to-r ${isWork ? preset.workColor : preset.breakColor}`
              }`}
            style={{ boxShadow: `0 4px 15px ${isWork ? a.glow.replace('0.4', '0.3') : 'rgba(45,212,191,0.3)'}` }}>
            {isActive ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
          </motion.button>
          <motion.button onClick={resetTimer} whileTap={{ scale: 0.9 }}
            className="p-4 rounded-2xl bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50 transition-all border border-white/5">
            <RotateCcw size={22} />
          </motion.button>
        </div>

        {/* Sessions */}
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <motion.div key={i} animate={{ scale: i < sessions ? [1, 1.3, 1] : 1 }}
              className={`w-3 h-3 rounded-full transition-all ${i < sessions ? `bg-gradient-to-br ${preset.workColor} shadow-sm` : 'bg-white/8 border border-white/10'}`}
              style={i < sessions ? { boxShadow: `0 0 8px ${a.glow.replace('0.4', '0.3')}` } : {}} />
          ))}
        </div>
        <p className="text-[10px] text-white/20 mt-2 font-medium">Sessions completed</p>
      </div>
    </motion.div>
  );
}
