"use client";
import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { FriendCard } from "@/components/friends/FriendCard";
import { FriendRequestCard } from "@/components/friends/FriendRequestCard";
import { UserSearchResults } from "@/components/friends/UserSearchResults";

interface Friend {
  friendshipId: string;
  friend: { id: string; username: string; displayName?: string | null };
}

interface FriendRequest {
  id: string;
  sender: { id: string; username: string; displayName?: string | null };
}

interface SearchUser {
  id: string;
  username: string;
  displayName?: string | null;
  isFriend: boolean;
  requestSent: boolean;
  requestReceived: boolean;
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function load() {
      const [fr, rr] = await Promise.all([
        fetch("/api/friends"),
        fetch("/api/friends/requests"),
      ]);
      if (fr.ok) {
        const d = await fr.json();
        setFriends(d.friends);
      }
      if (rr.ok) {
        const d = await rr.json();
        setRequests(d.requests);
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const d = await res.json();
          setSearchResults(d.users);
        }
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  function handleAccept(requestId: string) {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    // Reload friends list to pick up new friend
    fetch("/api/friends").then((r) => r.json()).then((d) => setFriends(d.friends));
  }

  function handleDecline(requestId: string) {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  }

  function handleUnfriend(friendshipId: string) {
    setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId));
  }

  const isSearching = searchQuery.length >= 2;

  return (
    <>
      <TopBar title="Friends" />
      <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Find people by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Search results */}
        {isSearching && (
          <section>
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
              Results
            </h2>
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4">
              {searching ? (
                <div className="flex justify-center py-6">
                  <div className="h-4 w-4 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
                </div>
              ) : (
                <UserSearchResults users={searchResults} />
              )}
            </div>
          </section>
        )}

        {!isSearching && loading && (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
          </div>
        )}

        {/* Pending requests */}
        {!isSearching && requests.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
              Friend requests ({requests.length})
            </h2>
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 divide-y divide-stone-50">
              {requests.map((req) => (
                <FriendRequestCard
                  key={req.id}
                  requestId={req.id}
                  sender={req.sender}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </div>
          </section>
        )}

        {/* Friends list */}
        {!isSearching && (
          <section>
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
              Friends {friends.length > 0 && `(${friends.length})`}
            </h2>
            {friends.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-8 text-center">
                <p className="text-stone-400 text-sm">
                  Search for people by username to add them as friends.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 divide-y divide-stone-50">
                {friends.map((f) => (
                  <FriendCard
                    key={f.friendshipId}
                    friendshipId={f.friendshipId}
                    friend={f.friend}
                    onUnfriend={handleUnfriend}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
