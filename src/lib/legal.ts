import { SITE_NAME } from "@/lib/site";

/** The details every information page uses. Change them here, in one place. */
export const OPERATOR = {
  site: SITE_NAME,
  owner: "Md. Azizul Hakim Ayon",
  contactEmail: "hello@azhayonmedia.com",
  /** Change this whenever the Privacy, Terms or Cookies text changes. */
  lastUpdated: "2026-10-31T00:00:00Z",
} as const;

export const CONTACT_HREF = `mailto:${OPERATOR.contactEmail}`;