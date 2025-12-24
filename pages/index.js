import React, { useState, useEffect } from 'react';
import fs from 'fs';
import path from 'path';
import { fetchAssetPrices } from '../lib/price-service';
import { processAssets } from '../lib/assetHelpers';
import Layout from '../components/layout/Layout';
import CategoryFilters from '../components/market/CategoryFilters';
import AssetTable from '../components/market/AssetTable';
import { Container, Box, Typography } from '@mui/material';

export default function Home({ assets, lastRefreshed }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'percentBelow', direction: 'desc' });

  // Hydration fix for client-side time
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Process assets using helper function
  const processedAssets = React.useMemo(() => {
    return processAssets(assets, searchTerm, filterCategory, sortConfig);
  }, [assets, searchTerm, filterCategory, sortConfig]);

  return (
    <Layout
      lastRefreshed={lastRefreshed}
      searchProps={{
        value: searchTerm,
        onChange: (e) => setSearchTerm(e.target.value)
      }}
    >
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3, // Moved margin here from CategoryFilters
          flexWrap: 'wrap',
          gap: 2
        }}>
          <CategoryFilters
            selected={filterCategory}
            onChange={setFilterCategory}
          />
          {lastRefreshed && isMounted && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontFamily: 'monospace',
                fontWeight: 500,
                height: 'fit-content' // Ensures it doesn't stretch
              }}
            >
              Last refreshed: {new Date(lastRefreshed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          )}
        </Box>
        <AssetTable
          assets={processedAssets}
          sortConfig={sortConfig}
          onSort={setSortConfig}
        />
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
      lastRefreshed: new Date().toISOString(),
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 86400 seconds (24 hours)
    revalidate: 14400,
  };
}
