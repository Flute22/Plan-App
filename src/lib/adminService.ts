/**
 * Admin Service — Supabase queries for the admin panel.
 * All functions require the caller to be authenticated as admin.
 * RLS policies enforce access control server-side.
 */
import { supabase } from './supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    role: string;
    status: string;
    last_login: string | null;
    created_at: string;
}

export interface AdminStats {
    total_users: number;
    active_users: number;
    blocked_users: number;
    signups_today: number;
    signups_week: number;
    signups_month: number;
    total_data_entries: number;
}

export interface ActivityEntry {
    id: string;
    user_id: string | null;
    action: string;
    details: Record<string, unknown>;
    created_at: string;
}

export interface DataEntry {
    key: string;
    value: unknown;
    user_id: string | null;
    updated_at: string;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function fetchAdminStats(): Promise<AdminStats | null> {
    if (!supabase) return null;

    try {
        const { data, error } = await supabase.rpc('admin_get_stats');
        if (error) {
            console.error('Failed to fetch admin stats:', error.message);
            return null;
        }
        return data as AdminStats;
    } catch (err) {
        console.error('Exception in fetchAdminStats:', err);
        return null;
    }
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function fetchAllUsers(options?: {
    search?: string;
    status?: string;
    page?: number;
    perPage?: number;
}): Promise<{ users: UserProfile[]; total: number }> {
    if (!supabase) return { users: [], total: 0 };

    try {
        const { search = '', status = '', page = 1, perPage = 10 } = options ?? {};
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;

        let query = supabase
            .from('profiles')
            .select('*', { count: 'exact' })
            .eq('role', 'user')
            .order('created_at', { ascending: false })
            .range(from, to);

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const { data, count, error } = await query;
        if (error) {
            console.error('Failed to fetch users:', error.message);
            return { users: [], total: 0 };
        }

        return { users: (data ?? []) as UserProfile[], total: count ?? 0 };
    } catch (err) {
        console.error('Exception in fetchAllUsers:', err);
        return { users: [], total: 0 };
    }
}

export async function updateUserStatus(userId: string, status: 'active' | 'blocked' | 'deleted'): Promise<boolean> {
    if (!supabase) return false;

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) {
            console.error('Failed to update user status:', error.message);
            return false;
        }

        // Log the action
        await supabase.from('activity_log').insert({
            user_id: userId,
            action: status === 'blocked' ? 'user_blocked' : status === 'deleted' ? 'user_deleted' : 'user_unblocked',
            details: { target_user: userId },
        });

        return true;
    } catch (err) {
        console.error('Exception in updateUserStatus:', err);
        return false;
    }
}

// ─── Activity Log ────────────────────────────────────────────────────────────

export async function fetchActivityLog(limit = 20): Promise<ActivityEntry[]> {
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('activity_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Failed to fetch activity log:', error.message);
            return [];
        }

        return (data ?? []) as ActivityEntry[];
    } catch (err) {
        console.error('Exception in fetchActivityLog:', err);
        return [];
    }
}

// ─── Data Management ─────────────────────────────────────────────────────────

export async function fetchAllData(options?: {
    userId?: string;
    search?: string;
    page?: number;
    perPage?: number;
}): Promise<{ entries: DataEntry[]; total: number }> {
    if (!supabase) return { entries: [], total: 0 };

    try {
        const { userId, search = '', page = 1, perPage = 20 } = options ?? {};
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;

        let query = supabase
            .from('app_state')
            .select('*', { count: 'exact' })
            .order('updated_at', { ascending: false })
            .range(from, to);

        if (userId) {
            query = query.eq('user_id', userId);
        }

        if (search) {
            query = query.ilike('key', `%${search}%`);
        }

        const { data, count, error } = await query;
        if (error) {
            console.error('Failed to fetch data:', error.message);
            return { entries: [], total: 0 };
        }

        return { entries: (data ?? []) as DataEntry[], total: count ?? 0 };
    } catch (err) {
        console.error('Exception in fetchAllData:', err);
        return { entries: [], total: 0 };
    }
}

export async function deleteDataEntry(key: string): Promise<boolean> {
    if (!supabase) return false;

    try {
        const { error } = await supabase.from('app_state').delete().eq('key', key);
        if (error) {
            console.error('Failed to delete data entry:', error.message);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Exception in deleteDataEntry:', err);
        return false;
    }
}

// ─── CSV Export ──────────────────────────────────────────────────────────────

export function exportToCSV(data: DataEntry[], filename = 'flowday-data-export.csv') {
    const headers = ['Key', 'User ID', 'Value', 'Updated At'];
    const rows = data.map(entry => [
        entry.key,
        entry.user_id ?? 'N/A',
        JSON.stringify(entry.value),
        entry.updated_at,
    ]);

    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
