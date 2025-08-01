import mongoose from 'mongoose';
import User from '../models/User.js';

async function getTestUsers() {
  try {
    await mongoose.connect('process.env.MONGODB_URI || \"mongodb://localhost:27017/canvas-crafters\"');
    
    const users = await User.find({}).select('username email').limit(5);
    console.log('Available test users:');
    users.forEach((user, i) => {
      console.log(`${i+1}. Username: ${user.username}, Email: ${user.email}`);
    });
    
    if (users.length > 0) {
      console.log('\nYou can use any of these credentials to test:');
      console.log('Password for sample users: "password123"');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getTestUsers();
