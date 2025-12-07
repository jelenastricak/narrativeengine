import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Check, Home, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { upgradePlan, fetchSubscription } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  const plan = searchParams.get("plan") as "monthly" | "lifetime" | null;
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const processPayment = async () => {
      if (authLoading) return;
      
      if (!user) {
        toast.error("Please sign in to complete your subscription");
        navigate("/auth");
        return;
      }

      if (!plan || (plan !== "monthly" && plan !== "lifetime")) {
        toast.error("Invalid payment session");
        navigate("/pricing");
        return;
      }

      try {
        const success = await upgradePlan(plan, sessionId || undefined);
        
        if (success) {
          setIsComplete(true);
          toast.success(`Successfully upgraded to ${plan === "lifetime" ? "Lifetime" : "Pro"} plan!`);
          
          // Refresh subscription data
          await fetchSubscription();
          
          // Auto-redirect after 5 seconds
          setTimeout(() => {
            navigate("/");
          }, 5000);
        } else {
          toast.error("Failed to update subscription. Please contact support.");
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        toast.error("An error occurred. Please contact support.");
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [user, authLoading, plan, sessionId, upgradePlan, fetchSubscription, navigate]);

  if (authLoading || isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground font-mono">
            PROCESSING PAYMENT...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Payment Successful | The Narrative Engine</title>
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Link
          to="/"
          className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="w-4 h-4" />
          <span className="text-xs font-mono uppercase">Home</span>
        </Link>

        <div className="max-w-md w-full text-center">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="Narrative Engine" className="w-12 h-12 invert mb-4" />
          </div>

          {isComplete ? (
            <>
              {/* Success Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-accent mb-6">
                <Check className="w-8 h-8 text-accent" />
              </div>

              <h1 className="font-display text-xl tracking-[0.15em] text-foreground mb-4">
                PAYMENT SUCCESSFUL
              </h1>

              <p className="text-muted-foreground font-body mb-2">
                Welcome to the {plan === "lifetime" ? "Lifetime" : "Pro"} plan!
              </p>
              <p className="text-sm text-muted-foreground font-body mb-8">
                You now have unlimited access to all narrative analysis features.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => navigate("/")}
                  className="btn-hot w-full py-3 text-sm"
                >
                  Start Analyzing
                </button>
                <p className="text-xs text-muted-foreground">
                  Redirecting automatically in 5 seconds...
                </p>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display text-xl tracking-[0.15em] text-foreground mb-4">
                SOMETHING WENT WRONG
              </h1>
              <p className="text-muted-foreground font-body mb-6">
                We couldn't process your payment. Please try again or contact support.
              </p>
              <button
                onClick={() => navigate("/pricing")}
                className="btn-tactical py-3 px-6 text-sm"
              >
                Back to Pricing
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
