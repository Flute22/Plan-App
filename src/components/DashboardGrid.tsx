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

const COMPONENT_MAP: Record<string, React.ReactNode> = {
    'priorities': <DailyPriorities />,
    'todo': <TodoList />,
    'affirmation': <DailyAffirmation />,
    'water': <WaterTracker />,
    'notes': <NotesSection />,
    'timer': <PomodoroTimer onFocusChange={() => { }} />, // Placeholder handler
    'music': <MusicPlayer />,
    'sleep': <SleepTracker />,
    'gratitude': <GratitudeJournal />,
    'chart': <ActivityChart />,
    'schedule': <DailySchedule />,
};

const INITIAL_LAYOUT = {
    left: ['priorities', 'chart', 'affirmation', 'notes'],
    center: ['todo', 'schedule', 'gratitude'],
    right: ['timer', 'water', 'sleep', 'music'],
};

export default function DashboardGrid({ isFocusMode, onFocusChange }: { isFocusMode: boolean, onFocusChange: (f: boolean) => void }) {
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

    const renderSection = (id: string) => (
        <SortableSection key={id} id={id}>
            {COMPONENT_MAP[id]}
        </SortableSection>
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className={isFocusMode
                ? 'flex flex-col items-center gap-6 max-w-3xl mx-auto w-full'
                : 'grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6'
            }>
                {/* Left Column */}
                <div className={`lg:col-span-4 space-y-5 lg:space-y-6 transition-all duration-500 ${isFocusMode ? 'hidden' : ''}`}>
                    <SortableContext items={columns.left} strategy={verticalListSortingStrategy}>
                        {columns.left.map(renderSection)}
                    </SortableContext>
                </div>

                {/* Center Column */}
                <div className={`lg:col-span-5 space-y-5 lg:space-y-6 transition-all duration-500 ${isFocusMode ? 'hidden' : ''}`}>
                    <SortableContext items={columns.center} strategy={verticalListSortingStrategy}>
                        {columns.center.map(renderSection)}
                    </SortableContext>
                </div>

                {/* Right Column / Focus */}
                <div className={isFocusMode ? 'w-full max-w-sm mx-auto' : 'lg:col-span-3 space-y-5 lg:space-y-6'}>
                    <SortableContext items={isFocusMode ? ['timer'] : columns.right} strategy={verticalListSortingStrategy}>
                        {isFocusMode ? renderSection('timer') : columns.right.map(renderSection)}
                    </SortableContext>
                    {!isFocusMode && (
                        // Background spacer or additional logic if needed
                        <div className="hidden" />
                    )}
                </div>

                {/* Focus mode: Notes + Music side-by-side */}
                {isFocusMode && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        {renderSection('notes')}
                        {renderSection('music')}
                    </div>
                )}
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
