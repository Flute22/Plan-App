import { useEffect, useRef, useState } from 'react';

/**
 * A hook that uses IntersectionObserver to detect when an element enters the viewport.
 * @param threshold The percentage of the element that must be visible (0.0 to 1.0)
 * @returns [ref, isVisible]
 */
export function useScrollReveal(threshold = 0.1) {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Once visible, we can stop observing to preserve performance
                    if (elementRef.current) {
                        observer.unobserve(elementRef.current);
                    }
                }
            },
            {
                threshold,
                rootMargin: '0px 0px -50px 0px', // Trigger slightly before it hits the bottom
            }
        );

        const currentElement = elementRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [threshold]);

    return { elementRef, isVisible };
}
