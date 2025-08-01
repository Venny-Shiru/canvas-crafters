import mongoose from 'mongoose';
import User from '../models/User.js';
import Canvas from '../models/Canvas.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Connect to database
await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://vennywanjiru:sayjay77@mernstack.gb9x0em.mongodb.net/canvas-crafters?retryWrites=true&w=majority&appName=MERNSTACK');

console.log('🎨 Creating Canvas Crafters artistic community...');

// Target statistics - adjusted for manageable demo data
const TARGET_CANVASES = 30;
const TARGET_ARTISTS = 12;
const TARGET_VIEWS = 850;

// Verified Unsplash photo IDs for thumbnails
const validThumbnailIds = [
  '1578662996293-221367c2bb3e', '1541961017774-22349e4a1262', '1567095761381-15484e11dd67',
  '1518709268805-4e9042af2176', '1544966503-7cc5ac882d5f', '1549490349-8643362d4605',
  '1502134249126-9f3755a50d78', '1511512578047-dfb367046420', '1441974231531-c6227db76b6e',
  '1611224923853-80b023f02d71', '1507003211169-0a1dd7228f2d', '1482442120256-9c03866de4db',
  '1561037404-61cd46aa615b', '1547891654-e66ed7ebb968', '1506905925346-21bda4d32df4',
  '1551033406-611cf9a28251', '1582555172866-65734ff2db35', '1518709268805-4e9042af2176'
];

// Art styles and themes for diverse content
const artStyles = [
  'Abstract', 'Minimalist', 'Cyberpunk', 'Watercolor', 'Digital', 'Pixel Art', 
  'Street Art', 'Surreal', 'Geometric', 'Nature', 'Portrait', 'Landscape',
  'Typography', 'Mandala', 'Anime', 'Retro', 'Modern', 'Classic', 'Experimental',
  'Pop Art', 'Impressionist', 'Futuristic', 'Gothic', 'Renaissance', 'Baroque'
];

const themes = [
  'Ocean', 'Space', 'Forest', 'City', 'Dreams', 'Technology', 'Music', 'Love',
  'Freedom', 'Mystery', 'Adventure', 'Peace', 'Energy', 'Time', 'Memory',
  'Hope', 'Journey', 'Transformation', 'Unity', 'Discovery', 'Emotion', 'Spirit',
  'Light', 'Shadow', 'Movement', 'Silence', 'Storm', 'Garden', 'Galaxy', 'Soul'
];

const adjectives = [
  'Vibrant', 'Ethereal', 'Bold', 'Gentle', 'Mysterious', 'Radiant', 'Serene',
  'Dynamic', 'Elegant', 'Powerful', 'Delicate', 'Intense', 'Flowing', 'Crisp',
  'Warm', 'Cool', 'Luminous', 'Deep', 'Soft', 'Sharp', 'Rich', 'Pure',
  'Complex', 'Simple', 'Dramatic', 'Subtle', 'Wild', 'Calm', 'Ancient', 'Modern'
];

// Generate artistic canvas titles and descriptions
function generateCanvasData() {
  const style = artStyles[Math.floor(Math.random() * artStyles.length)];
  const theme = themes[Math.floor(Math.random() * themes.length)];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  
  const titles = [
    `${adj} ${theme} ${style}`,
    `${style} ${theme} Study`,
    `${adj} ${style} Interpretation`,
    `${theme} in ${style}`,
    `${adj} ${theme} Vision`,
    `${style} ${theme} Dreams`,
    `${theme} ${style} Symphony`,
    `${adj} ${theme} Meditation`,
    `${style} ${theme} Journey`,
    `${theme} ${style} Essence`
  ];
  
  const title = titles[Math.floor(Math.random() * titles.length)];
  
  const descriptions = [
    `An exploration of ${theme.toLowerCase()} through ${style.toLowerCase()} techniques, capturing the essence of ${adj.toLowerCase()} artistic expression.`,
    `A ${adj.toLowerCase()} interpretation of ${theme.toLowerCase()} using contemporary ${style.toLowerCase()} methods and innovative visual storytelling.`,
    `This ${style.toLowerCase()} piece delves into the concept of ${theme.toLowerCase()}, creating a ${adj.toLowerCase()} visual narrative that speaks to the soul.`,
    `Inspired by ${theme.toLowerCase()}, this ${adj.toLowerCase()} ${style.toLowerCase()} artwork explores the boundaries between reality and imagination.`,
    `A masterful blend of ${style.toLowerCase()} artistry and ${theme.toLowerCase()} symbolism, resulting in a truly ${adj.toLowerCase()} visual experience.`
  ];
  
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];
  
  // Generate realistic canvas data with SVG-like objects
  const objects = [];
  const numObjects = Math.floor(Math.random() * 8) + 3; // 3-10 objects
  
  for (let i = 0; i < numObjects; i++) {
    const objectTypes = ['rect', 'circle', 'ellipse', 'path', 'polygon', 'line'];
    const type = objectTypes[Math.floor(Math.random() * objectTypes.length)];
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
    ];
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    switch (type) {
      case 'rect':
        objects.push({
          type: 'rect',
          x: Math.floor(Math.random() * 400),
          y: Math.floor(Math.random() * 300),
          width: Math.floor(Math.random() * 150) + 50,
          height: Math.floor(Math.random() * 100) + 30,
          fill: color,
          opacity: Math.random() * 0.5 + 0.5
        });
        break;
      case 'circle':
        objects.push({
          type: 'circle',
          cx: Math.floor(Math.random() * 400),
          cy: Math.floor(Math.random() * 300),
          r: Math.floor(Math.random() * 80) + 20,
          fill: color,
          opacity: Math.random() * 0.4 + 0.6
        });
        break;
      case 'ellipse':
        objects.push({
          type: 'ellipse',
          cx: Math.floor(Math.random() * 400),
          cy: Math.floor(Math.random() * 300),
          rx: Math.floor(Math.random() * 100) + 30,
          ry: Math.floor(Math.random() * 60) + 20,
          fill: color,
          opacity: Math.random() * 0.3 + 0.7
        });
        break;
      default:
        objects.push({
          type: 'rect',
          x: Math.floor(Math.random() * 400),
          y: Math.floor(Math.random() * 300),
          width: Math.floor(Math.random() * 100) + 40,
          height: Math.floor(Math.random() * 80) + 30,
          fill: color
        });
    }
  }
  
  // Generate tags
  const allTags = [
    style.toLowerCase(), theme.toLowerCase(), adj.toLowerCase(),
    'digital-art', 'creative', 'artistic', 'visual', 'design', 'contemporary',
    'expressive', 'innovative', 'unique', 'original', 'inspiring', 'beautiful'
  ];
  
  const tags = [];
  const numTags = Math.floor(Math.random() * 4) + 3; // 3-6 tags
  while (tags.length < numTags && tags.length < allTags.length) {
    const tag = allTags[Math.floor(Math.random() * allTags.length)];
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }
  
  return {
    title,
    description,
    tags,
    canvasData: JSON.stringify({
      version: "1.0",
      objects
    })
  };
}

// Generate artist usernames
function generateArtistName() {
  const prefixes = [
    'Art', 'Neo', 'Pixel', 'Digital', 'Cosmic', 'Dream', 'Color', 'Light',
    'Shadow', 'Flow', 'Zen', 'Urban', 'Wild', 'Pure', 'Mystic', 'Retro',
    'Cyber', 'Void', 'Echo', 'Nova', 'Luna', 'Solar', 'Storm', 'Silk'
  ];
  
  const suffixes = [
    'Artist', 'Creator', 'Master', 'Painter', 'Dreamer', 'Visionary', 'Sage',
    'Soul', 'Spirit', 'Muse', 'Craft', 'Studio', 'Workshop', 'Gallery',
    'Palette', 'Canvas', 'Brush', 'Design', 'Vision', 'Works', 'Lab', 'Space'
  ];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  
  return Math.random() > 0.5 ? `${prefix}${suffix}` : `${prefix}${suffix}${number}`;
}

// Clear existing sample data
console.log('🗑️ Clearing existing data...');
await Canvas.deleteMany({});
await User.deleteMany({ email: { $regex: /@art(ist|gallery|studio|craft)\.com$/ } });

// Create artists
console.log(`👥 Creating ${TARGET_ARTISTS} artists...`);
const artists = [];

for (let i = 0; i < TARGET_ARTISTS; i++) {
  const username = generateArtistName();
  const email = `${username.toLowerCase()}@artist.com`;
  const hashedPassword = await bcrypt.hash('ArtPass123!', 12);
  
  const artist = new User({
    username,
    email,
    password: hashedPassword,
    avatar: `https://images.unsplash.com/photo-${validThumbnailIds[i % validThumbnailIds.length]}?w=150&h=150&fit=crop&crop=face`,
    isActive: true
  });
  
  await artist.save();
  artists.push(artist);
  
  if ((i + 1) % 50 === 0) {
    console.log(`✅ Created ${i + 1} artists...`);
  }
}

console.log(`🎨 Creating ${TARGET_CANVASES} canvases...`);

// Calculate views distribution to reach TARGET_VIEWS
const avgViewsPerCanvas = Math.floor(TARGET_VIEWS / TARGET_CANVASES);
let totalViewsAssigned = 0;

const canvases = [];

for (let i = 0; i < TARGET_CANVASES; i++) {
  const canvasData = generateCanvasData();
  const artist = artists[Math.floor(Math.random() * artists.length)];
  
  // Distribute views to reach target total
  let views;
  if (i === TARGET_CANVASES - 1) {
    // Last canvas gets remaining views
    views = TARGET_VIEWS - totalViewsAssigned;
  } else {
    // Random views around average, with some popular pieces
    const isPopular = Math.random() < 0.05; // 5% chance of viral piece
    if (isPopular) {
      views = Math.floor(Math.random() * 500) + 200; // 200-700 views
    } else {
      views = Math.floor(Math.random() * avgViewsPerCanvas * 2) + 1; // 1 to 2x average
    }
  }
  
  totalViewsAssigned += views;
  
  // Generate likes (realistic engagement rate)
  const maxLikes = Math.min(Math.floor(views * 0.3), 100); // Max 30% engagement
  const likeCount = Math.floor(Math.random() * maxLikes);
  const likes = [];
  
  // Assign random likers
  for (let j = 0; j < likeCount; j++) {
    const randomLiker = artists[Math.floor(Math.random() * artists.length)];
    if (!likes.includes(randomLiker._id.toString())) {
      likes.push(randomLiker._id);
    }
  }
  
  const canvas = new Canvas({
    title: canvasData.title,
    description: canvasData.description,
    canvasData: canvasData.canvasData,
    thumbnail: `https://images.unsplash.com/photo-${validThumbnailIds[i % validThumbnailIds.length]}?w=400&h=300&fit=crop`,
    owner: artist._id,
    settings: {
      isPublic: true,
      allowComments: Math.random() > 0.1, // 90% allow comments
      allowCollaboration: Math.random() > 0.3 // 70% allow collaboration
    },
    tags: canvasData.tags,
    views,
    likes,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
    lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)  // Random date within last 30 days
  });
  
  await canvas.save();
  canvases.push(canvas);
  
  if ((i + 1) % 100 === 0) {
    console.log(`✅ Created ${i + 1} canvases...`);
  }
}

// Calculate final statistics
const finalStats = {
  totalCanvases: await Canvas.countDocuments({ 'settings.isPublic': true }),
  totalArtists: await User.countDocuments({ isActive: true }),
  totalViews: await Canvas.aggregate([
    { $match: { 'settings.isPublic': true } },
    { $group: { _id: null, totalViews: { $sum: '$views' } } }
  ]).then(result => result[0]?.totalViews || 0),
  totalLikes: await Canvas.aggregate([
    { $match: { 'settings.isPublic': true } },
    { $group: { _id: null, totalLikes: { $sum: { $size: '$likes' } } } }
  ]).then(result => result[0]?.totalLikes || 0)
};

console.log('\n🎉 Artistic community creation complete!');
console.log('📊 Final Statistics:');
console.log(`   • Total Canvases: ${finalStats.totalCanvases.toLocaleString()} (Target: ${TARGET_CANVASES.toLocaleString()})`);
console.log(`   • Total Artists: ${finalStats.totalArtists.toLocaleString()} (Target: ${TARGET_ARTISTS.toLocaleString()})`);
console.log(`   • Total Views: ${finalStats.totalViews.toLocaleString()} (Target: ${TARGET_VIEWS.toLocaleString()})`);
console.log(`   • Total Likes: ${finalStats.totalLikes.toLocaleString()}`);

// Check if we hit our targets
const canvasMatch = finalStats.totalCanvases === TARGET_CANVASES;
const artistMatch = finalStats.totalArtists >= TARGET_ARTISTS; // May have existing users
const viewsMatch = Math.abs(finalStats.totalViews - TARGET_VIEWS) <= 10; // Allow small variance

console.log('\n🎯 Target Achievement:');
console.log(`   • Canvases: ${canvasMatch ? '✅' : '❌'} ${canvasMatch ? 'Perfect match!' : `Off by ${Math.abs(finalStats.totalCanvases - TARGET_CANVASES)}`}`);
console.log(`   • Artists: ${artistMatch ? '✅' : '❌'} ${artistMatch ? 'Target reached!' : `Need ${TARGET_ARTISTS - finalStats.totalArtists} more`}`);
console.log(`   • Views: ${viewsMatch ? '✅' : '❌'} ${viewsMatch ? 'Perfect match!' : `Off by ${Math.abs(finalStats.totalViews - TARGET_VIEWS)}`}`);

await mongoose.disconnect();
console.log('🔌 Database connection closed');
console.log('\n🚀 Your Canvas Crafters community is ready to explore!');
