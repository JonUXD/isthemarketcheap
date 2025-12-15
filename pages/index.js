import React, { useState, useContext } from 'react';
import { intervalToDuration, format, formatDistanceToNow } from 'date-fns';
import fs from 'fs';
import path from 'path';
import { fetchAssetPrices } from '../lib/price-service';
import Layout from '../components/Layout';
import { useTheme } from '@mui/material/styles';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Link,
  Stack,
  TableSortLabel,
} from '@mui/material';

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

export default function Home({ assets }) {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'percentBelow', direction: 'desc' });

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
    <Layout
      searchProps={{
        value: searchTerm,
        onChange: (e) => setSearchTerm(e.target.value)
      }}
    >
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

        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
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
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'action.hover' } }}
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
                          borderColor: asset.status.color === 'default' ? 'divider' : undefined
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Layout>
  );
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'data', 'assets.json');
  const fileData = fs.readFileSync(filePath, 'utf8');
  const assets = JSON.parse(fileData);

  // Fetch updated prices at build time / revalidation time
  const updatedAssets = await fetchAssetPrices(assets);

  return {
    props: {
      assets: updatedAssets,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 86400 seconds (24 hours)
    revalidate: 86400,
  };
}
