import { supabase } from './supabase';
import { updateGlobalDay } from '../hooks/usePersistedState';

/**
 * Service to handle manual archiving and resetting of daily data.
 */
export const dayService = {
    /**
     * Archives current day data and resets the app state.
     * @param targetDate The date string (YYYY-MM-DD) of the day to archive.
     */
    async archiveAndResetDay(targetDate: string): Promise<boolean> {
        try {
            if (!supabase) return false;

            // 1. Call the RPC to archive and clear data in Supabase
            const { error } = await supabase.rpc('archive_and_reset_day', {
                target_date: targetDate
            });

            if (error) {
                console.error('[dayService] Error archiving day:', error);
                return false;
            }

            // 2. Clear local storage for this day to avoid stale data
            const userId = await this.getCurrentUserId();
            const userPrefix = userId ? `u_${userId.slice(0, 8)}_` : '';
            
            Object.keys(localStorage).forEach(key => {
                if (key.includes(targetDate) && key.startsWith('flowday_')) {
                    localStorage.removeItem(key);
                }
            });

            // 3. Update global day to the NEW today
            const newToday = new Date().toISOString().slice(0, 10);
            updateGlobalDay(newToday);
            
            // 4. Persistence: save the new active day to local storage
            localStorage.setItem('flowday_active_day', newToday);

            return true;
        } catch (err) {
            console.error('[dayService] Unexpected error during archive:', err);
            return false;
        }
    },

    /**
     * Helper to get current user ID
     */
    async getCurrentUserId(): Promise<string | null> {
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id || null;
    }
};
