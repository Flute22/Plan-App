import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Global state for the "current day" being viewed/edited.
 * Default is today's date (YYYY-MM-DD).
 */
let globalDay = new Date().toISOString().slice(0, 10);
const dayListeners = new Set<(day: string) => void>();

export function getGlobalDay(): string {
    return globalDay;
}

/**
 * Updates the global day across all hook instances.
 * This triggers a re-fetch and state update for any hook with `perDay: true`.
 */
export function updateGlobalDay(newDay: string) {
    if (newDay === globalDay) return;
    globalDay = newDay;
    dayListeners.forEach(listener => listener(newDay));
}

/**
 * Gets the current authenticated user's ID, or null if not logged in.
 */
function getCurrentUserId(): string | null {
    try {
        const storageKey = Object.keys(localStorage).find(k =>
            k.startsWith('sb-') && k.endsWith('-auth-token')
        );
        if (storageKey) {
            const session = JSON.parse(localStorage.getItem(storageKey) || '{}');
            return session?.user?.id ?? null;
        }
    } catch { /* ignore */ }
    return null;
}

/**
 * A custom hook that wraps useState with automatic persistence.
 */
export function usePersistedState<T>(
    key: string,
    defaultValue: T,
    options?: { perDay?: boolean; debounceMs?: number; onCleanup?: () => void }
): [T, (value: T | ((prev: T) => T)) => void] {
    const { perDay = true, debounceMs = 1000, onCleanup } = options ?? {};
    const [currentKeyDay, setCurrentKeyDay] = useState(globalDay);
    const userId = getCurrentUserId();
    const userPrefix = userId ? `u_${userId.slice(0, 8)}_` : '';

    // storageKey now depends on currentKeyDay state
    const storageKey = perDay
        ? `flowday_${userPrefix}${key}_${currentKeyDay}`
        : `flowday_${userPrefix}${key}`;

    // Helper to get initial value for a specific key
    const getInitialValue = useCallback((sKey: string): T => {
        try {
            const stored = localStorage.getItem(sKey);
            if (stored !== null) return JSON.parse(stored) as T;
        } catch { /* ignore */ }
        return defaultValue;
    }, [defaultValue]);

    const [state, setStateInternal] = useState<T>(() => getInitialValue(storageKey));

    // Listen for global day changes
    useEffect(() => {
        if (!perDay) return;
        const listener = (newDay: string) => {
            setCurrentKeyDay(newDay);
            // When day changes, we should reset to the new day's initial value (usually defaultValue)
            const newKey = `flowday_${userPrefix}${key}_${newDay}`;
            setStateInternal(getInitialValue(newKey));
            onCleanup?.();
        };
        dayListeners.add(listener);
        return () => { dayListeners.delete(listener); };
    }, [perDay, userPrefix, key, getInitialValue, onCleanup]);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitialMount = useRef(true);

    // Background sync from Supabase when storageKey or userId changes
    useEffect(() => {
        if (!supabase || !userId) return;

        (async () => {
            try {
                const { data, error } = await supabase
                    .from('app_state')
                    .select('value')
                    .eq('key', storageKey)
                    .eq('user_id', userId)
                    .maybeSingle();

                if (!error && data?.value !== undefined) {
                    const cloudValue = data.value as T;
                    setStateInternal(cloudValue);
                    localStorage.setItem(storageKey, JSON.stringify(cloudValue));
                }
            } catch { /* ignore */ }
        })();
    }, [storageKey, userId]);

    // Persist to local/cloud on state change
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
        } catch { /* ignore */ }

        if (supabase && userId) {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(async () => {
                try {
                    if (!supabase || !userId) return;

                    await supabase
                        .from('app_state')
                        .upsert({
                            key: storageKey,
                            value: state,
                            user_id: userId,
                            updated_at: new Date().toISOString(),
                        }, { onConflict: 'key' });
                } catch (err) {
                    console.error(`Cloud sync failed for ${storageKey}:`, err);
                }
            }, debounceMs);
        }

        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [state, storageKey, debounceMs, userId]);

    const setState = useCallback((value: T | ((prev: T) => T)) => {
        setStateInternal(value);
    }, []);

    return [state, setState];
}
