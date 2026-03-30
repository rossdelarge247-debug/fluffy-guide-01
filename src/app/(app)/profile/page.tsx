"use client";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { LogOut, Check, X } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PostCard } from "@/components/posts/PostCard";
import { timeAgo } from "@/lib/utils";

interface Post {
  id: string;
  content: string;
  mood?: string | null;
  createdAt: string;
  author: { id: string; username: string; displayName?: string | null };
}

interface ProfileData {
  id: string;
  username: string;
  displayName?: string | null;
  bio?: string | null;
  createdAt: string;
  _count: { posts: number; friendshipsA: number; friendshipsB: number };
}

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [pr, postsRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/posts"),
      ]);
      if (pr.ok) {
        const d = await pr.json();
        setProfile(d.user);
        setDisplayName(d.user.displayName ?? "");
        setBio(d.user.bio ?? "");
      }
      if (postsRes.ok) {
        const d = await postsRes.json();
        // Filter to only own posts
        if (session?.user?.id) {
          setPosts(d.posts.filter((p: Post) => p.author.id === session.user.id));
        }
      }
      setLoading(false);
    }
    if (session?.user?.id) load();
  }, [session?.user?.id]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio }),
      });
      if (res.ok) {
        const d = await res.json();
        setProfile((prev) => prev ? { ...prev, ...d.user } : prev);
        await updateSession({ name: d.user.displayName ?? d.user.username });
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  function handleDeletePost(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  const userId = session?.user?.id ?? "";
  const username = profile?.username ?? session?.user?.username ?? "";
  const name = profile?.displayName ?? username;
  const friendCount = (profile?._count.friendshipsA ?? 0) + (profile?._count.friendshipsB ?? 0);

  return (
    <>
      <TopBar
        title="Profile"
        action={
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm p-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
        }
      />
      <div className="max-w-lg mx-auto px-4 py-5 flex flex-col gap-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <Avatar username={username} displayName={profile?.displayName} size="xl" />
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <div className="flex flex-col gap-3">
                      <Input
                        placeholder="Your name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="text-sm py-2"
                      />
                      <Textarea
                        placeholder="Bio (optional)"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={2}
                        className="text-sm py-2"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave} loading={saving}>
                          <Check className="h-3.5 w-3.5" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditing(false);
                            setDisplayName(profile?.displayName ?? "");
                            setBio(profile?.bio ?? "");
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-stone-900">{name}</p>
                          <p className="text-stone-400 text-sm">@{username}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing(true)}
                        >
                          Edit
                        </Button>
                      </div>
                      {profile?.bio && (
                        <p className="text-stone-600 text-sm mt-2 leading-relaxed">
                          {profile.bio}
                        </p>
                      )}
                      <div className="flex gap-4 mt-3">
                        <div className="text-center">
                          <p className="font-semibold text-stone-900 text-sm">
                            {profile?._count.posts ?? 0}
                          </p>
                          <p className="text-stone-400 text-xs">posts</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-stone-900 text-sm">{friendCount}</p>
                          <p className="text-stone-400 text-xs">friends</p>
                        </div>
                      </div>
                      {profile?.createdAt && (
                        <p className="text-xs text-stone-300 mt-2">
                          Joined {timeAgo(profile.createdAt)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Own posts */}
            <section>
              <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
                Your posts
              </h2>
              {posts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-8 text-center">
                  <p className="text-stone-400 text-sm">
                    You haven&apos;t posted anything yet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={userId}
                      onDelete={handleDeletePost}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
