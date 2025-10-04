import "dotenv/config";

import {
  AppwriteException,
  Client,
  Databases,
  IndexType,
  Permission,
  Role,
} from "node-appwrite";

const endpoint =
  process.env.APPWRITE_ENDPOINT ?? process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId =
  process.env.APPWRITE_PROJECT_ID ?? process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!endpoint || !projectId || !apiKey) {
  console.error(
    "Missing Appwrite credentials. Please set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, and APPWRITE_API_KEY."
  );
  process.exit(1);
}

const databaseId = process.env.APPWRITE_DATABASE_ID ?? "orinai";
const collectionId = process.env.APPWRITE_COLLECTION_QUERIES ?? "queries";
const userChatCollectionId = process.env.APPWRITE_COLLECTION_USER_CHAT ?? "user_chat";

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);

async function ensureDatabase() {
  try {
    await databases.get(databaseId);
    console.log(`Database '${databaseId}' already exists.`);
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 404) {
  await databases.create(databaseId, "ORIN.AI Data", true);
      console.log(`Created database '${databaseId}'.`);
    } else {
      throw error;
    }
  }
}

async function ensureCollection(collectionName: string, collectionDisplayName?: string) {
  try {
    await databases.getCollection(databaseId, collectionName);
    console.log(`Collection '${collectionName}' already exists.`);
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 404) {
      await databases.createCollection(
        databaseId,
        collectionName,
        collectionDisplayName || collectionName,
        [Permission.read(Role.users()), Permission.create(Role.users())],
        true
      );
      console.log(`Created collection '${collectionName}'.`);
    } else {
      throw error;
    }
  }
}

async function ensureAttribute(collectionName: string, action: () => Promise<unknown>, label: string) {
  try {
    await action();
    console.log(`Created attribute '${label}' in collection '${collectionName}'.`);
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 409) {
      console.log(`Attribute '${label}' already exists in collection '${collectionName}'.`);
    } else {
      throw error;
    }
  }
}

async function ensureIndex(
  collectionName: string,
  key: string,
  type: IndexType,
  attributes: string[],
  orders: ("ASC" | "DESC")[]
) {
  try {
    await databases.createIndex(databaseId, collectionName, key, type, attributes, orders);
    console.log(`Created index '${key}' in collection '${collectionName}'.`);
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 409) {
      console.log(`Index '${key}' already exists in collection '${collectionName}'.`);
    } else {
      throw error;
    }
  }
}

async function bootstrap() {
  await ensureDatabase();
  
  // Setup queries collection
  await ensureCollection(collectionId, "queries");

  await ensureAttribute(
    collectionId,
    () => databases.createStringAttribute(databaseId, collectionId, "userId", 64, true),
    "userId"
  );
  await ensureAttribute(
    collectionId,
    () => databases.createStringAttribute(databaseId, collectionId, "query", 2048, true),
    "query"
  );
  await ensureAttribute(
    collectionId,
    () => databases.createStringAttribute(databaseId, collectionId, "responseType", 64, true),
    "responseType"
  );
  await ensureAttribute(
    collectionId,
    () => databases.createDatetimeAttribute(databaseId, collectionId, "createdAt", true),
    "createdAt"
  );

  await ensureIndex(collectionId, "by_user_created", IndexType.Key, ["userId", "createdAt"], ["ASC", "DESC"]);

  // Setup user_chat collection
  await ensureCollection(userChatCollectionId, "user_chat");

  await ensureAttribute(
    userChatCollectionId,
    () => databases.createStringAttribute(databaseId, userChatCollectionId, "userId", 64, true),
    "userId"
  );
  await ensureAttribute(
    userChatCollectionId,
    () => databases.createStringAttribute(databaseId, userChatCollectionId, "role", 20, true),
    "role"
  );
  await ensureAttribute(
    userChatCollectionId,
    () => databases.createStringAttribute(databaseId, userChatCollectionId, "content", 4096, true),
    "content"
  );
  await ensureAttribute(
    userChatCollectionId,
    () => databases.createDatetimeAttribute(databaseId, userChatCollectionId, "createdAt", true),
    "createdAt"
  );
  await ensureAttribute(
    userChatCollectionId,
    () => databases.createDatetimeAttribute(databaseId, userChatCollectionId, "updatedAt", false),
    "updatedAt"
  );
  await ensureAttribute(
    userChatCollectionId,
    () => databases.createStringAttribute(databaseId, userChatCollectionId, "sessionId", 128, false),
    "sessionId"
  );
  await ensureAttribute(
    userChatCollectionId,
    () => databases.createStringAttribute(databaseId, userChatCollectionId, "dashboardData", 10000, false),
    "dashboardData"
  );

  await ensureIndex(userChatCollectionId, "by_user_chat_created", IndexType.Key, ["userId", "createdAt"], ["ASC", "DESC"]);

  console.log("Appwrite bootstrap complete ✅");
}

bootstrap().catch((error) => {
  console.error("Appwrite setup failed", error);
  process.exit(1);
});
