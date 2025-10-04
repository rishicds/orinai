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

async function ensureCollection() {
  try {
    await databases.getCollection(databaseId, collectionId);
    console.log(`Collection '${collectionId}' already exists.`);
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 404) {
      await databases.createCollection(
        databaseId,
        collectionId,
        collectionId,
        [Permission.read(Role.users()), Permission.create(Role.users())],
        true
      );
      console.log(`Created collection '${collectionId}'.`);
    } else {
      throw error;
    }
  }
}

async function ensureAttribute(action: () => Promise<unknown>, label: string) {
  try {
    await action();
    console.log(`Created attribute '${label}'.`);
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 409) {
      console.log(`Attribute '${label}' already exists.`);
    } else {
      throw error;
    }
  }
}

async function ensureIndex(
  key: string,
  type: IndexType,
  attributes: string[],
  orders: ("ASC" | "DESC")[]
) {
  try {
    await databases.createIndex(databaseId, collectionId, key, type, attributes, orders);
    console.log(`Created index '${key}'.`);
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 409) {
      console.log(`Index '${key}' already exists.`);
    } else {
      throw error;
    }
  }
}

async function bootstrap() {
  await ensureDatabase();
  await ensureCollection();

  await ensureAttribute(
    () => databases.createStringAttribute(databaseId, collectionId, "userId", 64, true),
    "userId"
  );
  await ensureAttribute(
    () => databases.createStringAttribute(databaseId, collectionId, "query", 2048, true),
    "query"
  );
  await ensureAttribute(
    () => databases.createStringAttribute(databaseId, collectionId, "responseType", 64, true, "text"),
    "responseType"
  );
  await ensureAttribute(
    () => databases.createDatetimeAttribute(databaseId, collectionId, "createdAt", true),
    "createdAt"
  );

  await ensureIndex("by_user_created", IndexType.Key, ["userId", "createdAt"], ["ASC", "DESC"]);

  console.log("Appwrite bootstrap complete ✅");
}

bootstrap().catch((error) => {
  console.error("Appwrite setup failed", error);
  process.exit(1);
});
