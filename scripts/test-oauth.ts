// Test script to verify Appwrite OAuth configuration
import "dotenv/config";
import { Client, Account } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!);

const account = new Account(client);

async function testGoogleOAuth() {
  try {
    console.log("Testing Appwrite Google OAuth configuration...");
    console.log("Endpoint:", process.env.APPWRITE_ENDPOINT);
    console.log("Project ID:", process.env.APPWRITE_PROJECT_ID);
    
    // Try to get the current session (this will fail but we can see the response)
    try {
      const session = await account.get();
      console.log("Current session:", session);
    } catch (error: any) {
      if (error.code === 401) {
        console.log("✓ Appwrite connection successful (no active session, which is expected)");
      } else {
        console.log("Appwrite error:", error.message);
      }
    }
    
    console.log("\nGoogle OAuth URL should be:");
    console.log(`${process.env.APPWRITE_ENDPOINT}/account/sessions/oauth2/google?project=${process.env.APPWRITE_PROJECT_ID}&success=<success_url>&failure=<failure_url>`);
    
  } catch (error: any) {
    console.error("Configuration error:", error.message);
  }
}

testGoogleOAuth();