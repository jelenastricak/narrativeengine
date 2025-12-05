import { Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PresenceUser {
  id: string;
  email: string;
  online_at: string;
}

interface PresenceIndicatorProps {
  users: PresenceUser[];
  currentUserId: string;
  isConnected: boolean;
}

export function PresenceIndicator({ users, currentUserId, isConnected }: PresenceIndicatorProps) {
  const otherUsers = users.filter((u) => u.id !== currentUserId);
  const totalViewers = users.length;

  if (!isConnected || totalViewers === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1.5 border border-border bg-background">
            <div className="flex -space-x-2">
              {users.slice(0, 4).map((user, index) => (
                <div
                  key={user.id}
                  className={`w-6 h-6 rounded-none border border-border flex items-center justify-center text-[10px] font-mono uppercase ${
                    user.id === currentUserId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                  style={{ zIndex: 4 - index }}
                >
                  {user.email.charAt(0)}
                </div>
              ))}
              {users.length > 4 && (
                <div className="w-6 h-6 rounded-none border border-border bg-muted flex items-center justify-center text-[10px] font-mono">
                  +{users.length - 4}
                </div>
              )}
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {totalViewers} viewing
            </span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-popover border border-border p-0">
          <div className="p-3 space-y-2">
            <div className="text-xs font-display uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mb-2">
              Active Viewers
            </div>
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-2 text-sm font-mono">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className={user.id === currentUserId ? "text-primary" : "text-foreground"}>
                  {user.email}
                  {user.id === currentUserId && " (you)"}
                </span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
