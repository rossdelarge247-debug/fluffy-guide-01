"use client";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

interface SearchUser {
  id: string;
  username: string;
  displayName?: string | null;
  isFriend: boolean;
  requestSent: boolean;
  requestReceived: boolean;
}

interface UserSearchResultsProps {
  users: SearchUser[];
}

export function UserSearchResults({ users }: UserSearchResultsProps) {
  const [states, setStates] = useState<Record<string, "sent" | "error">>({});

  async function sendRequest(userId: string) {
    const res = await fetch("/api/friends/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: userId }),
    });
    if (res.ok) {
      setStates((prev) => ({ ...prev, [userId]: "sent" }));
    } else {
      setStates((prev) => ({ ...prev, [userId]: "error" }));
    }
  }

  if (users.length === 0) {
    return <p className="text-center text-stone-400 text-sm py-4">No users found</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-stone-100">
      {users.map((user) => {
        const state = states[user.id];
        const sent = state === "sent" || user.requestSent;

        return (
          <div key={user.id} className="flex items-center gap-3 py-3">
            <Avatar username={user.username} displayName={user.displayName} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-stone-900 text-sm">
                {user.displayName ?? user.username}
              </p>
              <p className="text-stone-400 text-xs">@{user.username}</p>
            </div>
            {user.isFriend ? (
              <span className="text-xs text-stone-400 font-medium">Friends</span>
            ) : user.requestReceived ? (
              <span className="text-xs text-brand-600 font-medium">Sent you a request</span>
            ) : sent ? (
              <span className="text-xs text-stone-400 font-medium">Requested</span>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => sendRequest(user.id)}>
                Add
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
