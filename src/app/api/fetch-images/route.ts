import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    const images = await fetchImagesForTopic(topic);
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Image fetching error:', error);
    return NextResponse.json({ images: [] });
  }
}

async function fetchImagesForTopic(topic: string): Promise<string[]> {
  try {
    // Use multiple sources for images
    const sources = [
      fetchUnsplashImages(topic),
      fetchPixabayImages(topic),
      generatePlaceholderImages(topic)
    ];

    const results = await Promise.allSettled(sources);
    const images: string[] = [];

    results.forEach(result => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        images.push(...result.value);
      }
    });

    return images.slice(0, 6); // Return max 6 images
  } catch (error) {
    console.error('Error fetching images:', error);
    return generatePlaceholderImages(topic);
  }
}

async function fetchUnsplashImages(topic: string): Promise<string[]> {
  try {
    // TODO: Add Unsplash API integration
    // const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(topic)}&per_page=3`, {
    //   headers: {
    //     'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
    //   }
    // });
    // const data = await response.json();
    // return data.results.map(photo => photo.urls.regular);
    
    return [];
  } catch (error) {
    console.error('Unsplash fetch failed:', error);
    return [];
  }
}

async function fetchPixabayImages(topic: string): Promise<string[]> {
  try {
    // TODO: Add Pixabay API integration
    // const response = await fetch(`https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(topic)}&per_page=3`);
    // const data = await response.json();
    // return data.hits.map(hit => hit.webformatURL);
    
    return [];
  } catch (error) {
    console.error('Pixabay fetch failed:', error);
    return [];
  }
}

function generatePlaceholderImages(topic: string): string[] {
  const baseUrl = 'https://picsum.photos';
  const sizes = [
    { width: 800, height: 600 },
    { width: 600, height: 400 },
    { width: 500, height: 500 }
  ];

  return sizes.map((size, index) => 
    `${baseUrl}/${size.width}/${size.height}?random=${topic.length + index}`
  );
}