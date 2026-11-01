export type PreviewLink = { id: string; expires: string; signature: string };

type Query = Record<string, string | string[] | undefined>;

const ID = /^[1-9]\d{0,11}$/;
const EXPIRES = /^\d{9,12}$/;
const SIGNATURE = /^[A-Za-z0-9]{16,128}$/;

const single = (value: string | string[] | undefined): string | null => (typeof value === "string" ? value : null);

/** Returns the three values to forward unchanged, or null when the link is malformed. */
export function parsePreviewLink(id: string, query: Query): PreviewLink | null {
  const expires = single(query.expires);
  const signature = single(query.signature);

  if (!ID.test(id) || !expires || !signature || !EXPIRES.test(expires) || !SIGNATURE.test(signature)) {
    return null;
  }

  return { id, expires, signature };
}