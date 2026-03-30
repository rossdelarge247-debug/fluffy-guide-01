import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}
