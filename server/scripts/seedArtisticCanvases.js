import mongoose from 'mongoose';
import User from '../models/User.js';
import Canvas from '../models/Canvas.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Connect to database
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canvas-crafters');

console.log('🎨 Starting Canvas Crafters sample data generation...');

// Sample users data - diverse artist profiles
const sampleUsers = [
  {
    username: 'ArtisticSoul',
    email: 'artistic.soul@example.com',
    password: 'Password123!',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b642?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    username: 'DigitalDreamer',
    email: 'digital.dreamer@example.com', 
    password: 'Password123!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    username: 'ColorMaster',
    email: 'color.master@example.com',
    password: 'Password123!',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    username: 'AbstractVision',
    email: 'abstract.vision@example.com',
    password: 'Password123!',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    username: 'NeonNinja',
    email: 'neon.ninja@example.com',
    password: 'Password123!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    username: 'PixelArtist',
    email: 'pixel.artist@example.com',
    password: 'Password123!',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    username: 'VectorVibe',
    email: 'vector.vibe@example.com',
    password: 'Password123!',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    username: 'SurrealScape',
    email: 'surreal.scape@example.com',
    password: 'Password123!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    username: 'MinimalMuse',
    email: 'minimal.muse@example.com',
    password: 'Password123!',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    username: 'CyberAesthetic',
    email: 'cyber.aesthetic@example.com',
    password: 'Password123!',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
    isActive: true
  }
];

// Valid Unsplash photo IDs for thumbnails
const validThumbnailIds = [
  '1578662996293-221367c2bb3e', '1541961017774-22349e4a1262', '1567095761381-15484e11dd67',
  '1518709268805-4e9042af2176', '1544966503-7cc5ac882d5f', '1549490349-8643362d4605',
  '1502134249126-9f3755a50d78', '1511512578047-dfb367046420', '1441974231531-c6227db76b6e',
  '1611224923853-80b023f02d71', '1507003211169-0a1dd7228f2d', '1482442120256-9c03866de4db',
  '1561037404-61cd46aa615b', '1547891654-e66ed7ebb968', '1506905925346-21bda4d32df4',
  '1551033406-611cf9a28251', '1582555172866-65734ff2db35'
];

// Diverse and artistic canvas data
const sampleCanvases = [
  {
    title: "Neon Dreams in Cyberpunk City",
    description: "A vibrant exploration of neon-lit streets and futuristic architecture, blending digital art with cyberpunk aesthetics.",
    tags: ['cyberpunk', 'neon', 'digital-art', 'futuristic', 'cityscape'],
    thumbnail: `https://images.unsplash.com/photo-${validThumbnailIds[0]}?w=400&h=300&fit=crop`,
    canvasData: JSON.stringify({
      version: "1.0",
      objects: [
        { type: "rect", x: 50, y: 50, width: 200, height: 100, fill: "#00ffff" },
        { type: "circle", x: 300, y: 150, radius: 75, fill: "#ff00ff" }
      ]
    }),
    settings: { isPublic: true, allowComments: true, allowCollaboration: true }
  },
  {
    title: "Abstract Emotional Landscape",
    description: "An abstract representation of human emotions through flowing colors and organic shapes.",
    tags: ['abstract', 'emotional', 'color-theory', 'expressive', 'modern-art'],
    thumbnail: `https://images.unsplash.com/photo-${validThumbnailIds[1]}?w=400&h=300&fit=crop`,
    canvasData: JSON.stringify({
      version: "1.0",
      objects: [
        { type: "path", d: "M50,150 Q200,50 350,150 T650,150", stroke: "#ff6b6b", strokeWidth: 8 },
        { type: "ellipse", cx: 200, cy: 100, rx: 80, ry: 40, fill: "#4ecdc4" }
      ]
    }),
    settings: { isPublic: true, allowComments: true, allowCollaboration: false }
  },
  {
    title: "Minimalist Zen Garden",
    description: "A peaceful composition inspired by Japanese zen gardens, focusing on balance and negative space.",
    tags: ['minimalism', 'zen', 'peaceful', 'japanese', 'balance'],
    thumbnail: `https://images.unsplash.com/photo-${validThumbnailIds[2]}?w=400&h=300&fit=crop`,
    canvasData: JSON.stringify({
      version: "1.0",
      objects: [
        { type: "circle", x: 150, y: 200, radius: 30, fill: "#8b7355" },
        { type: "rect", x: 100, y: 100, width: 300, height: 5, fill: "#d4d4d4" }
      ]
    }),
    settings: { isPublic: true, allowComments: true, allowCollaboration: true }
  },
  {
    title: "Retro Synthwave Sunset",
    description: "A nostalgic 80s-inspired artwork featuring geometric patterns and vibrant gradients.",
    tags: ['synthwave', 'retro', '80s', 'gradient', 'geometric'],
    thumbnail: `https://images.unsplash.com/photo-${validThumbnailIds[3]}?w=400&h=300&fit=crop`,
    canvasData: JSON.stringify({
      version: "1.0",
      objects: [
        { type: "polygon", points: "150,100 200,50 250,100 225,150 175,150", fill: "#ff00aa" },
        { type: "line", x1: 0, y1: 150, x2: 400, y2: 150, stroke: "#00ff88", strokeWidth: 3 }
      ]
    }),
    settings: { isPublic: true, allowComments: true, allowCollaboration: false }
  },
  {
    title: "Nature's Fibonacci Spiral",
    description: "Mathematical beauty found in nature, visualizing the golden ratio through organic forms.",
    tags: ['nature', 'mathematics', 'fibonacci', 'golden-ratio', 'organic'],
    thumbnail: `https://images.unsplash.com/photo-${validThumbnailIds[4]}?w=400&h=300&fit=crop`,
    canvasData: JSON.stringify({
      version: "1.0",
      objects: [
        { type: "path", d: "M100,100 Q150,50 200,100 Q250,150 200,200", stroke: "#228b22", strokeWidth: 4, fill: "none" },
        { type: "circle", x: 150, y: 125, radius: 20, fill: "#ffd700" }
      ]
    }),
    settings: { isPublic: true, allowComments: true, allowCollaboration: true }
  },
  {
    title: "Urban Street Art Mural",
    description: "Bold street art inspired design with graffiti elements and urban culture references.",
    tags: ['street-art', 'graffiti', 'urban', 'bold', 'culture'],
    thumbnail: `https://images.unsplash.com/photo-${validThumbnailIds[5]}?w=400&h=300&fit=crop`,
    canvasData: JSON.stringify({
      version: "1.0",
      objects: [
        { type: "text", x: 100, y: 150, text: "UNITY", fontSize: 48, fontFamily: "Arial Black", fill: "#ff4444" },
        { type: "rect", x: 50, y: 50, width: 300, height: 200, fill: "none", stroke: "#000", strokeWidth: 8 }
      ]
    }),
    settings: { isPublic: true, allowComments: true, allowCollaboration: true }
  },
  {
    title: "Cosmic Mandala Meditation",
    description: "Intricate mandala design inspired by cosmic patterns and spiritual geometry.",
    tags: ['mandala', 'spiritual', 'cosmic', 'meditation', 'sacred-geometry'],
    thumbnail: `https://images.unsplash.com/photo-${validThumbnailIds[6]}?w=400&h=300&fit=crop`,
    canvasData: JSON.stringify({
      version: "1.0",
      objects: [
        { type: "circle", x: 200, y: 150, radius: 100, fill: "none", stroke: "#8a2be2", strokeWidth: 2 },
        { type: "circle", x: 200, y: 150, radius: 50, fill: "#fff", stroke: "#8a2be2", strokeWidth: 1 }
      ]
    }),
    settings: { isPublic: true, allowComments: true, allowCollaboration: false }
  },
  {
    title: "Pixel Art Character Design",
    description: "Nostalgic 8-bit style character design reminiscent of classic video games.",
    tags: ['pixel-art', '8-bit', 'character-design', 'gaming', 'nostalgic'],
    thumbnail: `https://images.unsplash.com/photo-${validThumbnailIds[7]}?w=400&h=300&fit=crop`,
    canvasData: JSON.stringify({
      version: "1.0",
      objects: [
        { type: "rect", x: 180, y: 100, width: 40, height: 40, fill: "#ffcccb" },
        { type: "rect", x: 190, y: 110, width: 8, height: 8, fill: "#000" },
        { type: "rect", x: 202, y: 110, width: 8, height: 8, fill: "#000" }
      ]
    }),
    settings: { isPublic: true, allowComments: true, allowCollaboration: true }
  },
  {
    title: "Watercolor Forest Dreams",
    description: "Soft watercolor techniques creating a dreamy forest landscape with ethereal lighting.",
    tags: ['watercolor', 'forest', 'dreamy', 'nature', 'soft'],
    thumbnail: `https://images.unsplash.com/photo-${validThumbnailIds[8]}?w=400&h=300&fit=crop`,
    canvasData: JSON.stringify({
      version: "1.0",
      objects: [
        { type: "ellipse", cx: 200, cy: 250, rx: 150, ry: 80, fill: "#90ee90", opacity: 0.6 },
        { type: "rect", x: 190, y: 100, width: 20, height: 150, fill: "#8b4513" }
      ]
    }),
    settings: { isPublic: true, allowComments: true, allowCollaboration: false }
  },
  {
    title: "Typography Art Experiment",
    description: "Creative exploration of letterforms and typography as artistic expression.",
    tags: ['typography', 'letters', 'creative', 'experimental', 'design'],
    thumbnail: `https://images.unsplash.com/photo-${validThumbnailIds[9]}?w=400&h=300&fit=crop`,
    canvasData: JSON.stringify({
      version: "1.0",
      objects: [
        { type: "text", x: 100, y: 150, text: "CREATE", fontSize: 36, fontFamily: "Helvetica", fill: "#333", transform: "rotate(15deg)" },
        { type: "text", x: 120, y: 200, text: "INSPIRE", fontSize: 24, fontFamily: "Arial", fill: "#666" }
      ]
    }),
    settings: { isPublic: true, allowComments: true, allowCollaboration: true }
  },
  {
    title: "Digital Portrait Study",
    description: "Modern digital painting techniques applied to contemporary portrait art.",
    tags: ['portrait', 'digital-painting', 'study', 'contemporary', 'artistic'],
    thumbnail: `https://images.unsplash.com/photo-${validThumbnailIds[10]}?w=400&h=300&fit=crop`,
    canvasData: JSON.stringify({
      version: "1.0",
      objects: [
        { type: "ellipse", cx: 200, cy: 150, rx: 60, ry: 80, fill: "#ffdbac" },
        { type: "circle", x: 180, y: 130, radius: 8, fill: "#333" },
        { type: "circle", x: 220, y: 130, radius: 8, fill: "#333" }
      ]
    }),
    settings: { isPublic: true, allowComments: true, allowCollaboration: false }
  },
  {
    title: "Geometric Abstract Composition",
    description: "Bold geometric shapes creating dynamic visual tension and color harmony.",
    tags: ['geometric', 'abstract', 'composition', 'bold', 'dynamic'],
    thumbnail: `https://images.unsplash.com/photo-${validThumbnailIds[11]}?w=400&h=300&fit=crop`,
    canvasData: JSON.stringify({
      version: "1.0",
      objects: [
        { type: "polygon", points: "100,50 200,50 150,150", fill: "#ff6b6b" },
        { type: "rect", x: 220, y: 100, width: 80, height: 80, fill: "#4ecdc4" },
        { type: "circle", x: 350, y: 200, radius: 40, fill: "#ffe66d" }
      ]
    }),
    settings: { isPublic: true, allowComments: true, allowCollaboration: true }
  },
  {
    title: "Anime Character Sketch",
    description: "Stylized anime character design with expressive features and dynamic pose.",
    tags: ['anime', 'character', 'sketch', 'stylized', 'expressive'],
    thumbnail: `https://images.unsplash.com/photo-${validThumbnailIds[12]}?w=400&h=300&fit=crop`,
    canvasData: JSON.stringify({
      version: "1.0",
      objects: [
        { type: "ellipse", cx: 200, cy: 120, rx: 40, ry: 50, fill: "#ffcccb" },
        { type: "ellipse", cx: 185, cy: 110, rx: 12, ry: 15, fill: "#000" },
        { type: "ellipse", cx: 215, cy: 110, rx: 12, ry: 15, fill: "#000" }
      ]
    }),
    settings: { isPublic: true, allowComments: true, allowCollaboration: false }
  },
  {
    title: "Surreal Dreamscape",
    description: "A surreal composition blending reality with dreams, featuring impossible geometries.",
    tags: ['surreal', 'dreamscape', 'impossible', 'imagination', 'artistic'],
    thumbnail: `https://images.unsplash.com/photo-${validThumbnailIds[13]}?w=400&h=300&fit=crop`,
    canvasData: JSON.stringify({
      version: "1.0",
      objects: [
        { type: "path", d: "M50,200 Q200,50 350,200 Q200,350 50,200", fill: "#dda0dd", opacity: 0.7 },
        { type: "circle", x: 200, y: 150, radius: 30, fill: "#ff69b4" }
      ]
    }),
    settings: { isPublic: true, allowComments: true, allowCollaboration: true }
  },
  {
    title: "Industrial Design Concept",
    description: "Clean industrial design concepts with focus on functionality and modern aesthetics.",
    tags: ['industrial', 'design', 'concept', 'modern', 'functional'],
    thumbnail: `https://images.unsplash.com/photo-${validThumbnailIds[14]}?w=400&h=300&fit=crop`,
    canvasData: JSON.stringify({
      version: "1.0",
      objects: [
        { type: "rect", x: 100, y: 100, width: 200, height: 100, fill: "#708090", stroke: "#2f4f4f", strokeWidth: 2 },
        { type: "circle", x: 150, y: 150, radius: 20, fill: "#ff4500" }
      ]
    }),
    settings: { isPublic: true, allowComments: true, allowCollaboration: false }
  }
];

// Clear existing data
console.log('🗑️ Clearing existing sample data...');
await User.deleteMany({ email: { $in: sampleUsers.map(u => u.email) } });
await Canvas.deleteMany({});

// Create users
console.log('👥 Creating sample users...');
const createdUsers = [];
for (const userData of sampleUsers) {
  const hashedPassword = await bcrypt.hash(userData.password, 12);
  const user = new User({
    ...userData,
    password: hashedPassword
  });
  await user.save();
  createdUsers.push(user);
  console.log(`✅ Created user: ${user.username}`);
}

// Create canvases with realistic statistics
console.log('🎨 Creating sample canvases...');
const createdCanvases = [];

for (let i = 0; i < sampleCanvases.length; i++) {
  const canvasData = sampleCanvases[i];
  const randomUser = createdUsers[i % createdUsers.length];
  
  // Generate realistic statistics
  const views = Math.floor(Math.random() * 2000) + 50; // 50-2050 views
  const likeCount = Math.floor(Math.random() * Math.min(views * 0.3, 500)); // Up to 30% of views or max 500
  const likes = [];
  
  // Randomly assign likes from different users
  for (let j = 0; j < likeCount; j++) {
    const randomLiker = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    if (!likes.includes(randomLiker._id.toString())) {
      likes.push(randomLiker._id);
    }
  }
  
  const canvas = new Canvas({
    title: canvasData.title,
    description: canvasData.description,
    canvasData: canvasData.canvasData,
    thumbnail: canvasData.thumbnail,
    owner: randomUser._id,
    settings: canvasData.settings,
    tags: canvasData.tags,
    views: views,
    likes: likes,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
    lastModified: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)  // Random date within last 7 days
  });
  
  await canvas.save();
  createdCanvases.push(canvas);
  console.log(`✅ Created canvas: "${canvas.title}" by ${randomUser.username} (${views} views, ${likes.length} likes)`);
}

// Create additional canvases for more realistic data
console.log('🎨 Creating additional diverse canvases...');
const additionalCanvases = [
  "Space Exploration Poster", "Vintage Logo Design", "Modern Architecture Study", 
  "Fantasy Creature Concept", "Scientific Illustration", "Abstract Data Visualization",
  "Hand Lettering Practice", "Digital Landscape Painting", "Character Sheet Design",
  "Product Design Mockup", "Botanical Illustration", "Comic Book Panel",
  "UI Interface Design", "Experimental Typography", "Photo Manipulation Art"
];

const additionalTags = [
  ['space', 'poster', 'exploration', 'science'],
  ['vintage', 'logo', 'branding', 'retro'],
  ['architecture', 'modern', 'building', 'structure'],
  ['fantasy', 'creature', 'concept-art', 'imagination'],
  ['scientific', 'illustration', 'educational', 'diagram'],
  ['data', 'visualization', 'abstract', 'information'],
  ['lettering', 'typography', 'handmade', 'calligraphy'],
  ['landscape', 'digital-painting', 'environment', 'scenic'],
  ['character', 'sheet', 'design', 'reference'],
  ['product', 'design', 'mockup', 'industrial'],
  ['botanical', 'nature', 'plants', 'scientific'],
  ['comic', 'sequential-art', 'storytelling', 'illustration'],
  ['ui', 'interface', 'web-design', 'user-experience'],
  ['experimental', 'typography', 'creative', 'innovative'],
  ['photo', 'manipulation', 'digital-art', 'surreal']
];

// Valid Unsplash photo IDs for diverse artistic content
const validUnsplashIds = validThumbnailIds;

for (let i = 0; i < additionalCanvases.length; i++) {
  const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
  const views = Math.floor(Math.random() * 1500) + 25;
  const likeCount = Math.floor(Math.random() * Math.min(views * 0.25, 300));
  const likes = [];
  
  for (let j = 0; j < likeCount; j++) {
    const randomLiker = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    if (!likes.includes(randomLiker._id.toString())) {
      likes.push(randomLiker._id);
    }
  }
  
  // Use valid Unsplash photo ID from our array
  const photoId = validUnsplashIds[i % validUnsplashIds.length];
  
  const canvas = new Canvas({
    title: additionalCanvases[i],
    description: `Creative exploration of ${additionalCanvases[i].toLowerCase()}, showcasing artistic techniques and innovative design approaches.`,
    canvasData: JSON.stringify({
      version: "1.0",
      objects: [
        { type: "rect", x: Math.random() * 300, y: Math.random() * 200, width: 50 + Math.random() * 100, height: 50 + Math.random() * 100, fill: `hsl(${Math.random() * 360}, 70%, 60%)` },
        { type: "circle", x: Math.random() * 400, y: Math.random() * 300, radius: 20 + Math.random() * 50, fill: `hsl(${Math.random() * 360}, 80%, 70%)` }
      ]
    }),
    thumbnail: `https://images.unsplash.com/photo-${photoId}?w=400&h=300&fit=crop`,
    owner: randomUser._id,
    settings: { 
      isPublic: true, 
      allowComments: Math.random() > 0.3, 
      allowCollaboration: Math.random() > 0.5 
    },
    tags: additionalTags[i] || ['art', 'creative', 'design'],
    views: views,
    likes: likes,
    createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000)
  });
  
  await canvas.save();
  console.log(`✅ Created additional canvas: "${canvas.title}" by ${randomUser.username} (${views} views, ${likes.length} likes)`);
}

// Calculate and display final statistics
const totalCanvases = await Canvas.countDocuments();
const totalUsers = await User.countDocuments();
const totalViews = await Canvas.aggregate([
  { $group: { _id: null, totalViews: { $sum: "$views" } } }
]);
const totalLikes = await Canvas.aggregate([
  { $group: { _id: null, totalLikes: { $sum: { $size: "$likes" } } } }
]);

console.log('\n🎉 Sample data generation complete!');
console.log('📊 Final Statistics:');
console.log(`   • Total Canvases: ${totalCanvases.toLocaleString()}`);
console.log(`   • Total Artists: ${totalUsers.toLocaleString()}`);
console.log(`   • Total Views: ${totalViews[0]?.totalViews?.toLocaleString() || 0}`);
console.log(`   • Total Likes: ${totalLikes[0]?.totalLikes?.toLocaleString() || 0}`);

// Update the explore page stats to match real data
console.log('\n📈 Statistics for Explore page:');
console.log(`   totalCanvases: ${totalCanvases}`);
console.log(`   totalArtists: ${totalUsers}`);
console.log(`   totalViews: ${totalViews[0]?.totalViews || 0}`);

await mongoose.disconnect();
console.log('🔌 Database connection closed');
