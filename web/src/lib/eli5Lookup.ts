/**
 * No-LLM lookup: (topic/region) -> "Why it matters" and "Explain like I'm 5" lines.
 * Keys are lowercased; we match if headline contains any of the key tokens.
 */

export interface LookupEntry {
  whyItMatters: string;
  eli5: string;
}

// Key: space-separated tokens that trigger this entry (all must appear in headline for match)
const LOOKUP: Record<string, LookupEntry> = {
  "iran oil": {
    whyItMatters: "Mentions Iran + oil; often tied to energy prices and regional risk.",
    eli5: "A country that sells a lot of oil is in the news; that can affect gas prices and make markets nervous.",
  },
  "iran strike": {
    whyItMatters: "Iran and military strike; can move oil and risk sentiment.",
    eli5: "News about a big oil-producing country and a military attack; often affects oil prices and global tension.",
  },
  "iran response": {
    whyItMatters: "Iran response/escalation; watch for oil and MENA volatility.",
    eli5: "One side did something, the other may react; that can affect markets and energy costs.",
  },
  oil: {
    whyItMatters: "Oil in the headline; can move energy prices and inflation expectations.",
    eli5: "Something in the news could change how much we pay for gas and energy.",
  },
  sanctions: {
    whyItMatters: "Sanctions mentioned; can restrict trade and move currencies and commodities.",
    eli5: "Governments are using punishments that limit trade; that can change prices and who can buy what.",
  },
  "china taiwan": {
    whyItMatters: "China and Taiwan; can affect tech supply chains and regional risk.",
    eli5: "Tension between two places that make a lot of the world's tech; that can affect prices and supply.",
  },
  ukraine: {
    whyItMatters: "Ukraine in the headline; still drives grain, energy, and risk sentiment.",
    eli5: "News about the war in Ukraine can affect food and energy prices and how safe investors feel.",
  },
  nato: {
    whyItMatters: "NATO mentioned; relates to alliance and defense policy.",
    eli5: "Countries working together on defense; the news might be about how they respond to a threat.",
  },
};

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Find the first matching entry for headline text.
 * Match = headline contains all tokens of a key (key is space-separated).
 */
export function getWhyItMatters(headline: string): string | null {
  const tokens = new Set(tokenize(headline));
  for (const key of Object.keys(LOOKUP)) {
    const keyTokens = key.split(/\s+/);
    if (keyTokens.every((t) => tokens.has(t)))
      return LOOKUP[key]!.whyItMatters;
  }
  return null;
}

export function getEli5(headline: string): string | null {
  const tokens = new Set(tokenize(headline));
  for (const key of Object.keys(LOOKUP)) {
    const keyTokens = key.split(/\s+/);
    if (keyTokens.every((t) => tokens.has(t))) return LOOKUP[key]!.eli5;
  }
  return null;
}
