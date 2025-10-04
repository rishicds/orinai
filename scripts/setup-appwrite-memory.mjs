#!/usr/bin/env node

import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' }); // Also load from .env file

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'orinai_db';

// Collection names from environment variables
const USER_PROFILES_COLLECTION = process.env.APPWRITE_COLLECTION_USER_PROFILE || 'user_profiles';
const USER_MEMORY_METADATA_COLLECTION = process.env.APPWRITE_COLLECTION_USER_MEMORY_METADATA || 'user_memory_metadata';

async function createUserProfilesCollection() {
  console.log('📝 Creating user_profiles collection...');
  
  try {
    const collection = await databases.createCollection(
      DATABASE_ID,
      USER_PROFILES_COLLECTION,
      'User Profiles',
      [
        Permission.create(Role.users()),
        Permission.read(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ User profiles collection created:', collection.$id);
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠️  User profiles collection already exists');
    } else {
      console.error('❌ Failed to create user profiles collection:', error);
      throw error;
    }
  }

  // Create attributes
  console.log('📋 Adding attributes to user_profiles...');

  const attributes = [
    { key: 'userId', size: 255, required: true, type: 'string' },
    { key: 'name', size: 255, required: false, type: 'string' },
    { key: 'email', size: 255, required: false, type: 'string' },
    { key: 'preferences', size: 10000, required: false, type: 'string' },
    { key: 'tags', size: 1000, required: false, type: 'string' },
    { key: 'lastActive', required: false, type: 'datetime' }
  ];

  for (const attr of attributes) {
    try {
      if (attr.type === 'string') {
        await databases.createStringAttribute(
          DATABASE_ID,
          USER_PROFILES_COLLECTION,
          attr.key,
          attr.size,
          attr.required
        );
        console.log(`   ✅ Created string attribute: ${attr.key}`);
      } else if (attr.type === 'datetime') {
        await databases.createDatetimeAttribute(
          DATABASE_ID,
          USER_PROFILES_COLLECTION,
          attr.key,
          attr.required
        );
        console.log(`   ✅ Created datetime attribute: ${attr.key}`);
      }
    } catch (error) {
      if (error.code === 409) {
        console.log(`   ⚠️  Attribute ${attr.key} already exists`);
      } else {
        console.log(`   ❌ Failed to create attribute ${attr.key}:`, error.message);
      }
    }
  }

  console.log('✅ User profiles attributes processed');

  // Create indexes
  console.log('🔍 Creating indexes for user_profiles...');

  const indexes = [
    { key: 'userId_index', type: 'key', attributes: ['userId'] },
    { key: 'email_index', type: 'key', attributes: ['email'] }
  ];

  for (const index of indexes) {
    try {
      await databases.createIndex(
        DATABASE_ID,
        USER_PROFILES_COLLECTION,
        index.key,
        index.type,
        index.attributes
      );
      console.log(`   ✅ Created index: ${index.key}`);
    } catch (error) {
      if (error.code === 409) {
        console.log(`   ⚠️  Index ${index.key} already exists`);
      } else {
        console.log(`   ❌ Failed to create index ${index.key}:`, error.message);
      }
    }
  }

  console.log('✅ User profiles indexes processed');
}

async function createUserMemoryMetadataCollection() {
  console.log('📝 Creating user_memory_metadata collection...');
  
  try {
    const collection = await databases.createCollection(
      DATABASE_ID,
      USER_MEMORY_METADATA_COLLECTION,
      'User Memory Metadata',
      [
        Permission.create(Role.users()),
        Permission.read(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ User memory metadata collection created:', collection.$id);
  } catch (error) {
    if (error.code === 409) {
      console.log('⚠️  User memory metadata collection already exists');
    } else {
      console.error('❌ Failed to create user memory metadata collection:', error);
      throw error;
    }
  }

  // Try to create attributes regardless of whether collection was just created
  console.log('📋 Adding attributes to user_memory_metadata...');
  
  const attributes = [
    { key: 'userId', size: 255, required: true, type: 'string' },
    { key: 'vectorId', size: 255, required: true, type: 'string' },
    { key: 'content', size: 10000, required: true, type: 'string' },
    { key: 'context', size: 1000, required: false, type: 'string' },
    { key: 'type', size: 50, required: true, type: 'string' },
    { key: 'tags', size: 1000, required: false, type: 'string' },
    { key: 'metadata', size: 5000, required: false, type: 'string' },
    { key: 'createdAt', required: true, type: 'datetime' },
    { key: 'lastAccessed', required: false, type: 'datetime' },
    { key: 'accessCount', required: false, type: 'integer', min: 0, max: 1000000, default: 0 }
  ];

  for (const attr of attributes) {
    try {
      if (attr.type === 'string') {
        await databases.createStringAttribute(
          DATABASE_ID,
          USER_MEMORY_METADATA_COLLECTION,
          attr.key,
          attr.size,
          attr.required
        );
        console.log(`   ✅ Created string attribute: ${attr.key}`);
      } else if (attr.type === 'datetime') {
        await databases.createDatetimeAttribute(
          DATABASE_ID,
          USER_MEMORY_METADATA_COLLECTION,
          attr.key,
          attr.required
        );
        console.log(`   ✅ Created datetime attribute: ${attr.key}`);
      } else if (attr.type === 'integer') {
        await databases.createIntegerAttribute(
          DATABASE_ID,
          USER_MEMORY_METADATA_COLLECTION,
          attr.key,
          attr.required,
          attr.min,
          attr.max,
          attr.default
        );
        console.log(`   ✅ Created integer attribute: ${attr.key}`);
      }
    } catch (error) {
      if (error.code === 409) {
        console.log(`   ⚠️  Attribute ${attr.key} already exists`);
      } else {
        console.log(`   ❌ Failed to create attribute ${attr.key}:`, error.message);
      }
    }
  }

  console.log('✅ User memory metadata attributes processed');

  // Create indexes
  console.log('🔍 Creating indexes for user_memory_metadata...');

  const indexes = [
    { key: 'userId_index', type: 'key', attributes: ['userId'] },
    { key: 'vectorId_index', type: 'key', attributes: ['vectorId'] },
    { key: 'type_index', type: 'key', attributes: ['type'] },
    { key: 'userId_type_index', type: 'key', attributes: ['userId', 'type'] },
    { key: 'createdAt_index', type: 'key', attributes: ['createdAt'] }
  ];

  for (const index of indexes) {
    try {
      await databases.createIndex(
        DATABASE_ID,
        USER_MEMORY_METADATA_COLLECTION,
        index.key,
        index.type,
        index.attributes
      );
      console.log(`   ✅ Created index: ${index.key}`);
    } catch (error) {
      if (error.code === 409) {
        console.log(`   ⚠️  Index ${index.key} already exists`);
      } else {
        console.log(`   ❌ Failed to create index ${index.key}:`, error.message);
      }
    }
  }

  console.log('✅ User memory metadata indexes processed');
}

async function setupCollections() {
  console.log('🚀 Setting up Appwrite collections for RAG system');
  console.log('==============================================\n');

  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
    console.error('❌ NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set');
    process.exit(1);
  }

  if (!process.env.APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY is not set');
    process.exit(1);
  }

  console.log('📊 Configuration:');
  console.log(`   Database ID: ${DATABASE_ID}`);
  console.log(`   Project ID: ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
  console.log(`   Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
  console.log(`   User Profiles Collection: ${USER_PROFILES_COLLECTION}`);
  console.log(`   User Memory Metadata Collection: ${USER_MEMORY_METADATA_COLLECTION}\n`);

  try {
    // Create collections
    await createUserProfilesCollection();
    await createUserMemoryMetadataCollection();

    console.log('\n🎉 All collections created successfully!');
    console.log('\n📋 Collections Summary:');
    console.log(`   • ${USER_PROFILES_COLLECTION}: User profile data and preferences`);
    console.log(`   • ${USER_MEMORY_METADATA_COLLECTION}: Metadata for Pinecone vectors`);
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Set up your Pinecone index with 1536 dimensions');
    console.log('   2. Configure your environment variables:');
    console.log('      - PINECONE_API_KEY');
    console.log('      - HUGGINGFACE_API_KEY');
    console.log('   3. Test the memory system with: npm run test:rag');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Handle environment variable validation
setupCollections();

export { setupCollections };