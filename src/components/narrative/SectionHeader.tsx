import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  count?: number;
  className?: string;
  hot?: boolean;
}

export function SectionHeader({ title, count, className, hot }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between border-b border-border pb-3 mb-6", className)}>
      <h2 className={cn(
        "font-display text-lg tracking-[0.2em] uppercase",
        hot ? "text-accent" : "text-foreground"
      )}>
        {title}
      </h2>
      {count !== undefined && (
        <span className="font-mono text-sm text-muted-foreground">
          [{String(count).padStart(2, '0')}]
        </span>
      )}
    </div>
  );
}
