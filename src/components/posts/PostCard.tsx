"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { timeAgo } from "@/lib/utils";

interface PostAuthor {
  id: string;
  username: string;
  displayName?: string | null;
}

interface Post {
  id: string;
  content: string;
  mood?: string | null;
  createdAt: string | Date;
  author: PostAuthor;
}

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onDelete?: (id: string) => void;
}

export function PostCard({ post, currentUserId, onDelete }: PostCardProps) {
  const [deleting, setDeleting] = useState(false);
  const isOwn = post.author.id === currentUserId;

  async function handleDelete() {
    if (!onDelete || deleting) return;
    setDeleting(true);
    try {
      await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      onDelete(post.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
      <div className="flex gap-3">
        <Avatar
          username={post.author.username}
          displayName={post.author.displayName}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-semibold text-stone-900 text-sm">
                {post.author.displayName ?? post.author.username}
              </span>
              <span className="text-stone-400 text-xs ml-1.5">@{post.author.username}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-stone-400 text-xs whitespace-nowrap">
                {timeAgo(post.createdAt)}
              </span>
              {isOwn && onDelete && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-stone-300 hover:text-red-400 transition-colors p-1 -mr-1 rounded-lg"
                  aria-label="Delete post"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="mt-1.5 flex items-start gap-2">
            {post.mood && <span className="text-xl leading-none mt-0.5">{post.mood}</span>}
            <p className="text-stone-800 text-sm leading-relaxed whitespace-pre-wrap break-words">
              {post.content}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
