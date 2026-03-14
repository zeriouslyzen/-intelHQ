export type Quote = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
};

export type CommodityQuote = Quote & { tag: string };

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
};

const COMMODITY_SYMBOLS = [
  "GC=F",
  "SI=F",
  "BZ=F",
  "CL=F",
  "^SOX",
  "PHO",
];

/** Used only when live API fails so the UI is not blank. */
const FALLBACK_INDICES: Quote[] = [
  { symbol: "^GSPC", name: "S&P 500", price: 5847, changePercent: 0.24 },
  { symbol: "^NDX", name: "NASDAQ 100", price: 21542, changePercent: 0.31 },
  { symbol: "^VIX", name: "CBOE Volatility", price: 12.85, changePercent: -2.1 },
];
const FALLBACK_FX: Quote[] = [
  { symbol: "USD/EUR", name: "USD to EUR", price: 0.92, changePercent: 0 },
  { symbol: "USD/JPY", name: "USD to JPY", price: 159.45, changePercent: 0 },
  { symbol: "USD/GBP", name: "USD to GBP", price: 0.79, changePercent: 0 },
  { symbol: "USD/CHF", name: "USD to CHF", price: 0.88, changePercent: 0 },
];
const FALLBACK_COMMODITIES: CommodityQuote[] = [
  { symbol: "GC=F", name: "Gold", price: 2650, changePercent: 0.1, tag: "gold" },
  { symbol: "SI=F", name: "Silver", price: 31.2, changePercent: -0.2, tag: "silver" },
  { symbol: "BZ=F", name: "Brent Crude", price: 82.5, changePercent: 0.5, tag: "oil" },
  { symbol: "CL=F", name: "WTI Crude", price: 78.1, changePercent: 0.3, tag: "oil" },
  { symbol: "^SOX", name: "PHLX Semiconductor", price: 5250, changePercent: 0.8, tag: "chips" },
  { symbol: "PHO", name: "Water Utilities ETF", price: 58.2, changePercent: 0.1, tag: "water" },
];
const REGIONAL_FX_FALLBACK: Quote[] = [
  ...FALLBACK_FX,
  { symbol: "USD/BRL", name: "USD to BRL", price: 5.85, changePercent: 0 },
  { symbol: "USD/MXN", name: "USD to MXN", price: 17.2, changePercent: 0 },
  { symbol: "USD/RUB", name: "USD to RUB", price: 99.5, changePercent: 0 },
  { symbol: "USD/CNY", name: "USD to CNY", price: 7.24, changePercent: 0 },
  { symbol: "USD/SAR", name: "USD to SAR", price: 3.75, changePercent: 0 },
];

type YahooQuoteResponse = {
  quoteResponse?: {
    result?: Array<{
      symbol: string;
      shortName?: string;
      longName?: string;
      regularMarketPrice?: number;
      regularMarketChangePercent?: number;
    }>;
  };
};

export async function fetchIndexQuotes(): Promise<Quote[]> {
  try {
    const symbols = ["^GSPC", "^NDX", "^VIX"];
    const url =
      "https://query1.finance.yahoo.com/v7/finance/quote?symbols=" +
      encodeURIComponent(symbols.join(","));

    const res = await fetch(url, {
      next: { revalidate: 30 },
      headers: BROWSER_HEADERS,
    });
    if (!res.ok) return FALLBACK_INDICES;

    const data = (await res.json()) as YahooQuoteResponse;
    const result = data.quoteResponse?.result ?? [];
    const out = result
      .map((q) => ({
        symbol: q.symbol,
        name: q.shortName ?? q.longName ?? q.symbol,
        price: q.regularMarketPrice ?? 0,
        changePercent: q.regularMarketChangePercent ?? 0,
      }))
      .filter((q) => q.price !== 0);
    return out.length > 0 ? out : FALLBACK_INDICES;
  } catch {
    return FALLBACK_INDICES;
  }
}

type FrankfurterRates = { rates?: Record<string, number> };

export async function fetchFxSnapshot(): Promise<Quote[]> {
  try {
    const url =
      "https://api.frankfurter.app/latest?from=USD&to=EUR,JPY,GBP,CHF";
    const res = await fetch(url, {
      next: { revalidate: 120 },
      headers: BROWSER_HEADERS,
    });
    if (!res.ok) return FALLBACK_FX;

    const data = (await res.json()) as FrankfurterRates & { base?: string };
    const rates = data.rates ?? {};
    const base = data.base ?? "USD";
    const out = Object.entries(rates).map(([ccy, rate]) => ({
      symbol: `${base}/${ccy}`,
      name: `${base} to ${ccy}`,
      price: rate,
      changePercent: 0,
    }));
    return out.length > 0 ? out : FALLBACK_FX;
  } catch {
    return FALLBACK_FX;
  }
}

export async function fetchCommodities(): Promise<CommodityQuote[]> {
  try {
    const url =
      "https://query1.finance.yahoo.com/v7/finance/quote?symbols=" +
      encodeURIComponent(COMMODITY_SYMBOLS.join(","));
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: BROWSER_HEADERS,
    });
    if (!res.ok) return FALLBACK_COMMODITIES;
    const data = (await res.json()) as YahooQuoteResponse;
    const result = data.quoteResponse?.result ?? [];
    const tagBySymbol: Record<string, string> = {
      "GC=F": "gold",
      "SI=F": "silver",
      "BZ=F": "oil",
      "CL=F": "oil",
      "^SOX": "chips",
      PHO: "water",
    };
    const out = result
      .map((q) => ({
        symbol: q.symbol,
        name: q.shortName ?? q.longName ?? q.symbol,
        price: q.regularMarketPrice ?? 0,
        changePercent: q.regularMarketChangePercent ?? 0,
        tag: tagBySymbol[q.symbol] ?? "commodity",
      }))
      .filter((q) => q.price !== 0) as CommodityQuote[];
    return out.length > 0 ? out : FALLBACK_COMMODITIES;
  } catch {
    return FALLBACK_COMMODITIES;
  }
}

export async function fetchAllRegionalFx(): Promise<Quote[]> {
  try {
    const to =
      "EUR,JPY,GBP,CHF,BRL,ARS,CLP,MXN,RUB,CNY,SAR,AED,QAR";
    const url = `https://api.frankfurter.app/latest?from=USD&to=${to}`;
    const res = await fetch(url, {
      next: { revalidate: 120 },
      headers: BROWSER_HEADERS,
    });
    if (!res.ok) return REGIONAL_FX_FALLBACK;
    const data = (await res.json()) as FrankfurterRates & { base?: string };
    const rates = data.rates ?? {};
    const base = data.base ?? "USD";
    const out = Object.entries(rates).map(([ccy, rate]) => ({
      symbol: `${base}/${ccy}`,
      name: `${base} to ${ccy}`,
      price: rate,
      changePercent: 0,
    }));
    return out.length > 0 ? out : REGIONAL_FX_FALLBACK;
  } catch {
    return REGIONAL_FX_FALLBACK;
  }
}
