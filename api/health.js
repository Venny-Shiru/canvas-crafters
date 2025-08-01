export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({ 
      status: 'OK', 
      message: 'Canvas Crafters API is running',
      timestamp: new Date().toISOString(),
      service: 'vercel-serverless'
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
