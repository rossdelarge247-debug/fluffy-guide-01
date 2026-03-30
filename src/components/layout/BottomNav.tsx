"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface BottomNavProps {
  pendingRequests?: number;
}

export function BottomNav({ pendingRequests = 0 }: BottomNavProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/plans", label: "Plans", icon: Calendar },
    { href: "/friends", label: "Friends", icon: Users, badge: pendingRequests },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-100 safe-bottom">
      <div className="max-w-lg mx-auto flex">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors",
                active ? "text-brand-600" : "text-stone-400 hover:text-stone-600"
              )}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
                {item.badge != null && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium", active ? "text-brand-600" : "")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
