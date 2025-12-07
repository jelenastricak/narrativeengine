import { useNavigate } from "react-router-dom";
import { Crown, X } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    navigate("/pricing");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative border border-border bg-background p-6 sm:p-8 max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 border border-accent mb-4">
            <Crown className="w-6 h-6 text-accent" />
          </div>
          
          <h2 className="font-display text-lg tracking-[0.15em] text-foreground mb-2">
            UPGRADE REQUIRED
          </h2>
          
          <p className="text-sm text-muted-foreground font-body mb-6">
            You've used your free analysis. Upgrade to unlock unlimited narrative analyses and all features.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="btn-hot w-full py-3 text-sm"
            >
              View Plans
            </button>
            <button
              onClick={onClose}
              className="btn-tactical w-full py-3 text-sm"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
