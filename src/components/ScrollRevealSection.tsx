import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface ScrollRevealSectionProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export function ScrollRevealSection({ children, className = '', delay = 0 }: ScrollRevealSectionProps) {
    const { elementRef, isVisible } = useScrollReveal(0.05);

    return (
        <div
            ref={elementRef}
            className={`reveal-on-scroll ${isVisible ? 'is-visible' : ''} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}
