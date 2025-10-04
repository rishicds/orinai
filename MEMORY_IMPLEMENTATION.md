# RAG Implementation with User Memory

## Overview

This implementation provides a sophisticated RAG (Retrieval-Augmented Generation) system with persistent user memory, similar to ChatGPT's conversation memory. The system combines Pinecone for vector storage and Appwrite for structured metadata management.

## Architecture Decision: Hybrid Pinecone + Appwrite

### Why Pinecone?
- **Vector Storage**: Excellent for storing conversation embeddings
- **Semantic Search**: Fast similarity search to retrieve relevant memories
- **Scalability**: Handles large-scale vector operations efficiently
- **RAG Optimization**: Purpose-built for retrieval-augmented generation

### Why Appwrite?
- **Already Integrated**: Existing authentication and database setup
- **Structured Data**: Good for user profiles, session metadata, and relationships
- **User Management**: Handles user authentication and permissions
- **Reliability**: Proven database for structured queries

### Hybrid Benefits
- **Best of Both Worlds**: Vector search + structured queries
- **Performance**: Fast retrieval with rich metadata
- **Flexibility**: Easy to extend and maintain
- **Cost-Effective**: Optimized storage for different data types

## Features

### 1. User Memory System
- **Conversation Storage**: Stores user conversations as vector embeddings
- **Context Retrieval**: Finds relevant past conversations for current queries
- **Memory Importance**: Assigns importance scores to conversations
- **Smart Filtering**: Retrieves only highly relevant memories (similarity > 0.75)

### 2. Memory-Enhanced Generation
- **Context Building**: Combines current query with relevant memories
- **Smart Caching**: Returns cached responses for highly similar queries (similarity > 0.9)
- **Progressive Enhancement**: Falls back to normal generation if no memories found

### 3. User Profile Management
- **Preferences**: Communication style, expertise level, interests
- **Memory Settings**: Enable/disable memory, retention period, importance threshold
- **Personalization**: Tailors responses based on user preferences

### 4. Memory Search & Management
- **Semantic Search**: Search through conversation history
- **Recent Memories**: View recent conversations
- **Memory Analytics**: Track memory usage and relevance

## File Structure

```
src/
├── lib/
│   ├── memory/
│   │   └── user-memory.ts          # Core memory management
│   ├── langchain/
│   │   └── pipeline-with-memory.ts # Enhanced processing pipeline
│   └── appwrite/
│       └── database.ts             # Extended with profile/memory functions
├── components/
│   └── memory/
│       └── UserMemoryPanel.tsx     # Memory management UI
├── app/
│   ├── api/
│   │   ├── memory/
│   │   │   └── route.ts            # Memory API endpoints
│   │   └── generate/
│   │       └── route.ts            # Enhanced generation API
│   └── memory/
│       └── page.tsx                # Memory management page
└── scripts/
    └── setup-pinecone.ts           # Pinecone index setup
```

## Setup Instructions

### 1. Environment Variables
Add to your `.env` file:
```env
# Existing Pinecone config
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_URL=your_pinecone_url

# New Appwrite collections
APPWRITE_COLLECTION_USER_PROFILE=user_profiles
APPWRITE_COLLECTION_USER_MEMORY_METADATA=user_memory_metadata

# AI service for embeddings (using Gemini key as fallback)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 2. Pinecone Index Setup
```bash
npm run setup:pinecone
```

This creates the `orinai-user-memory` index with:
- Dimension: 1536 (OpenAI text-embedding-3-small)
- Metric: cosine similarity
- Serverless deployment

### 3. Appwrite Collections
Create these collections in your Appwrite database:

#### user_profiles
```json
{
  "userId": "string",
  "preferences": "object",
  "memorySettings": "object",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

#### user_memory_metadata
```json
{
  "userId": "string",
  "memoryId": "string",
  "topic": "string",
  "importance": "integer",
  "lastAccessed": "datetime",
  "accessCount": "integer",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## API Endpoints

### Memory Management
- `GET /api/memory?action=profile` - Get user profile
- `GET /api/memory?action=search&query=...` - Search memories
- `GET /api/memory?action=recent` - Get recent memories
- `POST /api/memory` - Update profile or store memory

### Enhanced Generation
- `POST /api/generate` - Generate with memory (set `useMemory: true`)

## Usage Examples

### 1. Basic Chat with Memory
```javascript
// The chat interface automatically uses memory for authenticated users
const response = await fetch("/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
    query: "Tell me about quantum computing",
    useMemory: true 
  })
});
```

### 2. Search User Memories
```javascript
const memories = await fetch("/api/memory?action=search&query=quantum computing");
const data = await memories.json();
console.log(data.memories); // Array of relevant memories
```

### 3. Update User Preferences
```javascript
await fetch("/api/memory", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "updateProfile",
    preferences: {
      communicationStyle: "technical",
      expertiseLevel: "advanced"
    },
    memorySettings: {
      enableMemory: true,
      retentionDays: 90,
      importanceThreshold: 6
    }
  })
});
```

## Memory Processing Flow

1. **Query Input**: User submits a query
2. **Memory Search**: System searches for relevant past conversations
3. **Context Building**: Combines current query with memory context
4. **Cache Check**: If high similarity (>0.9), returns cached response
5. **Enhanced Generation**: Uses memory context to improve response
6. **Memory Storage**: Stores new conversation in vector database

## Memory Importance Scoring

The system assigns importance scores (1-10) based on:
- **Keywords**: Presence of memory-related terms ("remember", "important")
- **Length**: Longer conversations get higher scores
- **User Indicators**: Explicit importance signals from users
- **Topic Relevance**: Domain-specific importance

## Privacy & Data Management

- **User Control**: Users can disable memory or adjust retention
- **Data Isolation**: Each user's memories are completely isolated
- **Configurable Retention**: Automatic cleanup based on user settings
- **Similarity Thresholds**: Only highly relevant memories are retrieved

## Performance Optimizations

- **Batch Processing**: Efficient vector operations
- **Caching**: High-similarity queries return cached responses
- **Importance Filtering**: Only stores meaningful conversations
- **Similarity Thresholds**: Reduces noise in memory retrieval

## Future Enhancements

1. **Advanced NLP**: Better entity extraction and topic modeling
2. **Memory Summarization**: Compress old memories while preserving key information
3. **Cross-Session Context**: Connect related conversations across sessions
4. **Memory Analytics**: Detailed insights into memory usage patterns
5. **Export/Import**: Allow users to export their memory data

## Access the Memory Panel

Visit `/memory` in your application to access the user memory management interface where users can:
- Configure memory settings
- Search through their conversation history
- Update their preferences
- View memory analytics

## Troubleshooting

### Common Issues
1. **Pinecone Connection**: Ensure API key and region are correct
2. **Embeddings**: Verify OpenAI/Gemini API key is valid
3. **Collections**: Make sure Appwrite collections are created
4. **Permissions**: Check Appwrite database permissions for authenticated users

### Debug Logs
The system provides detailed logging:
- `[UserMemory]` - Memory operations
- `[Pipeline]` - Processing steps
- `[API]` - API request/response logs

This implementation provides a robust foundation for building ChatGPT-like memory capabilities in your application, combining the power of vector search with structured data management.