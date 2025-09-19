import mongoose from 'mongoose';
import User from '../models/User.js';
import Canvas from '../models/Canvas.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });

// Connect to database
const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/canvas-crafters');
    console.log('🔌 Connected to MongoDB');
};

const seedPexelsData = async () => {
    await connectDB();
    console.log('🎨 Starting Canvas Crafters Pexels data generation...');

// Sample users data
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
  }
];

// Pexels canvases with appropriate titles and descriptions
const pexelsCanvases = [
  {
    title: "Mystical Forest Pathway",
    description: "A serene digital painting capturing the enchanting beauty of a forest path at dawn, where sunlight filters through ancient trees creating a magical atmosphere.",
    thumbnail: "https://images.pexels.com/photos/1193743/pexels-photo-1193743.jpeg",
    tags: ['forest', 'nature', 'pathway', 'mystical', 'digital-painting']
  },
  {
    title: "Urban Architecture Symphony",
    description: "Bold geometric interpretation of modern city skylines, exploring the harmony between concrete structures and artistic expression through clean lines and dramatic perspectives.",
    thumbnail: "https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg",
    tags: ['urban', 'architecture', 'geometric', 'modern', 'cityscape']
  },
  {
    title: "Ocean Wave Dynamics",
    description: "Fluid watercolor study of ocean waves in motion, capturing the raw power and graceful movement of water through expressive brushstrokes and vibrant blues.",
    thumbnail: "https://images.pexels.com/photos/1209843/pexels-photo-1209843.jpeg",
    tags: ['ocean', 'waves', 'watercolor', 'fluid', 'marine']
  },
  {
    title: "Mountain Peak Serenity",
    description: "Majestic mountain landscape rendered in soft pastels, conveying the peaceful solitude and towering grandeur of alpine wilderness through delicate color gradients.",
    thumbnail: "https://images.pexels.com/photos/1918290/pexels-photo-1918290.jpeg",
    tags: ['mountain', 'landscape', 'pastel', 'serene', 'alpine']
  },
  {
    title: "Vintage Car Elegance",
    description: "Nostalgic illustration of classic automobiles from the mid-20th century, celebrating the curves, chrome, and character of vintage automotive design.",
    thumbnail: "https://images.pexels.com/photos/1727658/pexels-photo-1727658.jpeg",
    tags: ['vintage', 'automotive', 'classic', 'nostalgic', 'design']
  },
  {
    title: "Floral Botanical Study",
    description: "Detailed scientific illustration of exotic flowers and plants, combining botanical accuracy with artistic interpretation through intricate line work and careful observation.",
    thumbnail: "https://images.pexels.com/photos/959314/pexels-photo-959314.jpeg",
    tags: ['botanical', 'flowers', 'scientific', 'detailed', 'illustration']
  },
  {
    title: "Abstract Geometric Patterns",
    description: "Complex geometric compositions exploring mathematical beauty through intersecting shapes, vibrant colors, and rhythmic patterns that create visual harmony.",
    thumbnail: "https://images.pexels.com/photos/573294/pexels-photo-573294.jpeg",
    tags: ['geometric', 'abstract', 'patterns', 'mathematical', 'rhythmic']
  },
  {
    title: "Street Art Rebellion",
    description: "Bold urban art piece capturing the spirit of street culture through graffiti-inspired designs, vibrant colors, and powerful social commentary.",
    thumbnail: "https://images.pexels.com/photos/1270184/pexels-photo-1270184.jpeg",
    tags: ['street-art', 'graffiti', 'urban', 'rebellion', 'cultural']
  },
  {
    title: "Minimalist Portrait Study",
    description: "Clean, minimalist approach to portraiture focusing on essential features and emotional expression through simple shapes and subtle color variations.",
    thumbnail: "https://images.pexels.com/photos/219552/pexels-photo-219552.jpeg",
    tags: ['portrait', 'minimalist', 'study', 'emotional', 'clean']
  },
  {
    title: "Cosmic Space Exploration",
    description: "Imaginative depiction of space travel and cosmic wonders, blending scientific accuracy with artistic vision of the final frontier.",
    thumbnail: "https://images.pexels.com/photos/417826/pexels-photo-417826.jpeg",
    tags: ['space', 'cosmic', 'exploration', 'scientific', 'imaginative']
  },
  {
    title: "Industrial Machinery",
    description: "Detailed technical drawing of complex machinery and mechanical systems, celebrating the beauty of engineering and industrial design.",
    thumbnail: "https://images.pexels.com/photos/604694/pexels-photo-604694.jpeg",
    tags: ['industrial', 'machinery', 'technical', 'engineering', 'mechanical']
  },
  {
    title: "Wildlife Conservation Art",
    description: "Artistic representation of endangered species and wildlife, raising awareness through beautiful illustrations that combine realism with emotional impact.",
    thumbnail: "https://images.pexels.com/photos/1257860/pexels-photo-1257860.jpeg",
    tags: ['wildlife', 'conservation', 'endangered', 'realism', 'awareness']
  },
  {
    title: "Retro Gaming Nostalgia",
    description: "Pixel-perfect recreation of classic video game aesthetics from the 8-bit and 16-bit eras, celebrating gaming history through digital art.",
    thumbnail: "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg",
    tags: ['retro', 'gaming', 'pixel-art', 'nostalgia', '8-bit']
  },
  {
    title: "Culinary Art Composition",
    description: "Gastronomic masterpiece showcasing the artistic presentation of food, exploring colors, textures, and culinary creativity through visual design.",
    thumbnail: "https://images.pexels.com/photos/1070527/pexels-photo-1070527.jpeg",
    tags: ['culinary', 'food', 'gastronomic', 'composition', 'creative']
  },
  {
    title: "Fashion Design Sketch",
    description: "Elegant fashion illustration featuring contemporary clothing designs, exploring fabric textures, silhouettes, and modern style trends.",
    thumbnail: "https://images.pexels.com/photos/604672/pexels-photo-604672.jpeg",
    tags: ['fashion', 'design', 'sketch', 'elegant', 'contemporary']
  },
  {
    title: "Underwater Paradise",
    description: "Vivid depiction of coral reefs and marine life, showcasing the colorful biodiversity of underwater ecosystems through artistic interpretation.",
    thumbnail: "https://images.pexels.com/photos/3695801/pexels-photo-3695801.jpeg",
    tags: ['underwater', 'marine', 'coral', 'biodiversity', 'ecosystem']
  },
  {
    title: "Medieval Fantasy Castle",
    description: "Imaginative castle design inspired by medieval architecture, featuring towers, battlements, and fantastical elements in a fairy-tale setting.",
    thumbnail: "https://images.pexels.com/photos/1707640/pexels-photo-1707640.jpeg",
    tags: ['medieval', 'fantasy', 'castle', 'architecture', 'fairy-tale']
  },
  {
    title: "Typography Masterpiece",
    description: "Creative exploration of letterforms and typographic design, where text becomes art through innovative layouts and visual hierarchy.",
    thumbnail: "https://images.pexels.com/photos/360912/pexels-photo-360912.jpeg",
    tags: ['typography', 'letterforms', 'design', 'creative', 'layout']
  },
  {
    title: "Anime Character Portrait",
    description: "Detailed anime-style character illustration featuring expressive features, dynamic hair, and characteristic Japanese animation aesthetics.",
    thumbnail: "https://images.pexels.com/photos/1545505/pexels-photo-1545505.jpeg",
    tags: ['anime', 'character', 'portrait', 'expressive', 'japanese']
  },
  {
    title: "Data Visualization Art",
    description: "Beautiful representation of complex data through artistic visualization, transforming statistics into compelling visual narratives.",
    thumbnail: "https://images.pexels.com/photos/2510245/pexels-photo-2510245.jpeg",
    tags: ['data', 'visualization', 'statistics', 'narrative', 'compelling']
  },
  {
    title: "Comic Book Panel",
    description: "Dynamic comic book illustration featuring action, dialogue, and sequential storytelling through carefully composed visual frames.",
    thumbnail: "https://images.pexels.com/photos/813871/pexels-photo-813871.jpeg",
    tags: ['comic', 'illustration', 'action', 'storytelling', 'sequential']
  },
  {
    title: "Surreal Dream Landscape",
    description: "Imaginative surrealist composition blending reality with dreams, featuring impossible geometries and subconscious symbolism.",
    thumbnail: "https://images.pexels.com/photos/96939/pexels-photo-96939.jpeg",
    tags: ['surreal', 'dream', 'landscape', 'imaginative', 'symbolism']
  },
  {
    title: "Cyberpunk Cityscape",
    description: "Futuristic urban environment with neon lights, flying vehicles, and high-tech architecture creating a dystopian yet beautiful metropolis.",
    thumbnail: "https://images.pexels.com/photos/33050960/pexels-photo-33050960.jpeg",
    tags: ['cyberpunk', 'futuristic', 'neon', 'dystopian', 'metropolis']
  }
];

// Additional generated canvases
const additionalCanvases = [
  {
    title: "Abstract Color Explosion",
    description: "Vibrant explosion of colors and shapes creating a dynamic abstract composition that explores the relationship between chaos and harmony.",
    thumbnail: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
    tags: ['abstract', 'color', 'explosion', 'dynamic', 'chaos']
  },
  {
    title: "Zen Garden Meditation",
    description: "Peaceful zen garden design featuring raked sand patterns, carefully placed stones, and minimalist composition promoting mindfulness.",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-6536a4f9d5a6?w=400&h=300&fit=crop",
    tags: ['zen', 'garden', 'meditation', 'minimalist', 'mindfulness']
  },
  {
    title: "Digital Portrait Study",
    description: "Contemporary digital portrait exploring human emotion and character through detailed facial features and expressive lighting techniques.",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    tags: ['digital', 'portrait', 'emotion', 'character', 'lighting']
  },
  {
    title: "Geometric Architecture",
    description: "Bold architectural study using geometric shapes and clean lines to explore modern building design and structural aesthetics.",
    thumbnail: "https://images.unsplash.com/photo-1487956382158-bb92665bc37c?w=400&h=300&fit=crop",
    tags: ['geometric', 'architecture', 'modern', 'structural', 'aesthetics']
  },
  {
    title: "Nature's Golden Hour",
    description: "Beautiful landscape painting capturing the magical golden hour light as it transforms ordinary scenes into extraordinary works of art.",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    tags: ['nature', 'golden-hour', 'landscape', 'magical', 'extraordinary']
  },
  {
    title: "Steampunk Invention",
    description: "Intricate steampunk design featuring gears, steam engines, and Victorian-era technology reimagined through artistic illustration.",
    thumbnail: "https://images.unsplash.com/photo-1586023492125-27ef35c6c42d?w=400&h=300&fit=crop",
    tags: ['steampunk', 'invention', 'gears', 'victorian', 'technology']
  },
  {
    title: "Watercolor Dreamscape",
    description: "Soft watercolor painting evoking dreamy, ethereal scenes with flowing colors and gentle transitions between reality and imagination.",
    thumbnail: "https://images.unsplash.com/photo-1549490349-8643362d4605?w=400&h=300&fit=crop",
    tags: ['watercolor', 'dreamscape', 'ethereal', 'flowing', 'imagination']
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

// Create Pexels canvases
console.log('🎨 Creating Pexels canvases...');
const allCanvases = [...pexelsCanvases, ...additionalCanvases];

for (let i = 0; i < allCanvases.length; i++) {
  const canvasData = allCanvases[i];
  const randomUser = createdUsers[i % createdUsers.length];

  // Generate realistic statistics
  const views = Math.floor(Math.random() * 2000) + 50;
  const likeCount = Math.floor(Math.random() * Math.min(views * 0.3, 500));
  const likes = [];

  for (let j = 0; j < likeCount; j++) {
    const randomLiker = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    if (!likes.includes(randomLiker._id.toString())) {
      likes.push(randomLiker._id);
    }
  }

  const canvas = new Canvas({
    title: canvasData.title,
    description: canvasData.description,
    canvasData: JSON.stringify({
      version: "1.0",
      objects: [
        { type: "rect", x: Math.random() * 300, y: Math.random() * 200, width: 50 + Math.random() * 100, height: 50 + Math.random() * 100, fill: `hsl(${Math.random() * 360}, 70%, 60%)` },
        { type: "circle", x: Math.random() * 400, y: Math.random() * 300, radius: 20 + Math.random() * 50, fill: `hsl(${Math.random() * 360}, 80%, 70%)` }
      ]
    }),
    thumbnail: canvasData.thumbnail,
    owner: randomUser._id,
    settings: {
      isPublic: true,
      allowComments: Math.random() > 0.3,
      allowCollaboration: Math.random() > 0.5
    },
    tags: canvasData.tags,
    views: views,
    likes: likes,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    lastModified: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
  });

  await canvas.save();
  console.log(`✅ Created canvas: "${canvas.title}" by ${randomUser.username} (${views} views, ${likes.length} likes)`);
}

// Calculate and display final statistics
const totalCanvases = await Canvas.countDocuments();
const totalUsers = await Canvas.distinct('owner').length;
const totalViews = await Canvas.aggregate([
  { $group: { _id: null, totalViews: { $sum: "$views" } } }
]);
const totalLikes = await Canvas.aggregate([
  { $group: { _id: null, totalLikes: { $sum: { $size: "$likes" } } } }
]);

console.log('\n🎉 Pexels data generation complete!');
console.log('📊 Final Statistics:');
console.log(`   • Total Canvases: ${totalCanvases.toLocaleString()}`);
console.log(`   • Total Artists: ${totalUsers.toLocaleString()}`);
console.log(`   • Total Views: ${totalViews[0]?.totalViews?.toLocaleString() || 0}`);
console.log(`   • Total Likes: ${totalLikes[0]?.totalLikes?.toLocaleString() || 0}`);

await mongoose.disconnect();
console.log('🔌 Database connection closed');
};

// Run the seeding function
seedPexelsData().catch(console.error);