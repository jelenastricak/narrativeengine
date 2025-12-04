import { FileText } from "lucide-react";

interface NarrativeSummaryProps {
  summary: string;
}

export function NarrativeSummary({ summary }: NarrativeSummaryProps) {
  return (
    <div className="border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-5 h-5 text-muted-foreground" />
        <span className="font-display text-sm uppercase tracking-widest text-muted-foreground">
          Narrative Summary
        </span>
      </div>
      <p className="text-foreground font-body leading-relaxed">
        {summary}
      </p>
    </div>
  );
}
