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

async function fixDemoUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Delete existing demo user
    const deletedUser = await User.findOneAndDelete({ username: 'demo_user' });
    if (deletedUser) {
      console.log('Deleted existing demo user:', deletedUser.email);
    }
    
    // Create new demo user with correct credentials
    const hashedPassword = await bcrypt.hash('demo123', 12);
    
    const demoUser = new User({
      username: 'demo_user',
      email: 'demo@canvascrafters.com',
      password: hashedPassword,
      bio: 'Welcome to Canvas Crafters! This is a demo account to explore all features.',
      isActive: true,
    });
    
    await demoUser.save();
    console.log('✅ Created new demo user with correct credentials');
    console.log('Demo Credentials:');
    console.log('Email: demo@canvascrafters.com');
    console.log('Username: demo_user');
    console.log('Password: demo123');
    
    // Test the password
    const testUser = await User.findOne({ username: 'demo_user' }).select('+password');
    const isValid = await testUser.comparePassword('demo123');
    console.log('Password verification test:', isValid);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixDemoUser();
