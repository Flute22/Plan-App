import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar, Sun, CloudMoon, Sunset, Moon } from 'lucide-react';
import DailyPriorities from './components/DailyPriorities';
import TodoList from './components/TodoList';
import DailyAffirmation from './components/DailyAffirmation';
import WaterTracker from './components/WaterTracker';
import NotesSection from './components/NotesSection';
import PomodoroTimer from './components/PomodoroTimer';
import MusicPlayer from './components/MusicPlayer';
import SleepTracker from './components/SleepTracker';
import GratitudeJournal from './components/GratitudeJournal';
import MealTracker from './components/MealTracker';
import ActivityChart from './components/ActivityChart';
import Logo from './components/Logo';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getTimeIcon() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return <Sun size={18} className="text-amber-400" />;
  if (hour >= 12 && hour < 17) return <Sunset size={18} className="text-orange-400" />;
  if (hour >= 17 && hour < 21) return <CloudMoon size={18} className="text-rose-300" />;
  return <Moon size={18} className="text-indigo-300" />;
}

export default function App() {
  const [isFocusMode, setIsFocusMode] = useState(false);

  const handleFocusChange = useCallback((focused: boolean) => {
    setIsFocusMode(focused);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ===== Floating Background Orbs ===== */}
      <div className="orb w-72 h-72 bg-amber-500/20 top-[-5%] left-[10%]" style={{ animationDelay: '0s' }} />
      <div className="orb w-96 h-96 bg-rose-500/15 top-[30%] right-[-10%]" style={{ animationDelay: '5s' }} />
      <div className="orb w-64 h-64 bg-teal-500/15 bottom-[10%] left-[20%]" style={{ animationDelay: '10s' }} />
      <div className="orb w-48 h-48 bg-orange-400/10 top-[60%] left-[60%]" style={{ animationDelay: '8s' }} />
      <div className="orb w-56 h-56 bg-violet-500/10 top-[5%] right-[30%]" style={{ animationDelay: '3s' }} />

      {/* ===== Main Content ===== */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* ===== Header — hidden in focus mode ===== */}
        <motion.header
          animate={{ opacity: isFocusMode ? 0 : 1, height: isFocusMode ? 0 : 'auto', marginBottom: isFocusMode ? 0 : 40 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 overflow-hidden"
        >
          <div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-2">
              <Logo variant="horizontal" size={40} />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-tight">
              <span className="gradient-text">{getGreeting()}</span>
              <span className="text-white/80">.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
              className="text-white/25 mt-2 font-medium text-sm sm:text-base">
              Let's make today beautiful ✨
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-3">
            <div className="glass-card !rounded-2xl px-5 py-3 flex items-center gap-3 !bg-white/5">
              <Calendar size={16} className="text-white/30" />
              <span className="text-sm font-medium text-white/50">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              <div className="w-px h-4 bg-white/10" />
              {getTimeIcon()}
            </div>
          </motion.div>
        </motion.header>

        {/* ===== Focus Mode Indicator ===== */}
        {isFocusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="text-center text-xs font-bold uppercase tracking-[0.3em] text-orange-400/40 mb-6"
          >
            ● Focus Mode Active
          </motion.div>
        )}

        {/* ===== Dashboard Grid ===== */}
        <div className={isFocusMode
          ? 'flex flex-col items-center gap-6 max-w-3xl mx-auto'
          : 'grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6'
        }>

          {/* Left Column — hidden in focus mode */}
          <div className={`lg:col-span-5 space-y-5 lg:space-y-6 transition-all duration-500 ${isFocusMode ? 'hidden' : ''}`}>
            <DailyPriorities />
            <ActivityChart />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6">
              <DailyAffirmation />
              {!isFocusMode && <NotesSection />}
            </div>
          </div>

          {/* Center Column — hidden in focus mode */}
          <div className={`lg:col-span-4 space-y-5 lg:space-y-6 transition-all duration-500 ${isFocusMode ? 'hidden' : ''}`}>
            <TodoList />
            <GratitudeJournal />
            <MealTracker />
          </div>

          {/* Right Column / Focus: Timer only */}
          <div className={isFocusMode ? 'w-full max-w-sm mx-auto' : 'lg:col-span-3 space-y-5 lg:space-y-6'}>
            <PomodoroTimer onFocusChange={handleFocusChange} />
            {!isFocusMode && (
              <>
                <WaterTracker />
                <SleepTracker />
                <MusicPlayer />
              </>
            )}
          </div>

          {/* Focus mode: Notes + Music side-by-side */}
          {isFocusMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <NotesSection />
              <MusicPlayer />
            </div>
          )}
        </div>

        <footer className="mt-16 text-center pb-8">
          <p className="text-white/10 text-xs font-medium tracking-wide">
            © {new Date().getFullYear()} flow-Day • Crafted with 💖
          </p>
        </footer>
      </div>
    </div>
  );
}
