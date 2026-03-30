import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const plan = await prisma.plan.findUnique({
    where: { id: params.id },
    include: {
      creator: { select: { id: true, username: true, displayName: true } },
      invitees: {
        include: {
          user: { select: { id: true, username: true, displayName: true } },
        },
      },
    },
  });

  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only creator or invitees can view
  const canView =
    plan.creatorId === userId ||
    plan.invitees.some((i) => i.userId === userId);

  if (!canView) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ plan });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await prisma.plan.findUnique({ where: { id: params.id } });
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (plan.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, location, date } = await req.json();

  const updated = await prisma.plan.update({
    where: { id: params.id },
    data: {
      ...(title ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(location !== undefined ? { location: location?.trim() || null } : {}),
      ...(date ? { date: new Date(date) } : {}),
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

  return NextResponse.json({ plan: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await prisma.plan.findUnique({ where: { id: params.id } });
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (plan.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.plan.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
