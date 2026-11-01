import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostView } from "@/components/posts/PostView";
import { getPostPreview } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/http";
import { parsePreviewLink } from "@/lib/preview";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Static on purpose: the preview must never trigger a second API call just for metadata. */
export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const expiry = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

function Problem() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
      <h1 className="font-heading text-2xl font-extrabold">This preview link doesn&apos;t work</h1>
      <p className="mt-3 text-muted">
        It may have expired (links last one hour) or been changed. Open Preview again from the admin to get a new one.
      </p>
    </main>
  );
}

export default async function PreviewPage({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const link = parsePreviewLink(id, query);

  if (!link) {
    return <Problem />;
  }

  let preview;

  try {
    preview = await getPostPreview(link);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        notFound();
      }

      if (error.status === 403) {
        return <Problem />;
      }
    }

    throw error;
  }

  const { status, expires_at } = preview.meta.preview;

  return (
    <>
      <div role="status" className="sticky top-0 z-50 bg-raised px-4 py-2 text-center text-sm text-fg">
        <strong className="uppercase tracking-wide">Preview</strong>
        {` \u00b7 ${status} \u00b7 link valid until `}
        <time dateTime={expires_at}>{expiry.format(new Date(expires_at))} UTC</time>
        {" \u00b7 not visible to the public"}
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <PostView post={preview.data} />
      </main>
    </>
  );
}