import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";

const SID_COOKIE = "sid";

export async function getOrCreateSessionId() {
  const jar = await cookies();
  const existing = jar.get(SID_COOKIE)?.value;

  if (existing) return existing;

  const sid = crypto.randomUUID();

  // Persist between visits: set maxAge (seconds)
  // Example: 30 days
  jar.set(SID_COOKIE, sid, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return sid;
}

export async function getSessionId() {
  const jar = await cookies();
  return jar.get(SID_COOKIE)?.value ?? null;
}

export async function createAndSetSessionId() {
  const jar = await cookies();
  const sid = crypto.randomUUID();

  jar.set(SID_COOKIE, sid, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days (persists)
  });

  return sid;
}
