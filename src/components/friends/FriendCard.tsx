"use client";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

interface FriendCardProps {
  friendshipId: string;
  friend: { id: string; username: string; displayName?: string | null };
  onUnfriend?: (friendshipId: string) => void;
}

export function FriendCard({ friendshipId, friend, onUnfriend }: FriendCardProps) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleUnfriend() {
    if (!onUnfriend) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, { method: "DELETE" });
      if (res.ok) onUnfriend(friendshipId);
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <Avatar username={friend.username} displayName={friend.displayName} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-stone-900 text-sm">
          {friend.displayName ?? friend.username}
        </p>
        <p className="text-stone-400 text-xs">@{friend.username}</p>
      </div>
      {onUnfriend && !confirm && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirm(true)}
          className="text-stone-400 text-xs"
        >
          Remove
        </Button>
      )}
      {confirm && (
        <div className="flex gap-1.5">
          <Button variant="danger" size="sm" onClick={handleUnfriend} loading={loading}>
            Unfriend
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
