import { NarrativeInput } from "./NarrativeInput";

interface EmptyStateProps {
  onAnalyze: (text: string) => void;
  onLoadDemo: () => void;
  isLoading: boolean;
}

export function EmptyState({ onAnalyze, onLoadDemo, isLoading }: EmptyStateProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6 sm:mb-8 px-2 sm:px-0">
        <h2 className="font-display text-xl sm:text-2xl tracking-[0.1em] sm:tracking-[0.15em] text-foreground mb-2">
          NARRATIVE ANALYSIS
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground font-body max-w-2xl mx-auto">
          Input any text—notes, documents, updates, transcripts, market data—and the engine will extract entities, arcs, conflicts, opportunities, risks, and future scenarios.
        </p>
      </div>

      <NarrativeInput onSubmit={onAnalyze} isLoading={isLoading} />

      <div className="mt-4 sm:mt-6 text-center">
        <button
          onClick={onLoadDemo}
          className="text-xs sm:text-sm text-muted-foreground hover:text-foreground font-body underline underline-offset-4 transition-colors"
        >
          Load demo narrative model
        </button>
      </div>
    </div>
  );
}
