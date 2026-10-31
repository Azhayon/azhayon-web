import type { MetadataRoute } from "next";
import { serverEnv } from "@/lib/env";
import { buildRobots } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const env = serverEnv();

  return buildRobots(env.siteUrl, env.allowIndexing);
}