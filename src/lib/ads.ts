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