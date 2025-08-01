import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
dotenv.config({ path: join(__dirname, '..', '.env') });

async function testDemoUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find all users to see what exists
    const allUsers = await User.find({}).select('+password');
    console.log('All users in database:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}, Username: ${user.username}, Active: ${user.isActive}`);
    });
    
    // Find the demo user by username
    const demoUser = await User.findOne({ username: 'demo_user' }).select('+password');
    if (demoUser) {
      console.log('\nDemo user found:');
      console.log('- Email:', demoUser.email);
      console.log('- Username:', demoUser.username);
      console.log('- isActive:', demoUser.isActive);
      console.log('- Password hash:', demoUser.password ? demoUser.password.substring(0, 20) + '...' : 'No password');
      
      // Test multiple passwords
      const passwords = ['demo123', 'demo_password', 'password123', 'demo'];
      for (const pwd of passwords) {
        const isValid = await demoUser.comparePassword(pwd);
        console.log(`- Password "${pwd}" is valid:`, isValid);
      }
    } else {
      console.log('Demo user not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testDemoUser();
