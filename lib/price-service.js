import axios from 'axios';

// Helper to fetch Yahoo Finance data
// Helper to fetch Yahoo Finance data
async function fetchYahooPrice(asset) {
  try {
    const symbol = asset.name;
    const ts = Date.now();

    // Convert start_date to UNIX timestamp (Period 1)
    const p1 = Math.floor(new Date(asset.start_date || '2000-01-01').getTime() / 1000);
    // Current time (Period 2)
    const p2 = Math.floor(Date.now() / 1000);

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&period1=${p1}&period2=${p2}&ts=${ts}`;
    const response = await axios.get(url, { timeout: 10000 });
    const result = response.data.chart.result[0];

    if (!result) return null;

    const indicators = result.indicators;
    // FETCH RULE: Always use raw CLOSE for ATH per user requirement
    const prices = (indicators.quote && indicators.quote[0].close) || [];
    const timestamps = result.timestamp || [];

    // Find historical ATH and its date from the daily granularity data
    let ath = -1;
    let athIndex = -1;

    prices.forEach((price, index) => {
      if (price != null && price > ath) {
        ath = price;
        athIndex = index;
      }
    });

    const currentPrice = result.meta.regularMarketPrice;
    const currentPriceDate = new Date(result.meta.regularMarketTime * 1000).toISOString();

    let athDate = athIndex !== -1 ? new Date(timestamps[athIndex] * 1000).toISOString() : null;

    // SYNC: If current live price is higher than historical ceiling, update ATH
    if (currentPrice >= ath) {
      ath = currentPrice;
      athDate = currentPriceDate;
    }

    return { currentPrice, ath, currentPriceDate, athDate };
  } catch (error) {
    console.error(`Error fetching Yahoo data for ${asset.name}:`, error.message);
    return null;
  }
}

// Helper to fetch CoinGecko data
async function fetchCoinGeckoPrice(id) {
  try {
    const coinId = id === 'BTC' ? 'bitcoin' : id === 'ETH' ? 'ethereum' : id.toLowerCase();

    // Fetch current price and last updated time
    const priceUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_last_updated_at=true`;
    const priceRes = await axios.get(priceUrl, { timeout: 10000 });
    const priceData = priceRes.data[coinId];

    const currentPrice = priceData.usd;
    const currentPriceDate = priceData.last_updated_at
      ? new Date(priceData.last_updated_at * 1000).toISOString()
      : new Date().toISOString();

    // Fetch ATH and ATH date
    const marketUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}`;
    const marketRes = await axios.get(marketUrl, { timeout: 10000 });
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
  const CONCURRENCY_LIMIT = 5;
  const results = [];
  const queue = [...assets];

  // Worker function to process the queue
  async function worker() {
    while (queue.length > 0) {
      const asset = queue.shift();
      // If queue is empty, shift() returns undefined, so break
      if (!asset) break;

      try {
        let data = null;
        if (asset.api_source === 'yahoo') {
          data = await fetchYahooPrice(asset);
        } else if (asset.api_source === 'coingecko') {
          data = await fetchCoinGeckoPrice(asset.name);
        }

        if (data) {
          console.log(`✅ Updated ${asset.name}: $${data.currentPrice} (${data.currentPriceDate})`);
          results.push({
            ...asset,
            currentPrice: data.currentPrice,
            ath: data.ath,
            cheap: data.currentPrice < data.ath,
            currentPriceDate: data.currentPriceDate,
            athDate: data.athDate,
            percentBelow: ((data.ath - data.currentPrice) / data.ath) * 100,
            label: data.fullLabel || asset.label
          });
        } else {
          console.warn(`⚠️ Failed to fetch ${asset.name}, using stale data.`);
          results.push(asset); // Keep stale if fetch fails
        }
      } catch (error) {
        console.error(`Failed to update ${asset.name}:`, error.message);
        results.push(asset);
      }
    }
  }

  // Start workers and wait for all to finish
  const workers = Array.from({ length: CONCURRENCY_LIMIT }, worker);
  await Promise.all(workers);

  return results;
}
