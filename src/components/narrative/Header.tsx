import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

interface HeaderProps {
  hasModel: boolean;
}

export function Header({ hasModel }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-4">
            <img src={logo} alt="Narrative Engine Logo" className="w-8 h-8 sm:w-10 sm:h-10 invert" />
            <div>
              <h1 className="font-display text-sm sm:text-xl tracking-[0.15em] sm:tracking-[0.2em] text-foreground">
                THE NARRATIVE ENGINE
              </h1>
              <p className="text-xs text-muted-foreground font-body tracking-wide hidden sm:block">
                Strategic Narrative Intelligence System
              </p>
            </div>
          </div>
          
          {/* Status - Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <div className={`w-2 h-2 ${hasModel ? 'bg-accent animate-pulse-hot' : 'bg-muted-foreground'}`} />
            <span className="text-xs font-mono text-muted-foreground uppercase">
              {hasModel ? 'Model Active' : 'Awaiting Input'}
            </span>
          </div>

          {/* Mobile Status */}
          <div className="flex sm:hidden items-center gap-2">
            <div className={`w-2 h-2 ${hasModel ? 'bg-accent animate-pulse-hot' : 'bg-muted-foreground'}`} />
            <span className="text-xs font-mono text-muted-foreground uppercase">
              {hasModel ? 'Active' : 'Ready'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
