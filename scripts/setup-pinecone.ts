import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

async function setupPineconeIndex() {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const indexName = 'orinai-user-memory';
    
    console.log('Checking if index exists...');
    
    try {
      const indexStats = await pinecone.index(indexName).describeIndexStats();
      console.log('Index already exists:', indexStats);
      return;
    } catch {
      console.log('Index does not exist, creating...');
    }

    // Create the index
    await pinecone.createIndex({
      name: indexName,
      dimension: 1536, // Keep 1536 for compatibility, we'll pad the HF embeddings
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });

    console.log(`Index "${indexName}" created successfully!`);
    
    // Wait for index to be ready
    console.log('Waiting for index to be ready...');
    let isReady = false;
    while (!isReady) {
      try {
        const indexStats = await pinecone.index(indexName).describeIndexStats();
        isReady = true;
        console.log('Index is ready:', indexStats);
      } catch {
        console.log('Index not ready yet, waiting...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
  } catch (error) {
    console.error('Error setting up Pinecone index:', error);
  }
}

if (require.main === module) {
  setupPineconeIndex();
}

export { setupPineconeIndex };