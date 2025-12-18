import React from 'react';
import { useTheme } from '@mui/material/styles';

export default function BrandText({ height = 24 }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const mainColor = isDark ? '#FFFFFF' : '#1A1A1A';
    const accentColor = isDark ? '#0066FF' : '#600DB5';

    return (
        <svg
            height={height}
            viewBox="0 0 280 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block' }}
        >
            <text
                x="0"
                y="24"
                fill={mainColor}
                style={{
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                    fontSize: '24px',
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    textTransform: 'none'
                }}
            >
                Is the market <tspan fill={accentColor}>cheap</tspan>?
            </text>
        </svg>
    );
}
