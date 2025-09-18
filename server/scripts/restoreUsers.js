import mongoose from 'mongoose';
import User from '../models/User.js';
import fs from 'fs';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

async function restoreUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/canvas-crafters';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Read the backup file - try multiple possible locations
    let backupPath = '../../../Downloads/canvas-crafters.users.json'; // From server/scripts to Downloads
    if (!fs.existsSync(backupPath)) {
      backupPath = '../../Downloads/canvas-crafters.users.json'; // Alternative path
    }
    if (!fs.existsSync(backupPath)) {
      backupPath = 'C:/Users/USER/Downloads/canvas-crafters.users.json'; // Absolute path
    }
    if (!fs.existsSync(backupPath)) {
      console.error('❌ Backup file not found. Tried locations:');
      console.error('   - ../../../Downloads/canvas-crafters.users.json');
      console.error('   - ../../Downloads/canvas-crafters.users.json');
      console.error('   - C:/Users/USER/Downloads/canvas-crafters.users.json');
      console.log('Please ensure the backup file is in your Downloads folder');
      process.exit(1);
    }

    const backupData = fs.readFileSync(backupPath, 'utf8');
    const users = JSON.parse(backupData);

    console.log(`📄 Found ${users.length} users in backup file`);

    let restoredCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const userData of users) {
      try {
        // Convert MongoDB extended JSON format to regular format
        const processedUser = {
          _id: userData._id?.$oid || userData._id,
          username: userData.username,
          email: userData.email,
          password: userData.password, // Already hashed
          avatar: userData.avatar,
          bio: userData.bio || '',
          canvases: userData.canvases?.map(c => c.$oid || c) || [],
          collaborations: userData.collaborations?.map(c => c.$oid || c) || [],
          isActive: userData.isActive !== false,
          lastLogin: userData.lastLogin?.$date ? new Date(userData.lastLogin.$date) : new Date(),
          resetPasswordToken: userData.resetPasswordToken,
          resetPasswordExpire: userData.resetPasswordExpire?.$date ? new Date(userData.resetPasswordExpire.$date) : undefined,
          createdAt: userData.createdAt?.$date ? new Date(userData.createdAt.$date) : new Date(),
          updatedAt: userData.updatedAt?.$date ? new Date(userData.updatedAt.$date) : new Date()
        };

        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [
            { email: processedUser.email },
            { username: processedUser.username }
          ]
        });

        if (existingUser) {
          console.log(`⏭️  Skipped existing user: ${processedUser.username} (${processedUser.email})`);
          skippedCount++;
          continue;
        }

        // Fix avatar URLs for Render deployment
        if (processedUser.avatar && processedUser.avatar.startsWith('/uploads/')) {
          // Keep local avatar paths as-is, they'll be converted by toSafeObject
        } else if (processedUser.avatar && processedUser.avatar.includes('railway.app')) {
          // Convert old Railway URLs to Render URLs
          processedUser.avatar = processedUser.avatar.replace(
            /https:\/\/canvas-crafters-production\.up\.railway\.app/,
            'https://canvas-crafters.onrender.com'
          );
        }

        // Create the user
        const user = new User(processedUser);
        await user.save({ validateBeforeSave: false }); // Skip validation for restoration

        console.log(`✅ Restored user: ${user.username} (${user.email})`);
        restoredCount++;

      } catch (userError) {
        console.error(`❌ Error restoring user ${userData.username}:`, userError.message);
        errorCount++;
      }
    }

    console.log('\n🎉 User restoration completed!');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Restored: ${restoredCount} users`);
    console.log(`   ⏭️  Skipped: ${skippedCount} users (already exist)`);
    console.log(`   ❌ Errors: ${errorCount} users`);

    // Show current user count
    const totalUsers = await User.countDocuments();
    console.log(`👥 Total users in database: ${totalUsers}`);

    await mongoose.disconnect();
    console.log('Database connection closed');

  } catch (error) {
    console.error('❌ Error during user restoration:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
restoreUsers();