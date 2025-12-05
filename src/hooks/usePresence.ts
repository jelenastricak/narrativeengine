import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface PresenceUser {
  id: string;
  email: string;
  online_at: string;
}

interface PresenceState {
  users: PresenceUser[];
  isConnected: boolean;
}

export function usePresence(analysisId: string | null, userId: string | null, userEmail: string | null) {
  const [presence, setPresence] = useState<PresenceState>({
    users: [],
    isConnected: false,
  });
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!analysisId || !userId || !userEmail) {
      setPresence({ users: [], isConnected: false });
      return;
    }

    const roomChannel = supabase.channel(`analysis:${analysisId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    roomChannel
      .on("presence", { event: "sync" }, () => {
        const state = roomChannel.presenceState();
        const users: PresenceUser[] = [];
        
        Object.keys(state).forEach((key) => {
          const presences = state[key] as any[];
          presences.forEach((p) => {
            users.push({
              id: p.user_id,
              email: p.email,
              online_at: p.online_at,
            });
          });
        });
        
        setPresence({ users, isConnected: true });
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("User joined:", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("User left:", key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") return;
        
        await roomChannel.track({
          user_id: userId,
          email: userEmail,
          online_at: new Date().toISOString(),
        });
      });

    setChannel(roomChannel);

    return () => {
      roomChannel.unsubscribe();
    };
  }, [analysisId, userId, userEmail]);

  const leaveRoom = async () => {
    if (channel) {
      await channel.untrack();
    }
  };

  return { presence, leaveRoom };
}
