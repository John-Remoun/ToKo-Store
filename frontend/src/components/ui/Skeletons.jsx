export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <SkeletonBlock className="aspect-[3/4] w-full rounded-2xl" />
      <SkeletonBlock className="h-4 w-3/4" />
      <SkeletonBlock className="h-4 w-1/3" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <SkeletonBlock className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function LineSkeleton({ className = 'h-4 w-full' }) {
  return <SkeletonBlock className={className} />;
}
