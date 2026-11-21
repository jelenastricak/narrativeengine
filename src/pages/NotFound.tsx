import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-display tracking-widest text-foreground">404</h1>
        <p className="mb-6 text-sm text-muted-foreground font-body">Page not found</p>
        <Button variant="tactical" asChild><Link
          to="/"
          className="inline-flex items-center gap-2 btn-tactical text-sm"
        >
          <Home className="w-4 h-4" />
          Return to Home
        </Link></Button>
      </div>
    </div>
  );
};

export default NotFound;
