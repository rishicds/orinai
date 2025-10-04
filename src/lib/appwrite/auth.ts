import type { Models } from "node-appwrite";
import { cookies } from "next/headers";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  name?: string;
  raw?: Models.User<Models.Preferences>;
}

export const SESSION_COOKIE = "a_session";

/**
 * Resolve the authenticated user either from an Appwrite session cookie or a development fallback.
 */
export async function getUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;

  console.log("[Auth] Session cookie present:", !!sessionCookie);

  try {
    if (sessionCookie) {
      // Create a client with the session cookie to get user info
      const endpoint = process.env.APPWRITE_ENDPOINT;
      const projectId = process.env.APPWRITE_PROJECT_ID;

      if (!endpoint || !projectId) {
        throw new Error("Missing Appwrite configuration");
      }

      const { Client, Account } = await import("node-appwrite");
      const sessionClient = new Client()
        .setEndpoint(endpoint)
        .setProject(projectId)
        .setSession(sessionCookie);

      const account = new Account(sessionClient);
      const user = await account.get();

      console.log("[Auth] User authenticated:", user.email);

      return {
        id: user.$id,
        email: user.email,
        name: user.name,
        raw: user,
      };
    }
  } catch (error) {
    console.error("[Auth] Failed to resolve Appwrite session", error);
    // Note: Can't delete cookies here as this is not a Server Action
    // Invalid sessions will just fail to authenticate
  }

  const fallbackUserId = process.env.APPWRITE_DEV_USER_ID;
  if (fallbackUserId) {
    return { id: fallbackUserId };
  }

  return null;
}
