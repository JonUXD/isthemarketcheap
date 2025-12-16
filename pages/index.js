import React, { useState } from 'react';
import fs from 'fs';
import path from 'path';
import { fetchAssetPrices } from '../lib/price-service';
import { processAssets } from '../lib/assetHelpers';
import Layout from '../components/layout/Layout';
import CategoryFilters from '../components/market/CategoryFilters';
import AssetTable from '../components/market/AssetTable';
import { Container } from '@mui/material';

export default function Home({ assets }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'percentBelow', direction: 'desc' });

  // Process assets using helper function
  const processedAssets = React.useMemo(() => {
    return processAssets(assets, searchTerm, filterCategory, sortConfig);
  }, [assets, searchTerm, filterCategory, sortConfig]);

  return (
    <Layout
      searchProps={{
        value: searchTerm,
        onChange: (e) => setSearchTerm(e.target.value)
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <CategoryFilters
          selected={filterCategory}
          onChange={setFilterCategory}
        />
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
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 86400 seconds (24 hours)
    revalidate: 86400,
  };
}
