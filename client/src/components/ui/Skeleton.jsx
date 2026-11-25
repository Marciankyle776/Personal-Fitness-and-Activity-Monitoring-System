import { cn } from "../../utils/format";

export const Skeleton = ({ className }) => <div className={cn("animate-pulse rounded-lg bg-slate-200/70", className)} aria-hidden="true" />;

export const StatsSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6" role="status" aria-label="Loading">
    {Array.from({ length: count }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
  </div>
);

export const ListSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3 p-4" role="status" aria-label="Loading">
    {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-12" />)}
  </div>
);

export const CardsSkeleton = ({ count = 6 }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading">
    {Array.from({ length: count }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
  </div>
);
