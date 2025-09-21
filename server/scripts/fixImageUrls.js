import mongoose from 'mongoose';
import User from '../models/User.js';
import Canvas from '../models/Canvas.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });

async function fixImageUrls() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/canvas-crafters';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Fix missing avatar URLs (local uploads that are missing on render.com)
    console.log('🔧 Fixing missing avatar URLs...');
    const usersWithLocalAvatars = await User.find({
      avatar: { $regex: '^/uploads/avatars/' }
    });

    console.log(`Found ${usersWithLocalAvatars.length} users with local avatar URLs`);

    let avatarClearedCount = 0;
    for (const user of usersWithLocalAvatars) {
      await User.findByIdAndUpdate(user._id, { avatar: null });
      console.log(`Cleared avatar for user: ${user.username}`);
      avatarClearedCount++;
    }
    console.log(`✅ Cleared ${avatarClearedCount} missing avatar URLs`);

    // Fix broken Unsplash thumbnail URLs
    console.log('🔧 Fixing broken Unsplash thumbnail URLs...');
    const brokenThumbnailUrl = 'https://images.unsplash.com/photo-1549490349-8643362d4605?w=400&h=300&fit=crop';
    const replacementThumbnailUrl = 'https://images.unsplash.com/photo-1578662996442-6536a4f9d5a6?w=400&h=300&fit=crop'; // Working zen garden image

    const canvasesWithBrokenThumbnail = await Canvas.find({
      thumbnail: brokenThumbnailUrl
    });

    console.log(`Found ${canvasesWithBrokenThumbnail.length} canvases with broken thumbnail URL`);

    let thumbnailFixedCount = 0;
    for (const canvas of canvasesWithBrokenThumbnail) {
      await Canvas.findByIdAndUpdate(canvas._id, { thumbnail: replacementThumbnailUrl });
      console.log(`Fixed thumbnail for canvas: "${canvas.title}"`);
      thumbnailFixedCount++;
    }
    console.log(`✅ Fixed ${thumbnailFixedCount} broken thumbnail URLs`);

    console.log('🎉 Image URL fixes complete!');
    console.log(`   • Avatars cleared: ${avatarClearedCount}`);
    console.log(`   • Thumbnails fixed: ${thumbnailFixedCount}`);

    await mongoose.disconnect();
    console.log('Database connection closed');

  } catch (error) {
    console.error('❌ Error fixing image URLs:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
fixImageUrls();