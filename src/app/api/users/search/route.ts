import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase();
  if (!q || q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const userId = session.user.id;

  // Get existing friend IDs and pending request IDs to exclude/mark them
  const [friendships, sentRequests, receivedRequests] = await Promise.all([
    prisma.friendship.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      select: { userAId: true, userBId: true },
    }),
    prisma.friendRequest.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
    }),
    prisma.friendRequest.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
    }),
  ]);

  const friendIds = new Set(
    friendships.map((f) => (f.userAId === userId ? f.userBId : f.userAId))
  );
  const sentTo = new Set(sentRequests.map((r) => r.receiverId));
  const receivedFrom = new Set(receivedRequests.map((r) => r.senderId));

  const users = await prisma.user.findMany({
    where: {
      username: { contains: q },
      id: { not: userId },
    },
    select: { id: true, username: true, displayName: true },
    take: 20,
  });

  const result = users.map((u) => ({
    ...u,
    isFriend: friendIds.has(u.id),
    requestSent: sentTo.has(u.id),
    requestReceived: receivedFrom.has(u.id),
  }));

  return NextResponse.json({ users: result });
}
