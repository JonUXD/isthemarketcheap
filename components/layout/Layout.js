import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Tabs,
    Tab,
    IconButton,
    Tooltip,
    TextField,
    InputAdornment
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from '../../lib/ColorModeContext';
import Logo from '../Logo';
import BrandText from '../BrandText';

export default function Layout({ children, title = "Is the Market Cheap?", searchProps = null }) {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);
    const router = useRouter();

    // Map current path to tab value
    // Ensure we match strict paths to highlight correctly
    const currentTab = ['/', '/faq', '/about'].includes(router.pathname)
        ? router.pathname
        : '/'; // Default to market if unknown path (or use false)

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content="Track assets trading below ATH" />
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
            </Head>

            <AppBar
                position="static"
                color="transparent"
                elevation={0}
                sx={{
                    backgroundColor: theme.palette.background.paper,
                    borderBottom: `4px solid ${theme.palette.primary.main}`,
                }}
            >
                <Toolbar sx={{ gap: 4, minHeight: 70 }}>
                    {/* 1. TITLE / LOGO */}
                    <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Logo width={40} height={40} />
                        <BrandText height={32} />
                    </Link>

                    {/* 2. NAVIGATION TABS */}
                    {/* Using Link component ensures native navigation behavior and SEO */}
                    <Tabs
                        value={currentTab}
                        textColor='inherit'
                        indicatorColor="primary"
                        sx={{
                            flexGrow: 1,
                            '& .MuiTab-root': {
                                color: 'text.primary', // Keep text color consistent
                            },
                            '& .Mui-selected': {
                                color: 'text.primary', // Don't change color when selected
                            }
                        }}
                    >
                        <Tab label="Market" value="/" component={Link} href="/" sx={{ fontWeight: 600 }} />
                        <Tab label="FAQ" value="/faq" component={Link} href="/faq" sx={{ fontWeight: 600 }} />
                        <Tab label="About" value="/about" component={Link} href="/about" sx={{ fontWeight: 600 }} />
                    </Tabs>

                    {/* 3. SEARCH BAR */}
                    {searchProps && (
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Search assets..."
                            value={searchProps.value}
                            onChange={searchProps.onChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: 2,
                                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                    width: { xs: 120, sm: 250 },
                                    transition: 'width 0.2s',
                                    '&:focus-within': { width: 300 }
                                }
                            }}
                        />
                    )}

                    {/* 4. THEME TOGGLE */}
                    <Tooltip title="Toggle light/dark mode">
                        <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            {/* PAGE CONTENT */}
            <Box component="main">
                {children}
            </Box>

            {/* FOOTER */}
            <Box
                component="footer"
                sx={{
                    borderTop: 1,
                    borderColor: 'divider',
                    py: 3,
                    mt: 6,
                    textAlign: 'center'
                }}
            >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    © {new Date().getFullYear()} Is the Market Cheap? · Open Source
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Link
                        href="https://github.com/jonugartemoso/test-isthemarketcheap"
                        target="_blank"
                        rel="noopener"
                        color="text.secondary"
                        underline="hover"
                        sx={{ fontSize: '0.875rem' }}
                    >
                        GitHub
                    </Link>
                    <Typography color="text.secondary">·</Typography>
                    <Link
                        href="/about"
                        color="text.secondary"
                        underline="hover"
                        sx={{ fontSize: '0.875rem' }}
                    >
                        About
                    </Link>
                </Box>
            </Box>
        </>
    );
}
