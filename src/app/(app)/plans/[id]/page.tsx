"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, MapPin, Calendar, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { RsvpButtons } from "@/components/plans/RsvpButtons";
import { formatPlanDate, cn } from "@/lib/utils";

const rsvpStyles: Record<string, string> = {
  YES: "bg-emerald-50 text-emerald-700",
  MAYBE: "bg-amber-50 text-amber-700",
  NO: "bg-red-50 text-red-600",
  PENDING: "bg-stone-100 text-stone-500",
};
const rsvpLabels: Record<string, string> = {
  YES: "Going",
  MAYBE: "Maybe",
  NO: "Can't go",
  PENDING: "Invited",
};

interface Invitee {
  id: string;
  userId: string;
  rsvp: string;
  user: { id: string; username: string; displayName?: string | null };
}

interface Plan {
  id: string;
  title: string;
  date: string;
  location?: string | null;
  description?: string | null;
  creatorId: string;
  creator: { id: string; username: string; displayName?: string | null };
  invitees: Invitee[];
}

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/plans/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.plan) setPlan(d.plan);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this plan?")) return;
    setDeleting(true);
    const res = await fetch(`/api/plans/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/plans");
    else setDeleting(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-6 w-6 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-24 text-stone-400">Plan not found</div>
    );
  }

  const userId = session?.user?.id ?? "";
  const isCreator = plan.creatorId === userId;
  const myInvite = plan.invitees.find((i) => i.userId === userId);
  const myRsvp = myInvite?.rsvp ?? "PENDING";

  const going = plan.invitees.filter((i) => i.rsvp === "YES");
  const maybe = plan.invitees.filter((i) => i.rsvp === "MAYBE");
  const cantGo = plan.invitees.filter((i) => i.rsvp === "NO");
  const pending = plan.invitees.filter((i) => i.rsvp === "PENDING");

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-stone-100 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-stone-500 hover:text-stone-800 p-1 -ml-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-semibold text-stone-900 flex-1 truncate">{plan.title}</h1>
        {isCreator && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-stone-400 hover:text-red-500 p-1 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="px-4 py-5 flex flex-col gap-6">
        {/* Plan details */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-stone-700">
            <Calendar className="h-4 w-4 text-brand-500 flex-shrink-0" />
            <span className="text-sm font-medium">{formatPlanDate(plan.date)}</span>
          </div>
          {plan.location && (
            <div className="flex items-center gap-2 text-stone-700">
              <MapPin className="h-4 w-4 text-brand-500 flex-shrink-0" />
              <span className="text-sm">{plan.location}</span>
            </div>
          )}
          {plan.description && (
            <p className="text-sm text-stone-600 leading-relaxed">{plan.description}</p>
          )}
          <p className="text-xs text-stone-400 border-t border-stone-50 pt-2">
            Organised by {plan.creator.displayName ?? plan.creator.username}
          </p>
        </div>

        {/* RSVP — only shown if invited (not creator) */}
        {!isCreator && myInvite && (
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
              Your response
            </p>
            <RsvpButtons
              planId={plan.id}
              currentRsvp={myRsvp}
              onUpdate={(rsvp) => {
                setPlan((prev) =>
                  prev
                    ? {
                        ...prev,
                        invitees: prev.invitees.map((i) =>
                          i.userId === userId ? { ...i, rsvp } : i
                        ),
                      }
                    : prev
                );
              }}
            />
          </div>
        )}

        {/* Attendees */}
        {plan.invitees.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
              {going.length} going · {maybe.length} maybe · {cantGo.length} can&apos;t · {pending.length} pending
            </p>
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-50">
              {plan.invitees.map((invitee) => (
                <div key={invitee.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar
                    username={invitee.user.username}
                    displayName={invitee.user.displayName}
                    size="sm"
                  />
                  <span className="flex-1 text-sm font-medium text-stone-900">
                    {invitee.user.displayName ?? invitee.user.username}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      rsvpStyles[invitee.rsvp]
                    )}
                  >
                    {rsvpLabels[invitee.rsvp]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
