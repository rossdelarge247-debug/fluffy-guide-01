"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { TopBar } from "@/components/layout/TopBar";
import { PostComposer } from "@/components/posts/PostComposer";
import { PostCard } from "@/components/posts/PostCard";

interface PostAuthor {
  id: string;
  username: string;
  displayName?: string | null;
}

interface Post {
  id: string;
  content: string;
  mood?: string | null;
  createdAt: string;
  author: PostAuthor;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasFriends, setHasFriends] = useState<boolean | null>(null);

  const fetchPosts = useCallback(async (cursor?: string) => {
    const url = `/api/posts${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    return data;
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [data, friendsRes] = await Promise.all([
          fetchPosts(),
          fetch("/api/friends"),
        ]);
        if (data) {
          setPosts(data.posts);
          setNextCursor(data.nextCursor);
        }
        if (friendsRes.ok) {
          const fd = await friendsRes.json();
          setHasFriends(fd.friends.length > 0);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fetchPosts]);

  async function handleLoadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchPosts(nextCursor);
      if (data) {
        setPosts((prev) => [...prev, ...data.posts]);
        setNextCursor(data.nextCursor);
      }
    } finally {
      setLoadingMore(false);
    }
  }

  async function handlePost(content: string, mood: string | null) {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, mood }),
    });
    if (res.ok) {
      const data = await res.json();
      setPosts((prev) => [data.post, ...prev]);
    }
  }

  function handleDelete(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  const userId = session?.user?.id ?? "";
  const username = session?.user?.username ?? "";
  const displayName = session?.user?.name ?? null;

  return (
    <>
      <TopBar title="Mutual" />
      <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-3">
        <PostComposer
          username={username}
          displayName={displayName}
          onPost={handlePost}
        />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            {hasFriends === false ? (
              <>
                <span className="text-4xl">👋</span>
                <p className="font-medium text-stone-700">Find your people</p>
                <p className="text-stone-400 text-sm max-w-xs">
                  Add friends to see their updates here. Head to Friends to get started.
                </p>
              </>
            ) : (
              <>
                <span className="text-4xl">✨</span>
                <p className="font-medium text-stone-700">Nothing yet</p>
                <p className="text-stone-400 text-sm">
                  Share something — your friends will see it here.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={userId}
                onDelete={handleDelete}
              />
            ))}
            {nextCursor && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="text-sm text-stone-500 hover:text-stone-700 text-center py-3 w-full"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
