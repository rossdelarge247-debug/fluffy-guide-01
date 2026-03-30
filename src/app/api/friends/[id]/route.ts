import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Accept or decline a friend request
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await req.json(); // "accept" | "decline"

  const request = await prisma.friendRequest.findUnique({ where: { id: params.id } });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (request.receiverId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "accept") {
    // Create friendship and delete request atomically
    const [friendship] = await prisma.$transaction([
      prisma.friendship.create({
        data: { userAId: request.senderId, userBId: request.receiverId },
        include: {
          userA: { select: { id: true, username: true, displayName: true } },
          userB: { select: { id: true, username: true, displayName: true } },
        },
      }),
      prisma.friendRequest.delete({ where: { id: params.id } }),
    ]);
    return NextResponse.json({ friendship });
  }

  if (action === "decline") {
    await prisma.friendRequest.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// Unfriend (delete a friendship by friendship id, or by friend user id)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const friendship = await prisma.friendship.findFirst({
    where: {
      id: params.id,
      OR: [{ userAId: userId }, { userBId: userId }],
    },
  });
  if (!friendship) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.friendship.delete({ where: { id: friendship.id } });
  return NextResponse.json({ ok: true });
}
