import { Database, Settings, Menu, X } from "lucide-react";
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
          
          {/* Status & Controls - Desktop */}
          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 ${hasModel ? 'bg-accent animate-pulse-hot' : 'bg-muted-foreground'}`} />
              <span className="text-xs font-mono text-muted-foreground uppercase">
                {hasModel ? 'Model Active' : 'Awaiting Input'}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 border border-border hover:border-foreground transition-colors">
                <Database className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="p-2 border border-border hover:border-foreground transition-colors">
                <Settings className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <div className={`w-2 h-2 ${hasModel ? 'bg-accent animate-pulse-hot' : 'bg-muted-foreground'}`} />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-border"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Menu className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-3 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground uppercase">
              {hasModel ? 'Model Active' : 'Awaiting Input'}
            </span>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-border hover:border-foreground transition-colors">
                <Database className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="p-2 border border-border hover:border-foreground transition-colors">
                <Settings className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
