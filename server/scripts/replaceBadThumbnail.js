import mongoose from 'mongoose';
import Canvas from '../models/Canvas.js';

async function replaceBadThumbnail() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb+srv://vennywanjiru:sayjay77@mernstack.gb9x0em.mongodb.net/canvas-crafters?retryWrites=true&w=majority&appName=MERNSTACK');
    console.log('Connected successfully!');
    
    const badThumbnailUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
    
    // Find all canvases with this thumbnail
    const canvasesWithBadThumbnail = await Canvas.find({ thumbnail: badThumbnailUrl });
    console.log(`Found ${canvasesWithBadThumbnail.length} canvas(es) with the bad thumbnail`);
    
    if (canvasesWithBadThumbnail.length > 0) {
      // Replace with a completely different beautiful art image
      const newThumbnailUrl = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop';
      
      for (const canvas of canvasesWithBadThumbnail) {
        console.log(`Updating canvas: ${canvas.title} (ID: ${canvas._id})`);
        await Canvas.findByIdAndUpdate(canvas._id, { thumbnail: newThumbnailUrl });
      }
      
      console.log('✅ Successfully replaced all instances of the current backup thumbnail!');
      console.log(`✅ New thumbnail: Beautiful colorful abstract art with paint strokes`);
    } else {
      console.log('✅ No canvases found with that backup thumbnail URL');
    }
    
    // Verify the replacement
    const stillExists = await Canvas.find({ thumbnail: badThumbnailUrl });
    if (stillExists.length === 0) {
      console.log('✅ Verification: Backup thumbnail completely replaced in database');
    } else {
      console.log(`❌ Warning: ${stillExists.length} canvas(es) still have the backup thumbnail`);
    }
    
    await mongoose.disconnect();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error replacing thumbnail:', error);
    process.exit(1);
  }
}

replaceBadThumbnail();
