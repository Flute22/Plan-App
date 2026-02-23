import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Returns today's date string in YYYY-MM-DD format for per-day keying.
 */
function getTodayKey(): string {
    return new Date().toISOString().slice(0, 10);
}

/**
 * A custom hook that wraps useState with automatic persistence.
 *
 * Data persistence strategy:
 * 1. On mount: load from localStorage (instant), then background-fetch from Supabase
 * 2. On state change: write to localStorage immediately, debounced write to Supabase
 * 3. If Supabase is not configured: localStorage-only mode (still survives reloads)
 *
 * @param key - Unique key for this piece of state (e.g., 'todos', 'water-glasses')
 * @param defaultValue - Default value when no persisted data exists
 * @param options - Optional settings
 * @param options.perDay - If true, keys are scoped to today's date (default: true)
 * @param options.debounceMs - Debounce time for Supabase writes (default: 1000ms)
 */
export function usePersistedState<T>(
    key: string,
    defaultValue: T,
    options?: { perDay?: boolean; debounceMs?: number }
): [T, (value: T | ((prev: T) => T)) => void] {
    const { perDay = true, debounceMs = 1000 } = options ?? {};
    const storageKey = perDay ? `flowday_${key}_${getTodayKey()}` : `flowday_${key}`;

    // Initialize state from localStorage or default
    const [state, setStateInternal] = useState<T>(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored !== null) {
                return JSON.parse(stored) as T;
            }
        } catch {
            // Corrupted storage — fall through to default
        }
        return defaultValue;
    });

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitialMount = useRef(true);

    // On mount: try to fetch from Supabase (background sync)
    useEffect(() => {
        if (!supabase) return;

        (async () => {
            try {
                const { data, error } = await supabase
                    .from('app_state')
                    .select('value')
                    .eq('key', storageKey)
                    .maybeSingle();

                if (!error && data?.value !== undefined) {
                    const cloudValue = data.value as T;
                    setStateInternal(cloudValue);
                    localStorage.setItem(storageKey, JSON.stringify(cloudValue));
                }
            } catch {
                // Supabase unavailable — localStorage value is fine
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey]);

    // Persist on state change (skip first mount since it's loaded from storage)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Immediate localStorage write
        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
        } catch {
            // localStorage full or unavailable
        }

        // Debounced Supabase write
        if (supabase) {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(async () => {
                try {
                    await supabase!
                        .from('app_state')
                        .upsert(
                            { key: storageKey, value: state, updated_at: new Date().toISOString() },
                            { onConflict: 'key' }
                        );
                } catch {
                    // Supabase write failed — localStorage has the data
                }
            }, debounceMs);
        }

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, storageKey, debounceMs]);

    // Wrapper that accepts both value and updater function
    const setState = useCallback((value: T | ((prev: T) => T)) => {
        setStateInternal(value);
    }, []);

    return [state, setState];
}
