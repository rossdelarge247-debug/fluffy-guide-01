"use client";
import { getInitials, avatarColor, cn } from "@/lib/utils";

interface AvatarProps {
  username: string;
  displayName?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export function Avatar({ username, displayName, size = "md", className }: AvatarProps) {
  const name = displayName ?? username;
  const initials = getInitials(name);
  const color = avatarColor(username);

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0",
        sizeMap[size],
        color,
        className
      )}
    >
      {initials}
    </div>
  );
}
