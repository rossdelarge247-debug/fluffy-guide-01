import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/layout/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Get pending request count for badge
  const pendingCount = await prisma.friendRequest.count({
    where: { receiverId: session.user.id },
  });

  return (
    <div className="min-h-screen bg-stone-50">
      <main className="pb-nav">{children}</main>
      <BottomNav pendingRequests={pendingCount} />
    </div>
  );
}
