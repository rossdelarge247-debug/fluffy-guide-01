"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RsvpButtonsProps {
  planId: string;
  currentRsvp: string;
  onUpdate?: (rsvp: string) => void;
}

const options = [
  { value: "YES", label: "Going", active: "bg-emerald-500 text-white", idle: "border border-emerald-200 text-emerald-700 hover:bg-emerald-50" },
  { value: "MAYBE", label: "Maybe", active: "bg-amber-500 text-white", idle: "border border-amber-200 text-amber-700 hover:bg-amber-50" },
  { value: "NO", label: "Can't go", active: "bg-red-400 text-white", idle: "border border-red-200 text-red-600 hover:bg-red-50" },
];

export function RsvpButtons({ planId, currentRsvp, onUpdate }: RsvpButtonsProps) {
  const [rsvp, setRsvp] = useState(currentRsvp);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleRsvp(value: string) {
    if (loading) return;
    const next = value === rsvp ? "PENDING" : value;
    setLoading(value);
    try {
      const res = await fetch(`/api/plans/${planId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rsvp: next }),
      });
      if (res.ok) {
        setRsvp(next);
        onUpdate?.(next);
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleRsvp(opt.value)}
          disabled={!!loading}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95 disabled:opacity-60",
            rsvp === opt.value ? opt.active : opt.idle
          )}
        >
          {loading === opt.value ? "..." : opt.label}
        </button>
      ))}
    </div>
  );
}
