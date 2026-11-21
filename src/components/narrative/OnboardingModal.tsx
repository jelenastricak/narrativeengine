import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { ChevronRight, ChevronLeft, FileText, Users, GitBranch, AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: FileText,
    title: "INPUT ANY TEXT",
    description: "Paste notes, documents, transcripts, reports, or any narrative text. The engine analyzes it to extract strategic intelligence.",
  },
  {
    icon: Users,
    title: "DISCOVER ENTITIES",
    description: "Identify key players, their roles, goals, motivations, fears, and relationships. Understand who matters and why.",
  },
  {
    icon: GitBranch,
    title: "TRACK STORY ARCS",
    description: "See active narrative arcs and their stages—from rising action to decision nodes. Know where the story is heading.",
  },
  {
    icon: AlertTriangle,
    title: "IDENTIFY CONFLICTS & RISKS",
    description: "Uncover hidden tensions, pressure points, and potential risks before they escalate. Strategic foresight in action.",
  },
  {
    icon: Lightbulb,
    title: "SPOT OPPORTUNITIES",
    description: "Find actionable opportunities with clear conditions and required actions. Turn insights into strategic advantage.",
  },
  {
    icon: TrendingUp,
    title: "EXPLORE FUTURE SCENARIOS",
    description: "See hypothetical future paths, qualitative likelihoods, and domino effects. Anticipate what could happen next and prepare accordingly.",
  },
];

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => { if (isOpen) setCurrentStep(0); }, [isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="p-0 gap-0 max-w-lg">
        {/* Progress bar */}
        <div className="h-1 bg-border">
          <div 
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Step indicator */}
          <div className="text-xs text-muted-foreground font-mono mb-6 text-center">
            STEP {currentStep + 1} OF {steps.length}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 border border-accent flex items-center justify-center">
              <Icon className="w-8 h-8 text-accent" />
            </div>
          </div>

          {/* Title */}
          <DialogTitle className="font-display text-lg tracking-[0.15em] text-foreground text-center mb-4">
            {step.title}
          </DialogTitle>

          {/* Description */}
          <DialogDescription className="text-sm text-muted-foreground font-body text-center leading-relaxed mb-8">
            {step.description}
          </DialogDescription>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 text-xs font-mono transition-colors ${
                currentStep === 0 
                  ? 'text-muted-foreground/50 cursor-not-allowed' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex gap-1">
              {steps.map((_, idx) => (
                <Button variant="ghost"
                  size="icon"
                  aria-label={`Tutorial step ${idx + 1}`}
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-5 h-5 transition-colors ${
                    idx === currentStep ? 'bg-accent' : 'bg-border hover:bg-muted-foreground'
                  }`}
                />
              ))}
            </div>

            <Button variant="ghost"
              onClick={handleNext}
              className="btn-hot flex items-center gap-1 px-4 py-2 text-xs"
            >
              {isLastStep ? "Get Started" : "Next"}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Skip button */}
        <div className="border-t border-border p-4 text-center">
          <Button variant="ghost"
            onClick={handleSkip}
            className="text-xs text-muted-foreground hover:text-foreground font-body underline underline-offset-4 transition-colors"
          >
            Skip tutorial
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
