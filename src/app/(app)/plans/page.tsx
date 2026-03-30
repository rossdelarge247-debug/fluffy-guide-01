"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, X } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PlanCard } from "@/components/plans/PlanCard";
import { PlanForm } from "@/components/plans/PlanForm";
import { Button } from "@/components/ui/Button";

interface Friend {
  friendshipId: string;
  friend: { id: string; username: string; displayName?: string | null };
}

interface Plan {
  id: string;
  title: string;
  date: string;
  location?: string | null;
  description?: string | null;
  creator: { id: string; username: string; displayName?: string | null };
  invitees: { userId: string; rsvp: string }[];
}

export default function PlansPage() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [plansRes, friendsRes] = await Promise.all([
          fetch("/api/plans"),
          fetch("/api/friends"),
        ]);
        if (plansRes.ok) {
          const d = await plansRes.json();
          setPlans(d.plans);
        }
        if (friendsRes.ok) {
          const d = await friendsRes.json();
          setFriends(d.friends);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleCreate(data: {
    title: string;
    description: string;
    location: string;
    date: string;
    inviteeIds: string[];
  }) {
    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const d = await res.json();
      setPlans((prev) => [d.plan, ...prev]);
      setCreating(false);
    }
  }

  const userId = session?.user?.id ?? "";
  const now = new Date();
  const upcoming = plans.filter((p) => new Date(p.date) >= now);
  const past = plans.filter((p) => new Date(p.date) < now);

  return (
    <>
      <TopBar
        title="Plans"
        action={
          !creating && (
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              New plan
            </Button>
          )
        }
      />
      <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4">
        {creating && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-stone-900">New plan</h2>
              <button
                onClick={() => setCreating(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <PlanForm
              friends={friends}
              onSubmit={handleCreate}
              onCancel={() => setCreating(false)}
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
          </div>
        ) : plans.length === 0 && !creating ? (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <span className="text-4xl">📅</span>
            <p className="font-medium text-stone-700">No plans yet</p>
            <p className="text-stone-400 text-sm max-w-xs">
              Create a plan and invite your friends to see who&apos;s in.
            </p>
            <Button onClick={() => setCreating(true)} className="mt-2">
              <Plus className="h-4 w-4" />
              Make a plan
            </Button>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                  Coming up
                </h2>
                {upcoming.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} currentUserId={userId} />
                ))}
              </section>
            )}
            {past.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                  Past
                </h2>
                {past.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} currentUserId={userId} />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
