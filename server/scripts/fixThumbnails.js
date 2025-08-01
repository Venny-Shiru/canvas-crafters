import mongoose from 'mongoose';
import Canvas from '../models/Canvas.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });

// Connect to MongoDB using the same connection as other scripts
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canvas-crafters');

// Working Unsplash photo IDs that are guaranteed to load
const workingThumbnails = [
  'https://images.unsplash.com/photo-1561337945-f25b4e7d4e4e?w=400&h=300&fit=crop', // Abstract art
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop', // Digital art
  'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=400&h=300&fit=crop', // Paint brushes
  'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop', // Color palette
  'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop', // Art supplies
  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop', // Watercolors
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', // Mountain landscape
  'https://images.unsplash.com/photo-1578662996293-221367c2bb3e?w=400&h=300&fit=crop', // Geometric art
  'https://images.unsplash.com/photo-1529258283598-8d6fe60b27f4?w=400&h=300&fit=crop', // Abstract painting
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop', // Colorful abstract
  'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=300&fit=crop', // Forest path
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop', // Forest scene
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop', // Gaming/tech
  'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop', // Typography
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop', // Portrait
  'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop', // Minimalist
  'https://images.unsplash.com/photo-1549490349-8643362d4605?w=400&h=300&fit=crop', // Street art
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop' // Cyberpunk
];

async function fixThumbnails() {
  try {
    console.log('🔧 Fixing thumbnail URLs...');
    
    // Get all canvases
    const canvases = await Canvas.find({});
    console.log(`📊 Found ${canvases.length} canvases to update`);
    
    // Update each canvas with a working thumbnail
    for (let i = 0; i < canvases.length; i++) {
      const canvas = canvases[i];
      const newThumbnail = workingThumbnails[i % workingThumbnails.length];
      
      await Canvas.findByIdAndUpdate(canvas._id, {
        thumbnail: newThumbnail
      });
      
      console.log(`✅ Updated "${canvas.title}" with thumbnail: ${newThumbnail}`);
    }
    
    console.log('🎉 All thumbnails fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing thumbnails:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixThumbnails();
