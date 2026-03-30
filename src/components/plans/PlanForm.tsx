"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface Friend {
  friendshipId: string;
  friend: { id: string; username: string; displayName?: string | null };
}

interface PlanFormProps {
  friends: Friend[];
  onSubmit: (data: {
    title: string;
    description: string;
    location: string;
    date: string;
    inviteeIds: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

export function PlanForm({ friends, onSubmit, onCancel }: PlanFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [inviteeIds, setInviteeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleInvitee(id: string) {
    setInviteeIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) {
      setError("Title and date are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit({
        title,
        description,
        location,
        date,
        inviteeIds: Array.from(inviteeIds),
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="What's the plan?"
        placeholder="Pizza night, birthday drinks, beach day..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Input
        label="When?"
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <Input
        label="Where? (optional)"
        placeholder="Address or place name"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <Textarea
        label="Any details? (optional)"
        placeholder="What to bring, what to expect..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

      {friends.length > 0 && (
        <div>
          <p className="text-sm font-medium text-stone-700 mb-2">Invite friends</p>
          <div className="flex flex-col gap-2">
            {friends.map(({ friend, friendshipId }) => {
              const selected = inviteeIds.has(friend.id);
              return (
                <label
                  key={friendshipId}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                    selected ? "border-brand-300 bg-brand-50" : "border-stone-100 hover:bg-stone-50"
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selected}
                    onChange={() => toggleInvitee(friend.id)}
                  />
                  <Avatar username={friend.username} displayName={friend.displayName} size="sm" />
                  <span className="text-sm font-medium text-stone-900">
                    {friend.displayName ?? friend.username}
                  </span>
                  {selected && (
                    <span className="ml-auto text-brand-600">
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={loading}>
          Create plan
        </Button>
      </div>
    </form>
  );
}
