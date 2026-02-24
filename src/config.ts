/**
 * Central configuration for the application.
 * Uses VITE_SITE_URL environment variable if available, 
 * otherwise falls back to the current window location.
 */
export const BASE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
