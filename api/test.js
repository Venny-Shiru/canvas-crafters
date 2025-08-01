export default function handler(req, res) {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Simple API test',
    timestamp: new Date().toISOString()
  });
}
