import React from 'react';

interface CircularProgressProps {
    value: number;    // current value
    max: number;    // maximum value
    size?: number;    // diameter in px (default: 120)
    strokeWidth?: number;    // ring thickness (default: 8)
    color: string;    // active arc color
    trackColor?: string;    // background ring color
    label: string;    // center top text (e.g. "3.5")
    sublabel?: string;    // center bottom text (e.g. "hours")
}

/**
 * Reusable Circular Progress component for productivity widgets.
 * Designed for pixel-perfect centering and responsive scaling.
 */
const CircularProgress = ({
    value,
    max,
    size = 120,
    strokeWidth = 8,
    color,
    trackColor = 'rgba(255,255,255,0.08)',
    label,
    sublabel,
}: CircularProgressProps) => {

    // CRITICAL: Radius must account for strokeWidth to avoid clipping at edges
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(Math.max(value / max, 0), 1);
    const strokeDash = circumference * progress;
    const center = size / 2;

    return (
        <div className="circle-wrapper">
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ overflow: 'visible', display: 'block' }}
            >
                {/* Background track ring */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                />
                {/* Progress arc */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${strokeDash} ${circumference}`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${center} ${center})`}
                    style={{
                        transition: 'stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                        filter: `drop-shadow(0 0 5px ${color}66)` // Subtle glow
                    }}
                />
                {/* Center label */}
                <text
                    x={center}
                    y={sublabel ? center - 6 : center}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={size * 0.22}
                    fontWeight="700"
                    style={{ fontFamily: 'var(--font-heading, inherit)' }}
                >
                    {label}
                </text>
                {/* Center sublabel */}
                {sublabel && (
                    <text
                        x={center}
                        y={center + size * 0.14}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="rgba(255,255,255,0.45)"
                        fontSize={size * 0.11}
                        style={{ fontFamily: 'inherit' }}
                    >
                        {sublabel}
                    </text>
                )}
            </svg>
        </div>
    );
};

export default CircularProgress;
