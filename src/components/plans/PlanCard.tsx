"use client";
import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
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

interface PlanCardProps {
  plan: {
    id: string;
    title: string;
    date: string | Date;
    location?: string | null;
    description?: string | null;
    creator: { id: string; username: string; displayName?: string | null };
    invitees: { userId: string; rsvp: string }[];
  };
  currentUserId: string;
}

export function PlanCard({ plan, currentUserId }: PlanCardProps) {
  const myInvite = plan.invitees.find((i) => i.userId === currentUserId);
  const myRsvp = myInvite?.rsvp ?? (plan.creator.id === currentUserId ? "CREATOR" : "PENDING");
  const goingCount = plan.invitees.filter((i) => i.rsvp === "YES").length;
  const totalInvited = plan.invitees.length;

  return (
    <Link href={`/plans/${plan.id}`} className="block">
      <article className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 hover:border-stone-200 transition-colors active:bg-stone-50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-900">{plan.title}</h3>
            <div className="mt-1.5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-stone-500 text-sm">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{formatPlanDate(plan.date)}</span>
              </div>
              {plan.location && (
                <div className="flex items-center gap-1.5 text-stone-500 text-sm">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{plan.location}</span>
                </div>
              )}
            </div>
            <p className="mt-1.5 text-xs text-stone-400">
              by {plan.creator.displayName ?? plan.creator.username}
              {totalInvited > 0 && ` · ${goingCount}/${totalInvited} going`}
            </p>
          </div>
          {myRsvp !== "CREATOR" && (
            <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0", rsvpStyles[myRsvp])}>
              {rsvpLabels[myRsvp]}
            </span>
          )}
          {myRsvp === "CREATOR" && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 bg-brand-50 text-brand-700">
              Organising
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
