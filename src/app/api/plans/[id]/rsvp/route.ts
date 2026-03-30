import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { rsvp } = await req.json();

  const validRsvps = ["YES", "MAYBE", "NO", "PENDING"];
  if (!validRsvps.includes(rsvp)) {
    return NextResponse.json({ error: "Invalid RSVP value" }, { status: 400 });
  }

  // Check user is invited or is creator
  const plan = await prisma.plan.findUnique({
    where: { id: params.id },
    include: { invitees: { select: { userId: true } } },
  });
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isInvited = plan.invitees.some((i) => i.userId === userId);
  const isCreator = plan.creatorId === userId;
  if (!isInvited && !isCreator) {
    return NextResponse.json({ error: "Not invited to this plan" }, { status: 403 });
  }

  const invitee = await prisma.planInvitee.upsert({
    where: { planId_userId: { planId: params.id, userId } },
    update: { rsvp },
    create: { planId: params.id, userId, rsvp },
  });

  return NextResponse.json({ invitee });
}
