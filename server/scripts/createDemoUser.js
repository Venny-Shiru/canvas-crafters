import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });

async function createDemoUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/canvas-crafters';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if demo user already exists
    const existingUser = await User.findOne({ email: 'demo@canvascrafters.com' });
    if (existingUser) {
      console.log('Demo user already exists!');
      console.log('Email: demo@canvascrafters.com');
      console.log('Username:', existingUser.username);
      await mongoose.disconnect();
      return;
    }

    // Create demo user
    const demoUser = new User({
      username: 'demo_user',
      email: 'demo@canvascrafters.com',
      password: 'demo123',
      bio: 'Demo account for testing Canvas Crafters platform',
      isActive: true
    });

    // Save the user (password will be hashed automatically by pre-save middleware)
    await demoUser.save();

    console.log('✅ Demo user created successfully!');
    console.log('📧 Email: demo@canvascrafters.com');
    console.log('👤 Username: demo_user');
    console.log('🔒 Password: demo123');
    console.log('📝 Bio: Demo account for testing Canvas Crafters platform');

    await mongoose.disconnect();
    console.log('Database connection closed');

  } catch (error) {
    console.error('❌ Error creating demo user:', error.message);

    // Handle specific errors
    if (error.code === 11000) {
      console.error('Duplicate key error - user might already exist');
    }

    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
createDemoUser();