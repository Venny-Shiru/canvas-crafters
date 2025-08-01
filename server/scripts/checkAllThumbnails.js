import mongoose from 'mongoose';
import Canvas from '../models/Canvas.js';

async function checkAllThumbnails() {
  try {
    import mongoose from 'mongoose';
import Canvas from '../models/Canvas.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });

async function checkAllThumbnails() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canvas-crafters');
    
    const allCanvases = await Canvas.find({}).select('title thumbnail');
    console.log('Total canvases:', allCanvases.length);
    console.log('\nAll current thumbnails:');
    
    allCanvases.forEach((canvas, i) => {
      console.log(`${i+1}. ${canvas.title}`);
      console.log(`   Thumbnail: ${canvas.thumbnail}`);
      console.log('');
    });
    
    // Check for any duplicates
    const thumbnailCounts = {};
    allCanvases.forEach(canvas => {
      thumbnailCounts[canvas.thumbnail] = (thumbnailCounts[canvas.thumbnail] || 0) + 1;
    });
    
    console.log('Duplicate thumbnails:');
    Object.entries(thumbnailCounts).forEach(([url, count]) => {
      if (count > 1) {
        console.log(`${count}x: ${url}`);
      }
    });
    
    // Check specifically for the bad thumbnail
    const badThumbnail = 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&h=300&fit=crop';
    const badThumbnailCanvases = allCanvases.filter(c => c.thumbnail === badThumbnail);
    
    if (badThumbnailCanvases.length > 0) {
      console.log('\n❌ BAD THUMBNAIL STILL FOUND:');
      badThumbnailCanvases.forEach(canvas => {
        console.log(`- ${canvas.title} (${canvas._id})`);
      });
    } else {
      console.log('\n✅ Bad thumbnail not found in database');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAllThumbnails();
