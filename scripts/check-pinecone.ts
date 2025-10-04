import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

async function checkExistingIndex() {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    console.log('Listing all available indexes...');
    
    // List all indexes to see what's available
    const indexes = await pinecone.listIndexes();
    console.log('Available indexes:', indexes.indexes?.map(idx => ({
      name: idx.name,
      dimension: idx.dimension,
      metric: idx.metric,
      status: idx.status?.ready ? 'Ready' : 'Not Ready'
    })));
    
    if (indexes.indexes && indexes.indexes.length > 0) {
      const firstIndex = indexes.indexes[0];
      console.log(`\nChecking first index: ${firstIndex.name}`);
      try {
        const indexStats = await pinecone.index(firstIndex.name).describeIndexStats();
        console.log('Index stats:', indexStats);
      } catch (error) {
        console.log('Could not get stats for index:', error);
      }
    }
    
  } catch (error) {
    console.error('Error checking indexes:', error);
  }
}

if (require.main === module) {
  checkExistingIndex();
}

export { checkExistingIndex };