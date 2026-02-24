import React from 'react';

interface LogoProps {
    variant?: 'primary' | 'horizontal' | 'icon';
    className?: string;
    size?: number;
}

export default function Logo({ variant = 'horizontal', className = '', size }: LogoProps) {
    if (variant === 'icon') {
        return (
            <svg
                width={size || 32}
                height={size || 32}
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={className}
            >
                <defs>
                    <linearGradient id="icon_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F6C857" />
                        <stop offset="100%" stopColor="#E8737A" />
                    </linearGradient>
                </defs>
                <circle cx="32" cy="32" r="26" stroke="url(#icon_grad)" strokeWidth="6" />
                <path d="M12 32C20 25 44 45 52 32" stroke="url(#icon_grad)" strokeWidth="7" strokeLinecap="round" />
            </svg>
        );
    }

    if (variant === 'primary') {
        return (
            <svg
                width={size || 160}
                height={size ? (size * 1.2) : 192}
                viewBox="0 0 200 240"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={className}
            >
                <defs>
                    <linearGradient id="logo_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F6C857" />
                        <stop offset="50%" stopColor="#F09C67" />
                        <stop offset="100%" stopColor="#E8737A" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                <g filter="url(#glow)">
                    <circle cx="100" cy="80" r="45" stroke="url(#logo_grad)" strokeWidth="8" strokeLinecap="round" fill="rgba(255,255,255,0.03)" />
                    <path d="M60 85C75 75 105 105 140 85" stroke="url(#logo_grad)" strokeWidth="8" strokeLinecap="round" />
                    <path d="M70 100C85 90 100 110 130 100" stroke="rgba(255,255,255,0.15)" strokeWidth="4" strokeLinecap="round" />
                </g>
                <text x="100" y="170" textAnchor="middle" theme-font-heading font-weight="700" font-size="32" fill="white" letterSpacing="0.1em">flow</text>
                <text x="100" y="210" textAnchor="middle" theme-font-display font-weight="500" font-style="italic" font-size="36" fill="url(#logo_grad)">Day</text>
            </svg>
        );
    }

    // Default: Horizontal
    return (
        <svg
            width={size ? (size * 4.6) : 230}
            height={size || 50}
            viewBox="0 0 280 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="header_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F6C857" />
                    <stop offset="100%" stopColor="#E8737A" />
                </linearGradient>
            </defs>
            <circle cx="30" cy="30" r="20" stroke="url(#header_grad)" strokeWidth="4" fill="rgba(255,255,255,0.05)" />
            <path d="M15 32C22 28 35 38 45 30" stroke="url(#header_grad)" strokeWidth="5" strokeLinecap="round" />
            <text x="65" y="38" style={{ fontFamily: 'Space Grotesk' }} fontWeight="700" fontSize="30" fill="white">flow</text>
            <text x="135" y="38" style={{ fontFamily: 'Playfair Display' }} fontWeight="500" fontStyle="italic" fontSize="32" fill="url(#header_grad)">Day</text>
        </svg>
    );
}
