# Memory System Environment Setup

This guide will help you set up the required environment variables and collections for the RAG memory system.

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_api_key_here
APPWRITE_DATABASE_ID=orinai_db

# Collection IDs (these will be created by the setup script)
APPWRITE_COLLECTION_USER_PROFILE=user_profiles
APPWRITE_COLLECTION_USER_MEMORY_METADATA=user_memory_metadata

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=orinai-user-memory

# Hugging Face Configuration
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

## Setup Steps

1. **Set up Appwrite Collections:**
   ```bash
   npm run setup:appwrite-memory
   ```

2. **Set up Pinecone Index:**
   ```bash
   npm run setup:pinecone
   ```

3. **Test the System:**
   ```bash
   npm run test:rag
   ```

## Collection Schemas

### user_profiles
- `userId` (string, required) - Unique user identifier
- `name` (string, optional) - User display name
- `email` (string, optional) - User email
- `preferences` (string, optional) - JSON string of user preferences
- `tags` (string, optional) - JSON array of user interests/tags
- `lastActive` (datetime, optional) - Last activity timestamp

### user_memory_metadata
- `userId` (string, required) - User identifier
- `vectorId` (string, required) - Pinecone vector ID
- `content` (string, required) - Content that was vectorized
- `context` (string, optional) - Short context description
- `type` (string, required) - Memory type (conversation, fact, preference, etc.)
- `tags` (string, optional) - JSON array of tags
- `metadata` (string, optional) - Additional metadata as JSON
- `createdAt` (datetime, required) - Creation timestamp
- `lastAccessed` (datetime, optional) - Last access timestamp
- `accessCount` (integer, optional) - Number of times accessed

## Features Enabled

With this setup, your RAG system will:

1. **Remember user conversations** and provide personalized responses
2. **Answer from memory** when similar questions are asked
3. **Skip dashboard generation** for memory-based answers (direct text responses)
4. **Store user preferences** and context for better future interactions
5. **Use open-source embeddings** via Hugging Face (intfloat/multilingual-e5-large)
6. **Fall back gracefully** if APIs are unavailable

## Testing

The system includes comprehensive testing:

- `npm run test:rag` - Full RAG system test
- `npm run test:huggingface` - Hugging Face embeddings test
- `npm run test:memory` - Memory system test (requires Pinecone API key)

Your chat interface will automatically use memory for authenticated users and provide direct answers for known topics instead of generating new dashboards.