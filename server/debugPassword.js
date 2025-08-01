import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
dotenv.config({ path: join(__dirname, '..', '.env') });

async function debugPasswordIssue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find the demo user
    const demoUser = await User.findOne({ username: 'demo_user' }).select('+password');
    if (!demoUser) {
      console.log('Demo user not found');
      return;
    }
    
    console.log('Demo user password hash:', demoUser.password);
    
    // Test direct bcrypt comparison
    const directComparison = await bcrypt.compare('demo123', demoUser.password);
    console.log('Direct bcrypt.compare result:', directComparison);
    
    // Test user method
    const methodComparison = await demoUser.comparePassword('demo123');
    console.log('User method comparison:', methodComparison);
    
    // Create a fresh hash and test
    const freshHash = await bcrypt.hash('demo123', 12);
    console.log('Fresh hash:', freshHash);
    const freshTest = await bcrypt.compare('demo123', freshHash);
    console.log('Fresh hash test:', freshTest);
    
    // Try updating the user with a new password directly
    demoUser.password = 'demo123'; // This should trigger the pre-save hook
    await demoUser.save();
    console.log('Updated user password via model save');
    
    // Test again
    const updatedUser = await User.findOne({ username: 'demo_user' }).select('+password');
    const finalTest = await updatedUser.comparePassword('demo123');
    console.log('Final test after model save:', finalTest);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugPasswordIssue();
