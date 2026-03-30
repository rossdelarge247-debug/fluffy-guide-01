import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const cursor = req.nextUrl.searchParams.get("cursor");
  const limit = 20;

  // Get friend IDs
  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    select: { userAId: true, userBId: true },
  });
  const friendIds = friendships.map((f) =>
    f.userAId === userId ? f.userBId : f.userAId
  );

  const posts = await prisma.post.findMany({
    where: {
      authorId: { in: [...friendIds, userId] },
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    include: {
      author: { select: { id: true, username: true, displayName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

  return NextResponse.json({ posts: items, nextCursor });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, mood } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }
  if (content.length > 280) {
    return NextResponse.json({ error: "Content too long (max 280 characters)" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      content: content.trim(),
      mood: mood || null,
      authorId: session.user.id,
    },
    include: {
      author: { select: { id: true, username: true, displayName: true } },
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
