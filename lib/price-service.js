import axios from 'axios';

// Helper to fetch Yahoo Finance data
async function fetchYahooPrice(symbol) {
  try {
    const ts = Date.now();

    // FETCH 1: Max range (for long-term history)
    const urlMax = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=max&ts=${ts}`;
    // FETCH 2: 1mo range (to bridge the common 22-day lag in 'max' history)
    const url1mo = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo&ts=${ts}`;

    const [resMax, res1mo] = await Promise.all([
      axios.get(urlMax, { timeout: 10000 }),
      axios.get(url1mo, { timeout: 10000 })
    ]);

    const resultMax = resMax.data.chart.result[0];
    const result1mo = res1mo.data.chart.result[0];

    if (!resultMax || !result1mo) return null;

    // Function to find ATH in a Yahoo result
    const findATH = (result) => {
      const indicators = result.indicators;
      const adjCloseArr = indicators.adjclose && indicators.adjclose[0].adjclose;
      const prices = adjCloseArr || (indicators.quote && indicators.quote[0].close) || [];
      const timestamps = result.timestamp || [];

      let ath = -1;
      let athIndex = -1;

      prices.forEach((price, index) => {
        if (price != null && price > ath) {
          ath = price;
          athIndex = index;
        }
      });

      return {
        ath,
        athDate: athIndex !== -1 ? new Date(timestamps[athIndex] * 1000).toISOString() : null
      };
    };

    const histMax = findATH(resultMax);
    const hist1mo = findATH(result1mo);

    const currentPrice = resultMax.meta.regularMarketPrice;
    const currentPriceDate = new Date(resultMax.meta.regularMarketTime * 1000).toISOString();

    // Start with max history
    let finalAth = histMax.ath;
    let finalAthDate = histMax.athDate;

    // Compare with 1mo history (bridges the lag gap)
    if (hist1mo.ath > finalAth) {
      finalAth = hist1mo.ath;
      finalAthDate = hist1mo.athDate;
    }

    // Compare with current live price (sync for new peaks)
    if (currentPrice >= finalAth) {
      finalAth = currentPrice;
      finalAthDate = currentPriceDate;
    }

    return {
      currentPrice,
      ath: finalAth,
      currentPriceDate,
      athDate: finalAthDate
    };
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
          data = await fetchYahooPrice(asset.name);
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
