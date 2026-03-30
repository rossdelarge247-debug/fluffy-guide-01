"use client";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

interface FriendRequestCardProps {
  requestId: string;
  sender: { id: string; username: string; displayName?: string | null };
  onAccept?: (requestId: string, friendship: unknown) => void;
  onDecline?: (requestId: string) => void;
}

export function FriendRequestCard({ requestId, sender, onAccept, onDecline }: FriendRequestCardProps) {
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);

  async function handle(action: "accept" | "decline") {
    setLoading(action);
    try {
      const res = await fetch(`/api/friends/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        if (action === "accept") onAccept?.(requestId, data.friendship);
        else onDecline?.(requestId);
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <Avatar username={sender.username} displayName={sender.displayName} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-stone-900 text-sm">
          {sender.displayName ?? sender.username}
        </p>
        <p className="text-stone-400 text-xs">@{sender.username} wants to connect</p>
      </div>
      <div className="flex gap-1.5">
        <Button
          size="sm"
          onClick={() => handle("accept")}
          loading={loading === "accept"}
          disabled={!!loading}
        >
          Accept
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handle("decline")}
          loading={loading === "decline"}
          disabled={!!loading}
        >
          Decline
        </Button>
      </div>
    </div>
  );
}
