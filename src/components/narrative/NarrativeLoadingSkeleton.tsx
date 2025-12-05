import { Skeleton } from "@/components/ui/skeleton";

export function NarrativeLoadingSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Summary Skeleton */}
      <div className="border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-4 w-4 bg-muted" />
          <Skeleton className="h-4 w-40 bg-muted" />
        </div>
        <Skeleton className="h-4 w-full bg-muted mb-2" />
        <Skeleton className="h-4 w-3/4 bg-muted" />
      </div>

      {/* Entities Skeleton */}
      <section>
        <div className="flex items-center gap-3 mb-4 border-b border-border pb-2">
          <Skeleton className="h-5 w-5 bg-muted" />
          <Skeleton className="h-5 w-24 bg-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border p-4">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-12 w-12 bg-muted" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 bg-muted mb-2" />
                  <Skeleton className="h-3 w-16 bg-muted" />
                </div>
              </div>
              <Skeleton className="h-3 w-full bg-muted mb-2" />
              <Skeleton className="h-3 w-2/3 bg-muted" />
            </div>
          ))}
        </div>
      </section>

      {/* Arcs Skeleton */}
      <section>
        <div className="flex items-center gap-3 mb-4 border-b border-border pb-2">
          <Skeleton className="h-5 w-5 bg-muted" />
          <Skeleton className="h-5 w-32 bg-muted" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-32 bg-muted" />
                <Skeleton className="h-5 w-20 bg-muted" />
              </div>
              <Skeleton className="h-2 w-full bg-muted mb-3" />
              <Skeleton className="h-3 w-full bg-muted mb-2" />
              <Skeleton className="h-3 w-1/2 bg-muted" />
            </div>
          ))}
        </div>
      </section>

      {/* Conflicts Skeleton */}
      <section>
        <div className="flex items-center gap-3 mb-4 border-b border-border pb-2">
          <Skeleton className="h-5 w-5 bg-accent/30" />
          <Skeleton className="h-5 w-24 bg-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="border border-accent/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-28 bg-accent/20" />
                <Skeleton className="h-5 w-16 bg-accent/20" />
              </div>
              <Skeleton className="h-3 w-full bg-muted mb-2" />
              <Skeleton className="h-3 w-3/4 bg-muted" />
            </div>
          ))}
        </div>
      </section>

      {/* Opportunities & Risks Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center gap-3 mb-4 border-b border-border pb-2">
            <Skeleton className="h-5 w-5 bg-muted" />
            <Skeleton className="h-5 w-28 bg-muted" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="border border-border p-4">
                <Skeleton className="h-4 w-32 bg-muted mb-2" />
                <Skeleton className="h-3 w-full bg-muted" />
              </div>
            ))}
          </div>
        </section>
        <section>
          <div className="flex items-center gap-3 mb-4 border-b border-border pb-2">
            <Skeleton className="h-5 w-5 bg-muted" />
            <Skeleton className="h-5 w-16 bg-muted" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="border border-border p-4">
                <Skeleton className="h-4 w-28 bg-muted mb-2" />
                <Skeleton className="h-3 w-full bg-muted" />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Scenarios Skeleton */}
      <section>
        <div className="flex items-center gap-3 mb-4 border-b border-border pb-2">
          <Skeleton className="h-5 w-5 bg-muted" />
          <Skeleton className="h-5 w-36 bg-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-24 bg-muted" />
                <Skeleton className="h-5 w-14 bg-muted" />
              </div>
              <Skeleton className="h-3 w-full bg-muted mb-2" />
              <Skeleton className="h-3 w-2/3 bg-muted" />
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Action Skeleton */}
      <div className="border-2 border-accent/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-5 w-5 bg-accent/30" />
          <Skeleton className="h-5 w-44 bg-accent/30" />
        </div>
        <Skeleton className="h-4 w-full bg-muted mb-2" />
        <Skeleton className="h-4 w-3/4 bg-muted" />
      </div>

      {/* Loading indicator */}
      <div className="flex items-center justify-center gap-3 py-4">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Analyzing Narrative Intelligence
        </span>
      </div>
    </div>
  );
}
