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
import { ColorModeContext } from '../lib/ColorModeContext';

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
                <link rel="icon" href="/favicon.ico" />
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
                <Toolbar sx={{ gap: 2, minHeight: 70 }}>
                    {/* 1. TITLE / LOGO */}
                    <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{
                                fontWeight: 800,
                                letterSpacing: '-0.03em',
                                whiteSpace: 'nowrap',
                                mr: 2,
                                cursor: 'pointer'
                            }}
                        >
                            IS THE MARKET CHEAP?
                        </Typography>
                    </Link>

                    {/* 2. NAVIGATION TABS */}
                    {/* Using Link component ensures native navigation behavior and SEO */}
                    <Tabs
                        value={currentTab}
                        textColor="primary"
                        indicatorColor="primary"
                        sx={{ flexGrow: 1 }}
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
        </>
    );
}
