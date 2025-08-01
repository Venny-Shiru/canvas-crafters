import mongoose from 'mongoose';
import Canvas from '../models/Canvas.js';

// Connect to database
await mongoose.connect(process.env.MONGODB_URI || 'process.env.MONGODB_URI || \"mongodb://localhost:27017/canvas-crafters\"');

console.log('🎨 Creating beautiful, art-focused thumbnails...');

// Curated art-focused Unsplash URLs - each unique and relevant to digital art/creativity
const artFocusedThumbnails = [
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop', // Abstract colorful art
  'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop', // Paint brushes and palette
  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop', // Digital art workspace
  'https://images.unsplash.com/photo-1578662996293-221367c2bb3e?w=400&h=300&fit=crop', // Abstract painting
  'https://images.unsplash.com/photo-1549490349-8643362d4605?w=400&h=300&fit=crop', // Street art graffiti
  'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=300&fit=crop', // Nature mandala
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop', // Neon cyberpunk
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', // Geometric patterns
  'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop', // Watercolor splash
  'https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=400&h=300&fit=crop', // Digital design tools
  'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop', // Zen minimalist
  'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop', // Typography art
  'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop', // Creative lettering
  'https://images.unsplash.com/photo-1495954484750-af469f2f9be5?w=400&h=300&fit=crop', // Portrait sketch
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop', // Pixel art retro
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', // Industrial design
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop', // Abstract composition
  'https://images.unsplash.com/photo-1533158307858-92c10669d44c?w=400&h=300&fit=crop', // Anime character art
  'https://images.unsplash.com/photo-1517467139951-f5a925c9cd02?w=400&h=300&fit=crop', // Surreal landscape
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop', // Forest nature art
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop', // Portrait study
  'https://images.unsplash.com/photo-1517080129419-ad4fb3f66c53?w=400&h=300&fit=crop', // Abstract geometric
  'https://images.unsplash.com/photo-1586465786041-b69ac4ac3cd8?w=400&h=300&fit=crop', // Space galaxy art
  'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop', // Urban cityscape
  'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=300&fit=crop', // Ocean waves abstract
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop', // Musical visualization
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', // Mandala spiritual
  'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop', // Light and shadow
  'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop', // Typography design
  'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=300&fit=crop', // Creative workspace
];

try {
  // Get all canvases
  console.log('🔍 Finding canvases to update...');
  const canvases = await Canvas.find({}).sort({ createdAt: 1 }); // Sort by creation date for consistency
  console.log(`Found ${canvases.length} canvases to update`);
  
  // Update each canvas with a unique, art-focused thumbnail
  for (let i = 0; i < canvases.length; i++) {
    const canvas = canvases[i];
    // Ensure we don't exceed our thumbnail array and each gets a unique one
    const thumbnailIndex = i % artFocusedThumbnails.length;
    const newThumbnail = artFocusedThumbnails[thumbnailIndex];
    
    await Canvas.findByIdAndUpdate(canvas._id, {
      thumbnail: newThumbnail
    });
    
    console.log(`✅ Updated "${canvas.title}" with art-focused thumbnail ${thumbnailIndex + 1}`);
  }
  
  console.log('\n🎉 All thumbnails updated with art-focused images!');
  console.log(`📊 Updated ${canvases.length} canvases with unique, relevant thumbnails`);
  console.log('🎨 Each thumbnail now reflects digital art, creativity, and artistic themes');
  
} catch (error) {
  console.error('❌ Error updating thumbnails:', error);
} finally {
  await mongoose.disconnect();
  console.log('🔌 Database connection closed');
}
