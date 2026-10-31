/** Reserved space for one in-article ad, so nothing shifts when the ad loads. */
export function AdSlot({ slot, position }: { slot: string | null; position: number }) {
  return (
    <aside
      aria-label="Advertisement"
      data-ad-position={position}
      data-ad-slot={slot ?? undefined}
      className="my-2 flex min-h-[280px] flex-col items-center justify-start gap-1 overflow-hidden rounded-lg bg-surface/50"
    >
      <span className="pt-1 text-[10px] uppercase tracking-wide text-muted">Advertisement</span>
    </aside>
  );
}