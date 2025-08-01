import mongoose from 'mongoose';
import User from '../models/User.js';
import Canvas from '../models/Canvas.js';

// Connect to database
import mongoose from 'mongoose';
import Canvas from '../models/Canvas.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });

const clearSampleData = async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canvas-crafters');

console.log('🧹 Starting sample data cleanup...');

// Sample user emails to identify which users to remove
const sampleUserEmails = [
  'artistic.soul@example.com',
  'digital.dreamer@example.com',
  'color.master@example.com',
  'abstract.vision@example.com',
  'neon.ninja@example.com',
  'pixel.artist@example.com',
  'vector.vibe@example.com',
  'surreal.scape@example.com',
  'minimal.muse@example.com',
  'cyber.aesthetic@example.com'
];

try {
  // Find sample users
  console.log('🔍 Finding sample users...');
  const sampleUsers = await User.find({ email: { $in: sampleUserEmails } });
  console.log(`Found ${sampleUsers.length} sample users`);
  
  // Get their IDs
  const sampleUserIds = sampleUsers.map(user => user._id);
  
  // Delete all canvases owned by sample users
  console.log('🗑️ Removing sample canvases...');
  const canvasDeleteResult = await Canvas.deleteMany({ owner: { $in: sampleUserIds } });
  console.log(`✅ Deleted ${canvasDeleteResult.deletedCount} sample canvases`);
  
  // Delete sample users
  console.log('🗑️ Removing sample users...');
  const userDeleteResult = await User.deleteMany({ email: { $in: sampleUserEmails } });
  console.log(`✅ Deleted ${userDeleteResult.deletedCount} sample users`);
  
  // Display final statistics
  const totalCanvases = await Canvas.countDocuments();
  const totalUsers = await User.countDocuments();
  
  console.log('\n📊 Final Database Statistics:');
  console.log(`   • Total Canvases: ${totalCanvases}`);
  console.log(`   • Total Users: ${totalUsers}`);
  
  console.log('\n🎉 Sample data cleanup complete!');
  console.log('The explore page should now be empty of sample canvases.');
  
} catch (error) {
  console.error('❌ Error during cleanup:', error);
} finally {
  await mongoose.disconnect();
  console.log('🔌 Database connection closed');
}
