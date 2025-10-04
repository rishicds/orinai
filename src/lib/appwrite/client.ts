import { Client, Account, Databases, Storage, Users } from "node-appwrite";

interface AppwriteClients {
  account: Account;
  databases: Databases;
  storage: Storage;
  users: Users;
}

let cachedClients: AppwriteClients | null = null;

/**
 * Lazily instantiate the Appwrite SDK using server-side credentials.
 */
export function getAppwriteClients(): AppwriteClients {
  if (cachedClients) {
    return cachedClients;
  }

  const endpoint = process.env.APPWRITE_ENDPOINT;
  const projectId = process.env.APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !apiKey) {
    throw new Error(
      "Missing Appwrite configuration. Please set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID and APPWRITE_API_KEY."
    );
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  cachedClients = {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
    users: new Users(client),
  };

  return cachedClients;
}
