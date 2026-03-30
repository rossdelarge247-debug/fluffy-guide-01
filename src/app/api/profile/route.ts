import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      createdAt: true,
      _count: { select: { posts: true, friendshipsA: true, friendshipsB: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { displayName, bio } = await req.json();

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      displayName: displayName?.trim() || null,
      bio: bio?.trim() || null,
    },
    select: { id: true, username: true, displayName: true, bio: true },
  });

  return NextResponse.json({ user });
}
