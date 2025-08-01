import mongoose from 'mongoose';
import Canvas from '../models/Canvas.js';

// Connect to database
await mongoose.connect(process.env.MONGODB_URI || 'process.env.MONGODB_URI || \"mongodb://localhost:27017/canvas-crafters\"');

console.log('🖼️ Fixing canvas thumbnails with reliable URLs...');

// Using a more reliable approach with verified Unsplash URLs
const reliableImageUrls = [
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1494790108755-2616b612b642?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=300&fit=crop'
];

try {
  // Get all canvases
  console.log('🔍 Finding canvases to update...');
  const canvases = await Canvas.find({});
  console.log(`Found ${canvases.length} canvases to update`);
  
  // Update each canvas with a reliable thumbnail
  for (let i = 0; i < canvases.length; i++) {
    const canvas = canvases[i];
    const newThumbnail = reliableImageUrls[i % reliableImageUrls.length];
    
    await Canvas.findByIdAndUpdate(canvas._id, {
      thumbnail: newThumbnail
    });
    
    console.log(`✅ Updated "${canvas.title}" with new thumbnail`);
  }
  
  console.log('\n🎉 All thumbnails updated successfully!');
  console.log(`📊 Updated ${canvases.length} canvases with reliable thumbnail URLs`);
  
} catch (error) {
  console.error('❌ Error updating thumbnails:', error);
} finally {
  await mongoose.disconnect();
  console.log('🔌 Database connection closed');
}
