import mongoose from 'mongoose';
import Canvas from '../models/Canvas.js';

async function searchAllThumbnails() {
  try {
    await mongoose.connect('mongodb://localhost:27017/canvas-crafters');
    
    // Search for any thumbnail containing that photo ID
    const photoId = '1547891654-e66ed7ebb968';
    const canvases = await Canvas.find({ 
      thumbnail: { $regex: photoId, $options: 'i' } 
    });
    
    console.log('Canvases with that photo ID:', canvases.length);
    canvases.forEach(canvas => {
      console.log('- Title:', canvas.title);
      console.log('- Thumbnail:', canvas.thumbnail);
      console.log('---');
    });
    
    // Also show first 5 thumbnails to verify
    const allCanvases = await Canvas.find({}).select('title thumbnail').limit(5);
    console.log('\nFirst 5 current thumbnails:');
    allCanvases.forEach((c, i) => {
      console.log(`${i+1}. ${c.title}: ${c.thumbnail.substring(0, 80)}...`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

searchAllThumbnails();
