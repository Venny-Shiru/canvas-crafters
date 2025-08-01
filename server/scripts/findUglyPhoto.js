import mongoose from 'mongoose';
import Canvas from '../models/Canvas.js';

async function findAndReplaceAllVariations() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb+srv://vennywanjiru:sayjay77@mernstack.gb9x0em.mongodb.net/canvas-crafters?retryWrites=true&w=majority&appName=MERNSTACK');
    console.log('Connected successfully!');
    
    // The ugly photo ID you mentioned
    const uglyPhotoId = '1547891654-e66ed7ebb968';
    
    // Find any canvas with this photo ID in any form
    const canvasesWithUglyPhoto = await Canvas.find({ 
      thumbnail: { $regex: uglyPhotoId, $options: 'i' } 
    });
    
    console.log(`Found ${canvasesWithUglyPhoto.length} canvas(es) with variations of the ugly photo`);
    
    if (canvasesWithUglyPhoto.length > 0) {
      console.log('\nCanvases found with ugly photo:');
      canvasesWithUglyPhoto.forEach(canvas => {
        console.log(`- ${canvas.title}: ${canvas.thumbnail}`);
      });
      
      // Replace with a completely new beautiful image
      const newThumbnailUrl = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';
      
      for (const canvas of canvasesWithUglyPhoto) {
        console.log(`\nUpdating canvas: ${canvas.title}`);
        console.log(`Old: ${canvas.thumbnail}`);
        await Canvas.findByIdAndUpdate(canvas._id, { thumbnail: newThumbnailUrl });
        console.log(`New: ${newThumbnailUrl}`);
      }
      
      console.log('\n✅ Successfully replaced all variations of the ugly photo!');
      console.log('✅ New thumbnail: Beautiful artistic workspace with creative tools');
    } else {
      console.log('✅ No canvases found with that ugly photo ID');
    }
    
    // Also check for any default/fallback images that might be problematic
    console.log('\nChecking for other potential issues...');
    
    // Show all unique thumbnails to spot patterns
    const allCanvases = await Canvas.find({}).select('thumbnail');
    const uniqueThumbnails = [...new Set(allCanvases.map(c => c.thumbnail))];
    
    console.log(`\nTotal unique thumbnails: ${uniqueThumbnails.length}`);
    console.log('All unique thumbnails:');
    uniqueThumbnails.forEach((thumb, i) => {
      console.log(`${i+1}. ${thumb}`);
    });
    
    await mongoose.disconnect();
    console.log('\nDatabase connection closed');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findAndReplaceAllVariations();
