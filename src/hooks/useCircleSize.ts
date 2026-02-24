import { useState, useEffect } from 'react';

/**
 * Hook to provide responsive circle sizes for widgets based on window width.
 */
export const useCircleSize = () => {
    const [size, setSize] = useState(120);

    useEffect(() => {
        const update = () => {
            const w = window.innerWidth;
            // Breakpoints for mobile phone ranges (320px to 430px) and above
            if (w <= 320) setSize(90);
            else if (w <= 375) setSize(100);
            else if (w <= 430) setSize(110);
            else if (w <= 768) setSize(120);
            else setSize(140);
        };

        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    return size;
};
