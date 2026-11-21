import { Download, FileJson, Plus, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { NarrativeModel } from "@/types/narrative";
import { exportToJSON, exportToPDF } from "@/utils/exportAnalysis";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AnalysisToolbarProps {
  model: NarrativeModel;
  isDemo?: boolean;
  canDelete: boolean;
  onDelete: () => void;
  onNew: () => void;
  onAddUpdates: () => void;
}

const itemClass = "px-3 py-2 text-xs font-mono rounded-none cursor-pointer flex items-center gap-2";

export function AnalysisToolbar({ model, isDemo, canDelete, onDelete, onNew, onAddUpdates }: AnalysisToolbarProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(model, null, 2));
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const handlePdf = async () => {
    try {
      await exportToPDF(model);
    } catch {
      toast.error("PDF export failed. Please try again.");
    }
  };

  return (
    <div className="mb-6 sm:mb-8 border-b border-border pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-display uppercase tracking-widest text-muted-foreground">
            {isDemo ? "Demo Narrative Model · Sample data" : "Active Narrative Model"}
          </span>
          <p className="text-xs sm:text-sm text-foreground font-mono">
            {model.entities.length} entities • {model.current_arcs.length} arcs • {model.conflicts.length} conflicts
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="btn-hot flex items-center gap-1 sm:gap-2 text-xs sm:text-sm" title="Download Analysis">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border-border rounded-none min-w-[140px] p-0">
              <DropdownMenuItem onSelect={handleCopy} className={itemClass}>
                <Copy className="w-3 h-3" />
                Copy JSON
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => exportToJSON(model)} className={itemClass}>
                <FileJson className="w-3 h-3" />
                JSON File
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handlePdf} className={itemClass}>
                <Download className="w-3 h-3" />
                PDF File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost"
                  className="btn-tactical flex items-center gap-1 sm:gap-2 text-destructive hover:bg-destructive/10 text-xs sm:text-sm"
                  title="Delete Analysis"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-background border-border max-w-[calc(100vw-2rem)] sm:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display tracking-widest text-sm sm:text-base">DELETE ANALYSIS</AlertDialogTitle>
                  <AlertDialogDescription className="font-body text-xs sm:text-sm">
                    This action cannot be undone. This will permanently delete this narrative analysis from your history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="btn-tactical">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="btn-hot">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button variant="ghost" onClick={onNew} className="btn-tactical text-xs sm:text-sm">
            New
          </Button>
          <Button variant="ghost" onClick={onAddUpdates} className="btn-hot flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Updates</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
