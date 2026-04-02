/**
 * Spot crypto & stablecoin quotes via CoinGecko public API (no key).
 * Rates: ~10–30 calls/min on free tier — keep revalidate reasonable.
 */

export type CryptoQuote = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
};

type CoinGeckoRow = {
  usd?: number;
  usd_24h_change?: number;
};

type CoinGeckoResponse = Record<string, CoinGeckoRow>;

const IDS: { id: string; symbol: string; name: string }[] = [
  { id: "tether", symbol: "USDT", name: "Tether" },
  { id: "usd-coin", symbol: "USDC", name: "USD Coin" },
  { id: "dai", symbol: "DAI", name: "Dai" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
];

export async function fetchCryptoQuotes(): Promise<CryptoQuote[]> {
  const ids = IDS.map((x) => x.id).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 45 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as CoinGeckoResponse;
    return IDS.map(({ id, symbol, name }) => {
      const row = data[id];
      const price = row?.usd ?? 0;
      const changePercent = row?.usd_24h_change ?? 0;
      return { symbol, name, price, changePercent };
    }).filter((q) => q.price > 0);
  } catch {
    return [];
  }
}
