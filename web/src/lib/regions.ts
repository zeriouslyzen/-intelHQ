export type RegionCode =
  | "US"
  | "EU"
  | "APAC"
  | "SAM"
  | "MEX"
  | "RUS"
  | "CHN"
  | "MENA";

export interface RegionDef {
  id: string;
  code: RegionCode;
  name: string;
  centroidLat: number;
  centroidLon: number;
  fxPairs: string[];
  commodityTags: ("gold" | "silver" | "oil" | "chips" | "water")[];
}

export const REGIONS: RegionDef[] = [
  {
    id: "us",
    code: "US",
    name: "Americas",
    centroidLat: 39.5,
    centroidLon: -98,
    fxPairs: ["USD/EUR", "USD/JPY", "USD/GBP"],
    commodityTags: ["gold", "silver", "oil", "chips", "water"],
  },
  {
    id: "eu",
    code: "EU",
    name: "Europe",
    centroidLat: 50.5,
    centroidLon: 10,
    fxPairs: ["USD/EUR", "EUR/GBP"],
    commodityTags: ["gold", "silver", "oil", "water"],
  },
  {
    id: "apac",
    code: "APAC",
    name: "Asia-Pacific",
    centroidLat: 34,
    centroidLon: 108,
    fxPairs: ["USD/JPY", "USD/CNY"],
    commodityTags: ["gold", "silver", "oil", "chips", "water"],
  },
  {
    id: "sam",
    code: "SAM",
    name: "South America",
    centroidLat: -14.2,
    centroidLon: -51.9,
    fxPairs: ["USD/BRL", "USD/ARS", "USD/CLP"],
    commodityTags: ["gold", "silver", "oil", "water"],
  },
  {
    id: "mex",
    code: "MEX",
    name: "Mexico",
    centroidLat: 23.6,
    centroidLon: -102.5,
    fxPairs: ["USD/MXN"],
    commodityTags: ["gold", "silver", "oil", "water"],
  },
  {
    id: "rus",
    code: "RUS",
    name: "Russia",
    centroidLat: 61.5,
    centroidLon: 105.3,
    fxPairs: ["USD/RUB", "EUR/RUB"],
    commodityTags: ["gold", "silver", "oil", "water"],
  },
  {
    id: "chn",
    code: "CHN",
    name: "China",
    centroidLat: 35.9,
    centroidLon: 104.2,
    fxPairs: ["USD/CNY", "USD/CNH"],
    commodityTags: ["gold", "silver", "oil", "chips", "water"],
  },
  {
    id: "mena",
    code: "MENA",
    name: "Middle East",
    centroidLat: 26.0,
    centroidLon: 50.5,
    fxPairs: ["USD/SAR", "USD/AED", "USD/QAR"],
    commodityTags: ["gold", "silver", "oil", "water"],
  },
];

export const REGION_BY_CODE = new Map(REGIONS.map((r) => [r.code, r]));
export const REGION_BY_ID = new Map(REGIONS.map((r) => [r.id, r]));

export const COMMODITY_SYMBOLS: Record<
  string,
  { symbol: string; name: string; tag: string }
> = {
  gold: { symbol: "GC=F", name: "Gold", tag: "gold" },
  silver: { symbol: "SI=F", name: "Silver", tag: "silver" },
  brent: { symbol: "BZ=F", name: "Brent Crude", tag: "oil" },
  wti: { symbol: "CL=F", name: "WTI Crude", tag: "oil" },
  sox: { symbol: "^SOX", name: "PHLX Semiconductor", tag: "chips" },
  water: { symbol: "PHO", name: "Water Utilities ETF", tag: "water" },
};

export const REGIONAL_FX_CURRENCIES: Record<RegionCode, string[]> = {
  US: ["EUR", "JPY", "GBP", "CHF"],
  EU: ["EUR", "GBP", "CHF"],
  APAC: ["JPY", "CNY", "AUD"],
  SAM: ["BRL", "ARS", "CLP"],
  MEX: ["MXN"],
  RUS: ["RUB"],
  CHN: ["CNY"],
  MENA: ["SAR", "AED", "QAR"],
};

export type QuoteLike = { symbol: string };

export function filterFxForRegion<T extends QuoteLike>(
  quotes: T[],
  regionCode: RegionCode
): T[] {
  const region = REGION_BY_CODE.get(regionCode);
  if (!region) return [];
  const set = new Set(region.fxPairs);
  return quotes.filter((q) => set.has(q.symbol));
}

export function filterCommoditiesByRegion<T extends { tag: string }>(
  commodities: T[],
  regionCode: RegionCode
): T[] {
  const region = REGION_BY_CODE.get(regionCode);
  if (!region) return [];
  const set = new Set(region.commodityTags);
  return commodities.filter((q) => set.has(q.tag as "gold" | "silver" | "oil" | "chips" | "water"));
}
