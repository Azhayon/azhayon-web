import type { Site } from "@/lib/api-types";
import type { AdRules } from "@/lib/content/ads";

export type InArticleAds = { slot: string | null; rules: AdRules };

/** The in-article ad settings, or null when ads or that placement are off or the rules make no sense. */
export function inArticleAds(ads: Site["ads"] | undefined): InArticleAds | null {
  if (!ads || ads.enabled !== true) {
    return null;
  }

  const placement = ads.placements?.in_article;
  const every = ads.rules?.in_article_every;
  const max = ads.rules?.in_article_max;

  if (!placement?.enabled || !(every > 0) || !(max > 0)) {
    return null;
  }

  const slot = placement.slot && /^\d{6,20}$/.test(placement.slot) ? placement.slot : null;

  return { slot, rules: { in_article_every: every, in_article_max: max } };
}


/** Google's own certification authority ID, the same for every AdSense publisher. */
const GOOGLE_ADS_TXT_ID = "f08c47fec0942fa0";

const PUBLISHER = /^ca-pub-(\d{16})$/;

/** The text of ads.txt, or null when ads are off or the publisher ID is not a real AdSense ID. */
export function adsTxt(ads: Site["ads"] | undefined): string | null {
  if (!ads || ads.enabled !== true || typeof ads.client !== "string") {
    return null;
  }

  const match = PUBLISHER.exec(ads.client);

  return match ? `google.com, pub-${match[1]}, DIRECT, ${GOOGLE_ADS_TXT_ID}\n` : null;
}