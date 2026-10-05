import { headers } from "next/headers";
import { auth } from "./auth";

export async function getSessionUser() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user ?? null;
  } catch {
    // DB asleep / auth hiccup → treat as logged out, pages redirect to /login
    return null;
  }
}
