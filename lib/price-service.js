import axios from 'axios';

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

export async function fetchAssetPrices(assets) {
  const updatedAssets = [];

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
        label: data.fullLabel || asset.label
      });
    } else {
      updatedAssets.push(asset);
    }

    // Slight delay to be polite to APIs during build
    await new Promise(r => setTimeout(r, 200));
  }

  return updatedAssets;
}
