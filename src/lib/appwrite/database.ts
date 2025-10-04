import { ID } from "node-appwrite";
import { getAppwriteClients } from "./client";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID ?? "orinai";
const QUERY_COLLECTION_ID = process.env.APPWRITE_COLLECTION_QUERIES ?? "queries";

export interface QueryLogEntry {
  userId: string;
  query: string;
  responseType: string;
  createdAt: string;
}

export async function logQuery(entry: Omit<QueryLogEntry, "createdAt">): Promise<void> {
  const hasConfig =
    Boolean(process.env.APPWRITE_ENDPOINT) &&
    Boolean(process.env.APPWRITE_PROJECT_ID) &&
    Boolean(process.env.APPWRITE_API_KEY);

  if (!hasConfig) {
    console.info("[Appwrite] Skipping query log: missing server credentials");
    return;
  }

  try {
    const { databases } = getAppwriteClients();
    await databases.createDocument(DATABASE_ID, QUERY_COLLECTION_ID, ID.unique(), {
      userId: entry.userId,
      query: entry.query,
      responseType: entry.responseType,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Appwrite] Failed to log query", error);
  }
}
