function CardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface" aria-hidden="true">
      <div className="aspect-video animate-pulse bg-raised" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-raised" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-raised" />
        <div className="h-3 w-full animate-pulse rounded bg-raised" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-raised" />
      </div>
    </div>
  );
}

export function ListingSkeleton({ title }: { title: string }) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8" aria-busy="true">
      <h1 className="font-heading text-3xl font-extrabold">{title}</h1>
      <p className="sr-only" role="status">
        Loading
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}