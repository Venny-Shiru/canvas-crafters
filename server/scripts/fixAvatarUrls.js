import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });

async function fixAvatarUrls() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/canvas-crafters';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all users with avatar URLs containing Railway domain
    const usersWithRailwayUrls = await User.find({
      avatar: { $regex: 'canvas-crafters-production\\.up\\.railway\\.app' }
    });

    console.log(`Found ${usersWithRailwayUrls.length} users with Railway avatar URLs`);

    let updatedCount = 0;

    for (const user of usersWithRailwayUrls) {
      // Replace Railway URL with Render URL
      const oldUrl = user.avatar;
      const newUrl = oldUrl.replace(
        'https://canvas-crafters-production.up.railway.app',
        'https://canvas-crafters.onrender.com'
      );

      // Update the user
      await User.findByIdAndUpdate(user._id, { avatar: newUrl });
      console.log(`Updated ${user.username}: ${oldUrl} → ${newUrl}`);
      updatedCount++;
    }

    console.log(`✅ Successfully updated ${updatedCount} avatar URLs`);

    // Also check for any localhost URLs that should be updated for production
    if (process.env.NODE_ENV === 'production') {
      const usersWithLocalhostUrls = await User.find({
        avatar: { $regex: 'http://localhost:5000' }
      });

      console.log(`Found ${usersWithLocalhostUrls.length} users with localhost avatar URLs in production`);

      for (const user of usersWithLocalhostUrls) {
        const oldUrl = user.avatar;
        const newUrl = oldUrl.replace(
          'http://localhost:5000',
          'https://canvas-crafters.onrender.com'
        );

        await User.findByIdAndUpdate(user._id, { avatar: newUrl });
        console.log(`Updated localhost URL for ${user.username}: ${oldUrl} → ${newUrl}`);
        updatedCount++;
      }
    }

    console.log(`🎉 Total avatar URLs updated: ${updatedCount}`);

    await mongoose.disconnect();
    console.log('Database connection closed');

  } catch (error) {
    console.error('❌ Error fixing avatar URLs:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
fixAvatarUrls();