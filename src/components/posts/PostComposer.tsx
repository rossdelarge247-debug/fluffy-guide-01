"use client";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const MOODS = ["😊", "😂", "🥹", "😎", "🤔", "😴", "🙌", "❤️", "🔥", "👀"];
const MAX_LENGTH = 280;

interface PostComposerProps {
  username: string;
  displayName?: string | null;
  onPost: (content: string, mood: string | null) => Promise<void>;
}

export function PostComposer({ username, displayName, onPost }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const remaining = MAX_LENGTH - content.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      await onPost(content.trim(), mood);
      setContent("");
      setMood(null);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-stone-100 shadow-sm text-stone-400 text-sm hover:border-stone-200 transition-colors"
      >
        <Avatar username={username} displayName={displayName} size="sm" />
        <span>What's up?</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex flex-col gap-3"
    >
      <div className="flex gap-3">
        <Avatar username={username} displayName={displayName} size="sm" />
        <textarea
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's up?"
          rows={3}
          maxLength={MAX_LENGTH}
          className="flex-1 resize-none text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none"
        />
      </div>

      {/* Mood picker */}
      <div className="flex flex-wrap gap-1.5 ml-11">
        {MOODS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMood(mood === m ? null : m)}
            className={cn(
              "text-lg leading-none p-1 rounded-lg transition-all",
              mood === m ? "bg-brand-100 scale-110" : "hover:bg-stone-100"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between ml-11">
        <span className={cn("text-xs", remaining < 20 ? "text-red-500" : "text-stone-400")}>
          {remaining}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setOpen(false);
              setContent("");
              setMood(null);
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || remaining < 0}
            loading={loading}
          >
            Share
          </Button>
        </div>
      </div>
    </form>
  );
}
