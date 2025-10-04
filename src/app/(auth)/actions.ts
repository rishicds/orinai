"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Account, Client, ID, type Models } from "node-appwrite";
import { SESSION_COOKIE } from "@/lib/appwrite/auth";

export interface AuthFormState {
  error?: string;
}

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters").max(64).optional(),
});

function createAccountClient(): Account {
  const endpoint = process.env.APPWRITE_ENDPOINT;
  const projectId = process.env.APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId) {
    throw new Error(
      "Missing Appwrite public configuration. Set APPWRITE_ENDPOINT and APPWRITE_PROJECT_ID."
    );
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId);
  
  // Set API key for server-side operations if available
  if (apiKey) {
    client.setKey(apiKey);
  }
  
  return new Account(client);
}

function calculateMaxAge(): number {
  return 60 * 60 * 24 * 7; // 7 days
}

async function persistSession(session: Models.Session) {
  console.log("[Auth] Persisting session:", {
    sessionId: session.$id,
    userId: session.userId,
    expire: session.expire
  });
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: calculateMaxAge(),
  });
  
  console.log("[Auth] Session cookie set successfully");
}

export async function loginWithEmail(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid credentials" };
  }

  const account = createAccountClient();

  try {
    const session = await account.createEmailPasswordSession(
      parsed.data.email,
      parsed.data.password
    );
    await persistSession(session);
  } catch (error) {
    console.error("[Auth] Login failed:", error);
    const message = error instanceof Error ? error.message : "Unable to sign in";
    return { error: message };
  }
  
  // Redirect after successful login (outside try-catch since redirect throws)
  const redirectTo = formData.get("redirectTo") as string;
  redirect(redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/chat");
}

export async function registerWithEmail(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid registration details" };
  }

  const account = createAccountClient();

  try {
    await account.create(ID.unique(), parsed.data.email, parsed.data.password, parsed.data.name);
    const session = await account.createEmailPasswordSession(
      parsed.data.email,
      parsed.data.password
    );
    await persistSession(session);
  } catch (error) {
    console.error("[Auth] Registration failed:", error);
    const message = error instanceof Error ? error.message : "Unable to register";
    return { error: message };
  }
  
  // Redirect after successful registration (outside try-catch since redirect throws)
  const redirectTo = formData.get("redirectTo") as string;
  redirect(redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/chat");
}

export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

export async function createSessionFromOAuth(userId: string, secret: string) {
  const account = createAccountClient();
  const session = await account.createSession(userId, secret);
  await persistSession(session);
}
