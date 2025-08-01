import mongoose from 'mongoose';
import Canvas from '../models/Canvas.js';

async function fixFailingThumbnails() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb+srv://vennywanjiru:sayjay77@mernstack.gb9x0em.mongodb.net/canvas-crafters?retryWrites=true&w=majority&appName=MERNSTACK');
    console.log('Connected successfully!');
    
    // Define the failing URLs that need to be replaced
    const failingUrls = [
      'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1517467139951-f5a925c9cd02?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1586465786041-b69ac4ac3cd8?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1517080129419-ad4fb3f66c53?w=400&h=300&fit=crop'
    ];
    
    // Reliable replacement URLs - verified working art images
    const reliableUrls = [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', // Abstract fluid art
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', // Creative workspace
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop', // Colorful paint
      'https://images.unsplash.com/photo-1549490349-8643362d4605?w=400&h=300&fit=crop'  // Art supplies
    ];
    
    console.log('Replacing failing thumbnail URLs...\n');
    
    for (let i = 0; i < failingUrls.length; i++) {
      const failingUrl = failingUrls[i];
      const reliableUrl = reliableUrls[i];
      
      const canvasesWithFailingUrl = await Canvas.find({ thumbnail: failingUrl });
      
      if (canvasesWithFailingUrl.length > 0) {
        console.log(`Found ${canvasesWithFailingUrl.length} canvas(es) with failing URL: ${failingUrl}`);
        
        for (const canvas of canvasesWithFailingUrl) {
          console.log(`- Updating "${canvas.title}"`);
          await Canvas.findByIdAndUpdate(canvas._id, { thumbnail: reliableUrl });
        }
        
        console.log(`✅ Replaced with reliable URL: ${reliableUrl}\n`);
      } else {
        console.log(`No canvases found with URL: ${failingUrl}\n`);
      }
    }
    
    // Verify all changes
    console.log('Verification - Current thumbnails:');
    const allCanvases = await Canvas.find({}).select('title thumbnail').limit(10);
    allCanvases.forEach((canvas, i) => {
      console.log(`${i+1}. ${canvas.title}: ${canvas.thumbnail.substring(50, 80)}...`);
    });
    
    console.log('\n✅ All failing thumbnails have been replaced with reliable URLs!');
    
    await mongoose.disconnect();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error fixing thumbnails:', error);
    process.exit(1);
  }
}

fixFailingThumbnails();
