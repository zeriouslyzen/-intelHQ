import { db } from "./db";
import type { FeedsConfig } from "./feedsConfig";
import { getDefaultFeedsConfig } from "./feedsConfig";

export { getDefaultFeedsConfig } from "./feedsConfig";

const CONFIG_NAME = "feeds";

export async function getFeedsConfig(): Promise<FeedsConfig> {
  try {
    const row = await db.layoutConfig.findFirst({
      where: { name: CONFIG_NAME },
      orderBy: { createdAt: "desc" },
    });
    if (!row?.config) return getDefaultFeedsConfig();
    const parsed = JSON.parse(row.config) as FeedsConfig;
    return {
      enabledFeedIds: Array.isArray(parsed.enabledFeedIds) ? parsed.enabledFeedIds : getDefaultFeedsConfig().enabledFeedIds,
      videoEmbedUrl: typeof parsed.videoEmbedUrl === "string" ? parsed.videoEmbedUrl : undefined,
    };
  } catch {
    return getDefaultFeedsConfig();
  }
}

export async function setFeedsConfig(config: FeedsConfig): Promise<void> {
  try {
    const existing = await db.layoutConfig.findFirst({
      where: { name: CONFIG_NAME },
      orderBy: { createdAt: "desc" },
    });
    const payload = JSON.stringify(config);
    if (existing) {
      await db.layoutConfig.update({
        where: { id: existing.id },
        data: { config: payload },
      });
    } else {
      await db.layoutConfig.create({
        data: { name: CONFIG_NAME, config: payload },
      });
    }
  } catch {
    // DB unavailable (e.g. Vercel without DATABASE_URL); no-op so UI keeps working
  }
}
