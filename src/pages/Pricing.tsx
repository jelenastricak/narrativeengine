import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Check, Crown, Zap, Star, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import logo from "@/assets/logo.png";

// Stripe Payment Links
const STRIPE_MONTHLY_LINK = "https://buy.stripe.com/aFacN5eBn4pR5Dg0oY48006";
const STRIPE_LIFETIME_LINK = "https://buy.stripe.com/YOUR_LIFETIME_LINK";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, isLoading } = useSubscription();

  const handleSubscribe = (link: string) => {
    // Append user email and success/cancel URLs if user is logged in
    const params = new URLSearchParams();
    if (user?.email) {
      params.set("prefilled_email", user.email);
    }
    params.set("success_url", `${window.location.origin}/pricing?success=true`);
    params.set("cancel_url", `${window.location.origin}/pricing?canceled=true`);
    
    const url = link.includes("?") 
      ? `${link}&${params.toString()}`
      : `${link}?${params.toString()}`;
    
    window.open(url, "_blank");
  };

  const currentPlan = subscription?.plan || "free";

  return (
    <>
      <Helmet>
        <title>Pricing | The Narrative Engine</title>
        <meta name="description" content="Choose your plan for The Narrative Engine - strategic narrative intelligence system." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs font-mono uppercase">Back</span>
              </button>
              <div className="flex items-center gap-3">
                <img src={logo} alt="The Narrative Engine" className="h-6 w-6" />
                <span className="font-display text-sm tracking-[0.2em] text-foreground">
                  PRICING
                </span>
              </div>
              <div className="w-16" /> {/* Spacer for centering */}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 py-12">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="font-display text-2xl sm:text-3xl tracking-[0.15em] text-foreground mb-4">
              CHOOSE YOUR PLAN
            </h1>
            <p className="text-muted-foreground font-body max-w-xl mx-auto">
              Unlock the full potential of strategic narrative intelligence.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className={`border ${currentPlan === "free" ? "border-foreground" : "border-border"} p-6 flex flex-col`}>
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-muted-foreground" />
                <span className="font-display text-sm tracking-[0.15em]">FREE</span>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-display">$0</span>
                <span className="text-muted-foreground font-body">/forever</span>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-2 text-sm font-body">
                  <Check className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                  <span>1 narrative analysis</span>
                </li>
                <li className="flex items-start gap-2 text-sm font-body text-muted-foreground">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Full entity & arc extraction</span>
                </li>
                <li className="flex items-start gap-2 text-sm font-body text-muted-foreground">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Export to JSON & PDF</span>
                </li>
              </ul>
              {currentPlan === "free" && (
                <div className="py-3 text-center border border-foreground">
                  <span className="text-xs font-mono uppercase">Current Plan</span>
                </div>
              )}
            </div>

            {/* Monthly */}
            <div className={`border-2 ${currentPlan === "monthly" ? "border-foreground" : "border-accent"} p-6 flex flex-col relative`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent px-3 py-1">
                <span className="text-xs font-mono uppercase text-accent-foreground">Popular</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-accent" />
                <span className="font-display text-sm tracking-[0.15em]">MONTHLY</span>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-display">$5.99</span>
                <span className="text-muted-foreground font-body">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-2 text-sm font-body">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Unlimited analyses</span>
                </li>
                <li className="flex items-start gap-2 text-sm font-body">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Incremental updates</span>
                </li>
                <li className="flex items-start gap-2 text-sm font-body">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Full history access</span>
                </li>
                <li className="flex items-start gap-2 text-sm font-body">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>File upload support</span>
                </li>
                <li className="flex items-start gap-2 text-sm font-body">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Cancel anytime</span>
                </li>
              </ul>
              {currentPlan === "monthly" ? (
                <div className="py-3 text-center border border-foreground">
                  <span className="text-xs font-mono uppercase">Current Plan</span>
                </div>
              ) : (
                <button
                  onClick={() => handleSubscribe(STRIPE_MONTHLY_LINK)}
                  disabled={isLoading}
                  className="btn-hot py-3 w-full text-sm"
                >
                  Subscribe Monthly
                </button>
              )}
            </div>

            {/* Lifetime */}
            <div className={`border ${currentPlan === "lifetime" ? "border-foreground" : "border-border"} p-6 flex flex-col`}>
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-yellow-500" />
                <span className="font-display text-sm tracking-[0.15em]">LIFETIME</span>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-display">$24.99</span>
                <span className="text-muted-foreground font-body">/once</span>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-2 text-sm font-body">
                  <Check className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <span>Unlimited analyses forever</span>
                </li>
                <li className="flex items-start gap-2 text-sm font-body">
                  <Check className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <span>All features included</span>
                </li>
                <li className="flex items-start gap-2 text-sm font-body">
                  <Check className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-2 text-sm font-body">
                  <Check className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <span>Future updates included</span>
                </li>
                <li className="flex items-start gap-2 text-sm font-body">
                  <Check className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <span>One-time payment</span>
                </li>
              </ul>
              {currentPlan === "lifetime" ? (
                <div className="py-3 text-center border border-foreground">
                  <span className="text-xs font-mono uppercase">Current Plan</span>
                </div>
              ) : (
                <button
                  onClick={() => handleSubscribe(STRIPE_LIFETIME_LINK)}
                  disabled={isLoading}
                  className="btn-tactical py-3 w-full text-sm"
                >
                  Get Lifetime Access
                </button>
              )}
            </div>
          </div>

          {/* FAQ or Note */}
          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground font-body max-w-md mx-auto">
              After payment, return to this page and refresh to see your updated plan status.
              Payments are securely processed via Stripe.
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default Pricing;
