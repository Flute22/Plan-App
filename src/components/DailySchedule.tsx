import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Calendar as CalendarIcon, Settings, X, Check } from 'lucide-react';
import { usePersistedState } from '../hooks/usePersistedState';
import { useAutoResize } from '../hooks/useAutoResize';

interface ScheduleItem {
    id: string;
    time: string;
    task: string;
}

const DEFAULT_SCHEDULE: ScheduleItem[] = [
    { id: '4am', time: '4:00 AM', task: '' },
    { id: '5am', time: '5:00 AM', task: '' },
    { id: '6am', time: '6:00 AM', task: '' },
    { id: '7am', time: '7:00 AM', task: '' },
    { id: '8am', time: '8:00 AM', task: '' },
    { id: '9am', time: '9:00 AM', task: '' },
    { id: '10am', time: '10:00 AM', task: '' },
    { id: '11am', time: '11:00 AM', task: '' },
    { id: '12pm', time: '12:00 PM', task: '' },
    { id: '1pm', time: '1:00 PM', task: '' },
    { id: '2pm', time: '2:00 PM', task: '' },
    { id: '3pm', time: '3:00 PM', task: '' },
    { id: '4pm', time: '4:00 PM', task: '' },
    { id: '5pm', time: '5:00 PM', task: '' },
    { id: '6pm', time: '6:00 PM', task: '' },
    { id: '7pm', time: '7:00 PM', task: '' },
    { id: '8pm', time: '8:00 PM', task: '' },
    { id: '9pm', time: '9:00 PM', task: '' },
    { id: '10pm', time: '10:00 PM', task: '' },
];

function ScheduleInput({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) {
    const ref = useRef<HTMLTextAreaElement | null>(null);
    useAutoResize(ref, value);

    return (
        <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={1}
            className="w-full bg-transparent border-none outline-none text-sm text-white/70 placeholder-white/10 resize-none overflow-hidden py-0.5 leading-relaxed"
        />
    );
}

export default function DailySchedule() {
    const [schedule, setSchedule] = usePersistedState<ScheduleItem[]>('daily-schedule', DEFAULT_SCHEDULE);
    const [startHour, setStartHour] = usePersistedState<number>('schedule-start', 4); // 4 AM
    const [endHour, setEndHour] = usePersistedState<number>('schedule-end', 22); // 10 PM
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            // Keep the scroll inside the container
            e.stopPropagation();
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, []);

    // Local state for settings to avoid immediate persistence during editing
    const [tempStart, setTempStart] = useState(startHour);
    const [tempEnd, setTempEnd] = useState(endHour);

    const updateTask = (id: string, task: string) => {
        setSchedule(schedule.map(item => item.id === id ? { ...item, task } : item));
    };

    const generateSlots = (start: number, end: number) => {
        const slots: ScheduleItem[] = [];
        for (let h = start; h <= end; h++) {
            const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
            const ampm = h < 12 ? 'AM' : 'PM';
            const id = `${displayHour}${ampm.toLowerCase()}`;
            const time = `${displayHour}:00 ${ampm}`;

            const existing = schedule.find(s => s.id === id);
            slots.push({ id, time, task: existing?.task || '' });
        }
        return slots;
    };

    const visibleSchedule = generateSlots(startHour, endHour);

    const saveSettings = () => {
        setStartHour(tempStart);
        setEndHour(tempEnd);
        setIsSettingsOpen(false);
    };

    const currentHour = new Date().getHours();
    const formatCurrentHourId = () => {
        const h = currentHour;
        const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const ampm = h < 12 ? 'AM' : 'PM';
        return `${displayHour}${ampm.toLowerCase()}`;
    };
    const activeId = formatCurrentHourId();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 relative overflow-hidden flex flex-col h-full"
            style={{
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
            }}
        >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20">
                            <Clock size={18} className="text-sky-400" />
                        </div>
                        <h2 className="font-heading text-lg font-bold text-white/90">Daily Schedule</h2>
                    </div>
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white/40 transition-all"
                    >
                        {isSettingsOpen ? <X size={16} /> : <Settings size={16} />}
                    </button>
                </div>

                {/* Settings Panel */}
                <AnimatePresence>
                    {isSettingsOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-6 bg-white/[0.03] rounded-2xl border border-white/5 p-4"
                        >
                            <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-4">Schedule Range</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-white/20 font-medium">Start Hour</label>
                                    <select
                                        value={tempStart}
                                        onChange={(e) => setTempStart(parseInt(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 outline-none"
                                    >
                                        {Array.from({ length: 24 }).map((_, i) => (
                                            <option key={i} value={i} className="bg-slate-900">
                                                {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-white/20 font-medium">End Hour</label>
                                    <select
                                        value={tempEnd}
                                        onChange={(e) => setTempEnd(parseInt(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 outline-none"
                                    >
                                        {Array.from({ length: 24 }).map((_, i) => (
                                            <option key={i} value={i} className="bg-slate-900">
                                                {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={saveSettings}
                                className="mt-4 w-full flex items-center justify-center gap-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 py-2 rounded-xl text-xs font-bold transition-all border border-sky-500/20"
                            >
                                <Check size={14} /> Update Schedule
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto overscroll-contain pr-1 custom-scrollbar max-h-[500px]"
                >
                    <div className="space-y-1">
                        {visibleSchedule.map((item) => {
                            const isCurrent = item.id === activeId;
                            return (
                                <div
                                    key={item.id}
                                    className={`group flex items-start gap-4 p-3 rounded-2xl transition-all border ${isCurrent
                                        ? 'bg-sky-500/10 border-sky-500/20 shadow-lg shadow-sky-500/5'
                                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex flex-col items-center pt-1 w-14 flex-shrink-0">
                                        <span className={`text-[10px] font-bold tracking-tighter ${isCurrent ? 'text-sky-300' : 'text-white/20'}`}>
                                            {item.time.split(' ')[0]}
                                        </span>
                                        <span className={`text-[8px] font-medium uppercase opacity-40 ${isCurrent ? 'text-sky-400' : 'text-white/40'}`}>
                                            {item.time.split(' ')[1]}
                                        </span>
                                    </div>

                                    <div className="w-px h-8 bg-white/5 self-stretch mt-1" />

                                    <div className="flex-1 flex items-center min-h-[24px]">
                                        <ScheduleInput
                                            value={item.task}
                                            onChange={(val) => updateTask(item.id, val)}
                                            placeholder="..."
                                        />
                                    </div>

                                    {isCurrent && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/30">
                                            <div className="w-1 h-1 rounded-full bg-sky-400 animate-pulse" />
                                            <span className="text-[8px] font-bold text-sky-300 uppercase tracking-widest">Now</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] text-white/20 font-medium italic">
                        <CalendarIcon size={12} className="opacity-50" />
                        <span>Plan your day, hour by hour</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
