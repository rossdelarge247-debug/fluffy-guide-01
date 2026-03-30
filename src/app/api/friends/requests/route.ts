import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await prisma.friendRequest.findMany({
    where: { receiverId: session.user.id },
    include: {
      sender: { select: { id: true, username: true, displayName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { receiverId } = await req.json();
  const senderId = session.user.id;

  if (!receiverId) {
    return NextResponse.json({ error: "receiverId is required" }, { status: 400 });
  }
  if (receiverId === senderId) {
    return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
  }

  // Check already friends
  const alreadyFriends = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userAId: senderId, userBId: receiverId },
        { userAId: receiverId, userBId: senderId },
      ],
    },
  });
  if (alreadyFriends) {
    return NextResponse.json({ error: "Already friends" }, { status: 409 });
  }

  // Check request already sent (either direction)
  const existing = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });
  if (existing) {
    return NextResponse.json({ error: "Request already exists" }, { status: 409 });
  }

  const request = await prisma.friendRequest.create({
    data: { senderId, receiverId },
    include: {
      receiver: { select: { id: true, username: true, displayName: true } },
    },
  });

  return NextResponse.json({ request }, { status: 201 });
}
