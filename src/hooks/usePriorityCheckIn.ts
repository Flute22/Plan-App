import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const CHECK_IN_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours
const SNOOZE_INTERVAL = 30 * 60 * 1000; // 30 minutes
const STORAGE_KEY = 'flowday_priority_checkin_next';

export interface PriorityCheckInStatus {
    isOpen: boolean;
    incompletePriorities: string[];
}

export function usePriorityCheckIn() {
    const { user } = useAuth();
    const [status, setStatus] = useState<PriorityCheckInStatus>({
        isOpen: false,
        incompletePriorities: [],
    });

    // Request notification permission on mount if supported
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const getIncompletePriorities = useCallback(() => {
        try {
            const prioritiesStr = localStorage.getItem('priorities');
            const completedStr = localStorage.getItem('priorities-completed');

            if (!prioritiesStr || !completedStr) return [];

            const priorities = JSON.parse(prioritiesStr) as string[];
            const completed = JSON.parse(completedStr) as boolean[];

            return priorities
                .filter((p, i) => p.trim() && !completed[i]);
        } catch {
            return [];
        }
    }, []);

    const triggerNotification = useCallback((incomplete: string[]) => {
        setStatus({ isOpen: true, incompletePriorities: incomplete });

        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Flow-Day Check-In ⏰', {
                body: `How are your priorities going? Items left: ${incomplete.length}`,
                icon: '/favicon.ico'
            });
        }
    }, []);

    const resetTimer = useCallback((interval = CHECK_IN_INTERVAL) => {
        const nextCheck = Date.now() + interval;
        localStorage.setItem(STORAGE_KEY, nextCheck.toString());
        setStatus(prev => ({ ...prev, isOpen: false }));
    }, []);

    const snooze = useCallback(() => {
        resetTimer(SNOOZE_INTERVAL);
    }, [resetTimer]);

    const reschedule = useCallback((index: number) => {
        try {
            const prioritiesStr = localStorage.getItem('priorities');
            if (prioritiesStr) {
                const priorities = JSON.parse(prioritiesStr) as string[];
                const incomplete = getIncompletePriorities();
                const targetText = incomplete[index];

                // Find original index in full priorities array
                const originalIndex = priorities.indexOf(targetText);
                if (originalIndex !== -1) {
                    priorities[originalIndex] = ''; // Clear it locally
                    localStorage.setItem('priorities', JSON.stringify(priorities));
                    // Manually trigger a storage event so other components update if listening
                    window.dispatchEvent(new Event('storage'));
                }
            }
        } catch (err) {
            console.error('Failed to reschedule:', err);
        }

        // Refresh incomplete list
        const remaining = getIncompletePriorities();
        if (remaining.length === 0) {
            setStatus({ isOpen: false, incompletePriorities: [] });
            localStorage.removeItem(STORAGE_KEY);
        } else {
            setStatus(prev => ({ ...prev, incompletePriorities: remaining }));
        }
    }, [getIncompletePriorities]);

    useEffect(() => {
        if (!user) {
            localStorage.removeItem(STORAGE_KEY);
            return;
        }

        const intervalId = setInterval(() => {
            const nextCheck = localStorage.getItem(STORAGE_KEY);
            const now = Date.now();
            const incomplete = getIncompletePriorities();

            // If no priorities, clear timer
            if (incomplete.length === 0) {
                if (nextCheck) localStorage.removeItem(STORAGE_KEY);
                return;
            }

            // Initialize timer if not set
            if (!nextCheck) {
                resetTimer();
                return;
            }

            // Trigger if time is up
            if (now >= parseInt(nextCheck, 10)) {
                triggerNotification(incomplete);
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(intervalId);
    }, [user, getIncompletePriorities, resetTimer, triggerNotification]);

    return {
        ...status,
        resetTimer: () => resetTimer(CHECK_IN_INTERVAL),
        snooze,
        reschedule,
        close: () => setStatus(prev => ({ ...prev, isOpen: false }))
    };
}
