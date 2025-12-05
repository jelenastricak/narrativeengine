import { Database, Settings } from "lucide-react";
import logo from "@/assets/logo.png";

interface HeaderProps {
  hasModel: boolean;
}

export function Header({ hasModel }: HeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <img src={logo} alt="Narrative Engine Logo" className="w-10 h-10 invert" />
            <div>
              <h1 className="font-display text-xl tracking-[0.2em] text-foreground">
                THE NARRATIVE ENGINE
              </h1>
              <p className="text-xs text-muted-foreground font-body tracking-wide">
                Strategic Narrative Intelligence System
              </p>
            </div>
          </div>
          
          {/* Status & Controls */}
          <div className="flex items-center gap-6">
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
        </div>
      </div>
    </header>
  );
}
