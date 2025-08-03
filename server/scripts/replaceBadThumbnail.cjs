import mongoose from 'mongoose';
import Canvas from '../models/Canvas.js';

async function replaceBadThumbnail() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canvas-crafters');
    console.log('Connected successfully!');
    
    const badThumbnailUrl = 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&h=300&fit=crop';
    
    // Find all canvases with this thumbnail
    const canvasesWithBadThumbnail = await Canvas.find({ thumbnail: badThumbnailUrl });
    console.log(`Found ${canvasesWithBadThumbnail.length} canvas(es) with the bad thumbnail`);
    
    if (canvasesWithBadThumbnail.length > 0) {
      // Replace with a beautiful abstract art image
      const newThumbnailUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
      
      for (const canvas of canvasesWithBadThumbnail) {
        console.log(`Updating canvas: ${canvas.title} (ID: ${canvas._id})`);
        await Canvas.findByIdAndUpdate(canvas._id, { thumbnail: newThumbnailUrl });
      }
      
      console.log('✅ Successfully replaced all instances of the bad thumbnail!');
      console.log(`✅ New thumbnail: Beautiful abstract fluid art with vibrant colors`);
    } else {
      console.log('✅ No canvases found with that thumbnail URL');
    }
    
    // Verify the replacement
    const stillExists = await Canvas.find({ thumbnail: badThumbnailUrl });
    if (stillExists.length === 0) {
      console.log('✅ Verification: Bad thumbnail completely removed from database');
    } else {
      console.log(`❌ Warning: ${stillExists.length} canvas(es) still have the bad thumbnail`);
    }
    
    await mongoose.disconnect();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error replacing thumbnail:', error);
    process.exit(1);
  }
}

replaceBadThumbnail();
