import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const plans = await prisma.plan.findMany({
    where: {
      OR: [
        { creatorId: userId },
        { invitees: { some: { userId } } },
      ],
    },
    include: {
      creator: { select: { id: true, username: true, displayName: true } },
      invitees: {
        include: {
          user: { select: { id: true, username: true, displayName: true } },
        },
      },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ plans });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { title, description, location, date, inviteeIds } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  // Validate all invitees are friends
  if (inviteeIds?.length > 0) {
    const friendships = await prisma.friendship.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      select: { userAId: true, userBId: true },
    });
    const friendIds = new Set(
      friendships.map((f) => (f.userAId === userId ? f.userBId : f.userAId))
    );
    for (const id of inviteeIds) {
      if (!friendIds.has(id)) {
        return NextResponse.json(
          { error: "Can only invite friends" },
          { status: 400 }
        );
      }
    }
  }

  const plan = await prisma.plan.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      location: location?.trim() || null,
      date: new Date(date),
      creatorId: userId,
      invitees: {
        create: (inviteeIds ?? []).map((id: string) => ({
          userId: id,
          rsvp: "PENDING",
        })),
      },
    },
    include: {
      creator: { select: { id: true, username: true, displayName: true } },
      invitees: {
        include: {
          user: { select: { id: true, username: true, displayName: true } },
        },
      },
    },
  });

  return NextResponse.json({ plan }, { status: 201 });
}
