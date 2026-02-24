import React, { useState, useCallback } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { usePersistedState } from '../hooks/usePersistedState';

// Dashboard Components
import DailyPriorities from './DailyPriorities';
import TodoList from './TodoList';
import DailyAffirmation from './DailyAffirmation';
import WaterTracker from './WaterTracker';
import NotesSection from './NotesSection';
import PomodoroTimer from './PomodoroTimer';
import MusicPlayer from './MusicPlayer';
import SleepTracker from './SleepTracker';
import GratitudeJournal from './GratitudeJournal';
import ActivityChart from './ActivityChart';
import DailySchedule from './DailySchedule';
import { SortableSection } from './SortableSection';
import { ScrollRevealSection } from './ScrollRevealSection';

const COMPONENT_MAP: Record<string, React.ReactNode> = {
    // Current IDs
    'priorities': <DailyPriorities />,
    'todo': <TodoList />,
    'affirmation': <DailyAffirmation />,
    'water': <WaterTracker />,
    'notes': <NotesSection />,
    'timer': <PomodoroTimer onFocusChange={() => { }} />,
    'music': <MusicPlayer />,
    'sleep': <SleepTracker />,
    'gratitude': <GratitudeJournal />,
    'chart': <ActivityChart />,
    'schedule': <DailySchedule />,
    // Legacy IDs for backward compatibility
    'top-priorities': <DailyPriorities />,
    'todo-list': <TodoList />,
    'hydration': <WaterTracker />,
    'daily-schedule': <DailySchedule />,
    'focus-timer': <PomodoroTimer onFocusChange={() => { }} />
};

const INITIAL_LAYOUT = {
    left: ['priorities', 'chart', 'affirmation', 'notes'],
    center: ['todo', 'schedule', 'gratitude'],
    right: ['timer', 'water', 'sleep', 'music'],
};

export default function DashboardGrid({ isFocusMode, onFocusChange, animState }: {
    isFocusMode: boolean,
    onFocusChange: (f: boolean) => void,
    animState: 'idle' | 'lifting' | 'flipping' | 'settling' | 'revealing' | 'complete'
}) {
    const [columns, setColumns] = usePersistedState<Record<string, string[]>>('dashboard-layout', INITIAL_LAYOUT);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const findContainer = (id: string) => {
        if (id in columns) return id;
        return Object.keys(columns).find((key) => columns[key].includes(id));
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        const overId = over?.id as string;

        if (!overId) return;

        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) return;

        setColumns((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];

            const activeIndex = activeItems.indexOf(active.id as string);
            const overIndex = overItems.indexOf(overId);

            let newIndex;
            if (overId in prev) {
                newIndex = overItems.length + 1;
            } else {
                const isBelowLastItem = over && overIndex === overItems.length - 1;
                const modifier = isBelowLastItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
                ...prev,
                [activeContainer]: activeItems.filter((item) => item !== active.id),
                [overContainer]: [
                    ...overItems.slice(0, newIndex),
                    activeItems[activeIndex],
                    ...overItems.slice(newIndex, overItems.length),
                ],
            };
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const overId = over?.id as string;

        if (!overId) {
            setActiveId(null);
            return;
        }

        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer !== overContainer) {
            setActiveId(null);
            return;
        }

        const activeIndex = columns[activeContainer].indexOf(active.id as string);
        const overIndex = columns[overContainer].indexOf(overId);

        if (activeIndex !== overIndex) {
            setColumns((prev) => ({
                ...prev,
                [overContainer]: arrayMove(prev[overContainer], activeIndex, overIndex),
            }));
        }

        setActiveId(null);
    };

    // Update component map with real focus handler if needed
    COMPONENT_MAP['timer'] = <PomodoroTimer onFocusChange={onFocusChange} />;

    const renderSection = (id: string, index: number) => {
        const widgetClass = id === 'priorities' || id === 'top-priorities' ? 'priorities-card' :
            id === 'water' || id === 'hydration' ? 'hydration-card' :
                id === 'todo' || id === 'todo-list' ? 'todo-card' :
                    id === 'schedule' || id === 'daily-schedule' ? 'schedule-card' :
                        id === 'sleep' ? 'sleep-card' :
                            id === 'timer' ? 'focus-card' : '';

        return (
            <SortableSection key={id} id={id}>
                <ScrollRevealSection delay={index * 50}>
                    <div
                        className={`card-reveal ${widgetClass} ${animState === 'idle' || animState === 'revealing' || animState === 'complete' ? 'active' : ''}`}
                        style={{ animationDelay: `${animState === 'revealing' ? index * 120 : 0}ms` }}
                    >
                        {COMPONENT_MAP[id]}
                    </div>
                </ScrollRevealSection>
            </SortableSection>
        );
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className={`dashboard-container ${isFocusMode
                ? 'flex flex-col items-center gap-6 max-w-3xl mx-auto w-full'
                : 'grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6'
                }`}>
                {/* Left Column */}
                <div className={`col-left lg:col-span-5 space-y-5 lg:space-y-6 transition-all duration-500 ${isFocusMode ? 'hidden' : ''}`}>
                    <SortableContext items={columns.left} strategy={verticalListSortingStrategy}>
                        {columns.left.map((id, idx) => renderSection(id, idx))}
                    </SortableContext>
                </div>

                {/* Center Column */}
                <div className={`col-center lg:col-span-4 space-y-5 lg:space-y-6 transition-all duration-500 ${isFocusMode ? 'hidden' : ''}`}>
                    <SortableContext items={columns.center} strategy={verticalListSortingStrategy}>
                        {columns.center.map((id, idx) => renderSection(id, idx + columns.left.length))}
                    </SortableContext>
                </div>

                {/* Right Column / Focus */}
                <div className={`col-right ${isFocusMode ? 'w-full max-w-sm mx-auto' : 'lg:col-span-3 space-y-5 lg:space-y-6'}`}>
                    <SortableContext items={isFocusMode ? ['timer'] : columns.right} strategy={verticalListSortingStrategy}>
                        {isFocusMode
                            ? renderSection('timer', 0)
                            : columns.right.map((id, idx) => renderSection(id, idx + columns.left.length + columns.center.length))}
                    </SortableContext>

                    {/* Focus mode widgets */}
                    {isFocusMode && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pt-4">
                            {renderSection('notes', 1)}
                            {renderSection('music', 2)}
                        </div>
                    )}
                </div>
            </div>

            <DragOverlay>
                {activeId ? (
                    <div className="opacity-80 scale-105 transition-transform">
                        {COMPONENT_MAP[activeId]}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
