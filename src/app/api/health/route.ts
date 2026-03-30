import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, string> = {};

  checks.nodeVersion = process.version;
  checks.nodeEnv = process.env.NODE_ENV ?? "unset";
  checks.databaseUrl = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace(/\/[^/]+$/, "/***")
    : "MISSING";
  checks.nextauthUrl = process.env.NEXTAUTH_URL ?? "MISSING";
  checks.nextauthSecret = process.env.NEXTAUTH_SECRET ? "SET" : "MISSING";

  try {
    const userCount = await prisma.user.count();
    checks.database = `OK (${userCount} users)`;
    // Also verify write access
    await prisma.$executeRaw`SELECT 1`;
    checks.databaseWrite = "OK";
  } catch (e) {
    const msg = (e as Error).message;
    checks.database = `ERROR: ${msg}`;
    checks.databaseWrite = `ERROR: ${msg}`;
  }

  const allOk = !Object.values(checks).some((v) => v.includes("ERROR") || v.includes("MISSING"));

  return NextResponse.json({ ok: allOk, checks }, { status: allOk ? 200 : 500 });
}
