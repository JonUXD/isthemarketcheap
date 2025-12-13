import React, { useState, useEffect } from 'react';
import { intervalToDuration, formatDuration, format } from 'date-fns';
import Head from 'next/head';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Link,
  ThemeProvider,
  createTheme,
  CssBaseline,
  CircularProgress,
  AppBar,
  Toolbar,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  TableSortLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import axios from 'axios';

// --- Theme Configuration ---
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0a0a', // Very dark grey/black
      paper: '#1a1a1a',   // Slightly lighter for cards/tables
    },
    primary: {
      main: '#00d09c', // A vibrant green for "Cheap"
    },
    secondary: {
      main: '#d500f9', // Neon Purple for "Signal"
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },

  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #333',
          padding: '6px 16px', // Compact padding
        },
        head: {
          fontWeight: 700,
          backgroundColor: '#1a1a1a',
          color: '#b3b3b3',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

// Helper for custom relative date
function formatRelativeTime(dateStr) {
  if (!dateStr) return '-';
  const start = new Date(dateStr);
  const end = new Date();

  // Check if date is valid
  if (isNaN(start.getTime())) return '-';

  // Prevent future dates from breaking it
  if (start > end) return 'Just now';

  try {
    const duration = intervalToDuration({ start, end });

    // Helper to format units
    const fmt = (val, unit) => val > 0 ? `${val}${unit}` : '';

    // Years
    if (duration.years > 0) {
      return `${duration.years}y ${duration.months > 0 ? duration.months + 'mo' : ''} ago`;
    }

    // Months
    if (duration.months > 0) {
      return `${duration.months}mo ${duration.days > 0 ? duration.days + 'd' : ''} ago`;
    }

    // Days
    if (duration.days > 0) {
      return `${duration.days}d ${duration.hours > 0 ? duration.hours + 'h' : ''} ago`;
    }

    // Hours
    if (duration.hours > 0) {
      return `${duration.hours}h ago`;
    }

    // Minutes
    if (duration.minutes > 0) {
      return `${duration.minutes}m ago`;
    }

    return 'Just now';
  } catch (e) {
    console.error("Date formatting error", e);
    return '-';
  }
}

export default function Home() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'percentBelow', direction: 'desc' });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.post('/api/updateData');
        setAssets(response.data.data);
      } catch (error) {
        console.error("Failed to fetch assets", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- Logic: Process, Filter, Sort ---
  const processedAssets = React.useMemo(() => {
    let data = assets.map(asset => {
      const percentBelow = ((asset.ath - asset.currentPrice) / asset.ath) * 100;
      // Status Logic: "The Signal"
      let status = { label: '', color: 'default', textColor: '#666' };
      if (percentBelow > 20) {
        status = { label: 'WATCH', color: 'secondary', textColor: '#fff' }; // Neon Purple
      } else if (percentBelow > 5) {
        status = { label: 'WATCH', color: 'default', textColor: '#fff' }; // Light Grey
      }

      return { ...asset, percentBelow, status };
    });

    // 1. Filter by Category
    if (filterCategory !== 'All') {
      if (filterCategory === 'Crypto') data = data.filter(a => a.sector === 'Crypto');
      else if (filterCategory === 'ETFs') data = data.filter(a => a.category === 'ETF' && a.sector !== 'Crypto');
      else if (filterCategory === 'Commodities') data = data.filter(a => a.category === 'Commodity' || a.category === 'Commodity ETF');
    }

    // 2. Filter by Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter(a =>
        a.name.toLowerCase().includes(lowerTerm) ||
        a.label.toLowerCase().includes(lowerTerm) ||
        (a.friendlyName && a.friendlyName.toLowerCase().includes(lowerTerm))
      );
    }

    // 3. Sort
    data.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return data;
  }, [assets, filterCategory, searchTerm, sortConfig]);

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Head>
        <title>Is the Market Cheap?</title>
        <meta name="description" content="Track assets trading below ATH" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Top App Bar */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #333' }}>
        <Toolbar sx={{ gap: 4 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            Is the Market Cheap?
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, backgroundColor: '#1a1a1a', width: 300 }
            }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>

        {/* Filter Chips */}
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          {['All', 'Crypto', 'ETFs', 'Commodities'].map((cat) => (
            <Chip
              key={cat}
              label={cat}
              clickable
              color={filterCategory === cat ? 'primary' : 'default'}
              onClick={() => setFilterCategory(cat)}
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #333' }}>
            <Table sx={{ minWidth: 650 }} aria-label="asset table">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'friendlyName'}
                      direction={sortConfig.key === 'friendlyName' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('friendlyName')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Asset Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortConfig.key === 'currentPrice'}
                      direction={sortConfig.key === 'currentPrice' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('currentPrice')}
                    >
                      Price
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Price Date</TableCell>
                  <TableCell align="right">ATH</TableCell>
                  <TableCell align="right">ATH Date</TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortConfig.key === 'percentBelow'}
                      direction={sortConfig.key === 'percentBelow' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('percentBelow')}
                    >
                      % Below ATH
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processedAssets.map((asset) => {
                  // Format dates
                  const priceDate = formatRelativeTime(asset.currentPriceDate);
                  const athDate = formatRelativeTime(asset.athDate);

                  return (
                    <TableRow
                      key={asset.name}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#252525' } }}
                    >
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                        {asset.friendlyName}
                      </TableCell>
                      <TableCell>
                        <Link href={asset.link} target="_blank" rel="noopener" color="inherit" underline="hover" sx={{ fontSize: '1rem' }}>
                          {asset.label} ({asset.name})
                        </Link>
                      </TableCell>
                      <TableCell>{asset.category}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>
                        ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '0.875rem', fontFamily: 'monospace' }} title={asset.currentPriceDate ? format(new Date(asset.currentPriceDate), 'yyyy-MM-dd') : ''}>
                        {priceDate}
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>
                        ${asset.ath.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '0.875rem', fontFamily: 'monospace' }} title={asset.athDate ? format(new Date(asset.athDate), 'yyyy-MM-dd') : ''}>
                        {athDate}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'text.primary', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem' }}>
                        {asset.percentBelow > 0 ? `-${asset.percentBelow.toFixed(2)}%` : '0%'}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={asset.status.label}
                          color={asset.status.color}
                          variant={asset.status.color === 'default' ? 'outlined' : 'filled'}
                          size="small"
                          sx={{
                            minWidth: 70,
                            fontWeight: 'bold',
                            color: asset.status.textColor,
                            borderColor: asset.status.color === 'default' ? '#444' : undefined
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </ThemeProvider>
  );
}
