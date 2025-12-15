import { createTheme } from '@mui/material/styles';

// --- BRAND CONFIGURATION ---
// "CYBER-FINANCE V2"
// Readable Dark, with Pure Blue and Deep Violet.
const BRAND = {
    dark: {
        background: '#000000', // Github Dark
        paper: '#161B22',
        primary: '#000FFF', // Pure Blue (Requested)
        secondary: '#600DB5', // Deep Violet (Requested)
        text: '#F0F6FC',
        textSec: '#8B949E',
    },
    light: {
        background: '#FFFFFF',
        paper: '#F8F9FA',
        primary: '#000FFF', // Pure Blue
        secondary: '#600DB5', // Deep Violet
        text: '#111827',
        textSec: '#5F6368',
    }
};

// --- STATUS COLORS ---
const SIGNALS = {
    dark: {
        watch: '#2DD4BF', // Teal-400
        signal: '#600DB5', // Deep Violet (Requested)
    },
    light: {
        watch: '#0F766E', // Teal-700
        signal: '#600DB5', // Deep Violet
    }
};

const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === 'dark'
            ? {
                // DARK MODE
                background: {
                    default: BRAND.dark.background,
                    paper: BRAND.dark.paper,
                },
                primary: {
                    main: BRAND.dark.primary,
                },
                secondary: {
                    main: BRAND.dark.secondary,
                },
                success: {
                    main: SIGNALS.dark.watch,
                },
                warning: {
                    main: SIGNALS.dark.signal,
                },
                text: {
                    primary: BRAND.dark.text,
                    secondary: BRAND.dark.textSec,
                },
            }
            : {
                // LIGHT MODE
                background: {
                    default: BRAND.light.background,
                    paper: BRAND.light.paper,
                },
                primary: {
                    main: BRAND.light.primary,
                },
                secondary: {
                    main: BRAND.light.secondary,
                },
                success: {
                    main: SIGNALS.light.watch,
                },
                warning: {
                    main: SIGNALS.light.signal,
                },
                text: {
                    primary: BRAND.light.text,
                    secondary: BRAND.light.textSec,
                },
            }),
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        h1: {
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h2: {
            fontSize: '1.25rem',
            fontWeight: 600,
        },
        fontFamilyMonospace: '"Roboto Mono", "Fira Code", monospace',
    },
    components: {
        MuiTableCell: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#30363D' : '#E5E7EB'}`,
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                }),
                head: ({ theme }) => ({
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.8125rem',
                    backgroundColor: theme.palette.mode === 'dark' ? '#161B22' : '#F1F3F4',
                    color: theme.palette.text.secondary,
                }),
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    borderRadius: 4,
                    height: 24,
                    fontSize: '0.75rem',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: theme.palette.background.paper, // Match table background
                    backgroundImage: 'none',
                    backdropFilter: 'none',
                    borderBottom: 'none',
                    boxShadow: 'none',
                })
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    border: `1px solid ${mode === 'dark' ? '#30363D' : '#E0E0E0'}`,
                }
            }
        }
    },
});

export const getTheme = (mode) => createTheme(getDesignTokens(mode));
