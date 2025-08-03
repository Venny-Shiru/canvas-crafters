// Migration script to fix avatar URLs
// This should be run once to update existing localhost URLs to Railway URLs

const User = require('../models/User');

const fixAvatarUrls = async () => {
  try {
    console.log('Starting avatar URL migration...');
    
    // Find all users with localhost avatar URLs
    const usersWithLocalhostAvatars = await User.find({
      avatar: { $regex: /^http:\/\/localhost:5000/ }
    });
    
    console.log(`Found ${usersWithLocalhostAvatars.length} users with localhost avatar URLs`);
    
    for (const user of usersWithLocalhostAvatars) {
      const oldUrl = user.avatar;
      
      // Extract the path part (e.g., /uploads/avatars/...)
      const path = oldUrl.replace('http://localhost:5000', '');
      
      // Set the new URL with Railway domain
      const newUrl = `https://canvas-crafters-production.up.railway.app${path}`;
      
      user.avatar = newUrl;
      await user.save();
      
      console.log(`Updated user ${user.username}: ${oldUrl} -> ${newUrl}`);
    }
    
    console.log('Avatar URL migration completed successfully!');
    return { success: true, updated: usersWithLocalhostAvatars.length };
    
  } catch (error) {
    console.error('Avatar URL migration failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { fixAvatarUrls };
