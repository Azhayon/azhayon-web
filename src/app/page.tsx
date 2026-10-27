import { ApiImage } from "@/components/ApiImage";
import { getPosts, getSite } from "@/lib/api/endpoints";

const SWATCHES = [
  { name: "canvas", className: "bg-canvas" },
  { name: "surface", className: "bg-surface" },
  { name: "raised", className: "bg-raised" },
  { name: "line", className: "bg-line" },
  { name: "fg", className: "bg-fg" },
  { name: "muted", className: "bg-muted" },
  { name: "accent", className: "bg-accent" },
  { name: "cyan", className: "bg-cyan" },
];

export default async function Home() {
  const [site, latest] = await Promise.all([getSite(), getPosts({ per_page: 1 })]);
  const post = latest.data[0];

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <section>
        <h1 className="text-4xl font-bold tracking-tight">{site.data.name}</h1>
        <p className="mt-2 text-muted">{site.data.tagline}</p>
        <p className="mt-4 text-sm text-muted">
          Sections: {site.data.categories.map((category) => category.name).join(", ") || "none yet"}
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Theme tokens</h2>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SWATCHES.map((swatch) => (
            <li key={swatch.name} className="overflow-hidden rounded-lg border border-line">
              <div className={`h-12 ${swatch.className}`} />
              <p className="bg-surface px-2 py-1 text-xs text-muted">{swatch.name}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Image loader check</h2>
        {post?.image ? (
          <figure className="mt-3 max-w-xl">
            <ApiImage image={post.image} sizes="(min-width: 640px) 576px, 100vw" className="h-auto w-full rounded-lg" />
            <figcaption className="mt-2 text-sm text-muted">{post.title}</figcaption>
          </figure>
        ) : (
          <p className="mt-3 text-sm text-muted">The newest post has no featured image yet.</p>
        )}
      </section>
    </main>
  );
}