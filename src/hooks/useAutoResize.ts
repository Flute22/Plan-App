import React, { useEffect, useCallback } from 'react';

/**
 * Hook to automatically resize a textarea based on its content.
 * 
 * @param ref - React ref of the textarea element
 * @param value - The value of the textarea (to trigger resize)
 */
export function useAutoResize(ref: React.RefObject<HTMLTextAreaElement | null>, value: string) {
    const resize = useCallback(() => {
        const element = ref.current;
        if (element) {
            element.style.height = 'auto';
            element.style.height = `${element.scrollHeight}px`;
        }
    }, [ref]);

    useEffect(() => {
        resize();
        // Also resize on window resize
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [resize, value]);

    return resize;
}
