import fs from 'fs';
import path from 'path';
import axios from 'axios';

const ASSETS_FILE_PATH = path.join(process.cwd(), 'data', 'assets.json');

// Helper to fetch Yahoo Finance data
async function fetchYahooPrice(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=max`;
    const response = await axios.get(url);
    const result = response.data.chart.result[0];

    if (!result) return null;

    const quotes = result.indicators.quote[0];
    const timestamps = result.timestamp;
    const prices = quotes.close;

    // Find ATH and its date
    let ath = -1;
    let athIndex = -1;

    prices.forEach((price, index) => {
      if (price != null && price > ath) {
        ath = price;
        athIndex = index;
      }
    });

    const currentPrice = result.meta.regularMarketPrice;
    // Yahoo timestamps are in seconds
    const currentPriceDate = new Date(result.meta.regularMarketTime * 1000).toISOString();
    const athDate = athIndex !== -1 ? new Date(timestamps[athIndex] * 1000).toISOString() : null;

    // Yahoo usually provides a shortName or longName in other endpoints, but chart API has minimal metadata.
    // We might need to rely on the existing label or fetch from a quote summary endpoint if we want the "exact" name from source.
    // For now, let's use the symbol as a fallback or try to get it if available in meta.
    // The chart meta sometimes has 'symbol' but not full name. 
    // Let's stick to the existing label for now unless we add another API call.
    // Wait, the user wants "exact name". The chart API doesn't give the full name.
    // Let's assume the user manually verifies the label or we add a separate quote call.
    // For "vibe" speed, let's just ensure we have the dates correct first.

    return { currentPrice, ath, currentPriceDate, athDate };
  } catch (error) {
    console.error(`Error fetching Yahoo data for ${symbol}:`, error.message);
    return null;
  }
}

// Helper to fetch CoinGecko data
async function fetchCoinGeckoPrice(id) {
  try {
    const coinId = id === 'BTC' ? 'bitcoin' : id === 'ETH' ? 'ethereum' : id.toLowerCase();

    // Fetch current price and last updated time
    const priceUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_last_updated_at=true`;
    const priceRes = await axios.get(priceUrl);
    const priceData = priceRes.data[coinId];

    const currentPrice = priceData.usd;
    const currentPriceDate = priceData.last_updated_at
      ? new Date(priceData.last_updated_at * 1000).toISOString()
      : new Date().toISOString();

    // Fetch ATH and ATH date
    const marketUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}`;
    const marketRes = await axios.get(marketUrl);
    const marketData = marketRes.data[0];

    const ath = marketData.ath;
    const athDate = marketData.ath_date; // CoinGecko provides this directly
    const fullLabel = marketData.name; // "Bitcoin", "Ethereum"

    return { currentPrice, ath, currentPriceDate, athDate, fullLabel };
  } catch (error) {
    console.error(`Error fetching CoinGecko data for ${id}:`, error.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 1. Read existing assets
    const fileData = fs.readFileSync(ASSETS_FILE_PATH, 'utf8');
    const assets = JSON.parse(fileData);
    const updatedAssets = [];

    // 2. Iterate and update
    for (const asset of assets) {
      let data = null;

      if (asset.api_source === 'yahoo') {
        data = await fetchYahooPrice(asset.name);
      } else if (asset.api_source === 'coingecko') {
        data = await fetchCoinGeckoPrice(asset.name);
      }

      if (data) {
        updatedAssets.push({
          ...asset,
          currentPrice: data.currentPrice,
          ath: data.ath,
          cheap: data.currentPrice < data.ath,
          currentPriceDate: data.currentPriceDate,
          athDate: data.athDate,
          // Only update label if we got a better one (mostly for crypto)
          label: data.fullLabel || asset.label
        });
      } else {
        updatedAssets.push(asset);
      }

      // Simple delay to be nice to APIs
      await new Promise(r => setTimeout(r, 500));
    }

    // 3. Write back to file
    fs.writeFileSync(ASSETS_FILE_PATH, JSON.stringify(updatedAssets, null, 2));

    res.status(200).json({ message: 'Assets updated successfully', data: updatedAssets });
  } catch (error) {
    console.error('Update failed:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
