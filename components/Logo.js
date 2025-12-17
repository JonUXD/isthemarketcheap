import React from 'react';

export default function Logo({ width = 40, height = 40 }) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Is the Market Cheap logo"
        >
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#00D4FF', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#600DB5', stopOpacity: 1 }} />
                </linearGradient>
            </defs>

            {/* Smooth curve: rises up, then curves down */}
            <path
                d="M 20 80 Q 35 40, 50 30 T 80 50"
                stroke="url(#logoGradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
            />

            {/* Bigger dot at the end */}
            <circle
                cx="80"
                cy="50"
                r="14"
                fill="#600DB5"
            />
        </svg>
    );
}
