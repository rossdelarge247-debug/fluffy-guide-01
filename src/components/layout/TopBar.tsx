import { cn } from "@/lib/utils";

interface TopBarProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function TopBar({ title, action, className }: TopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-stone-100",
        className
      )}
    >
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-4">
        <h1 className="text-lg font-semibold text-stone-900">{title}</h1>
        {action && <div>{action}</div>}
      </div>
    </header>
  );
}
