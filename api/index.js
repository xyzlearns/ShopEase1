// Vercel serverless function entry point
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-session-id');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Simple test endpoint
  if (req.url === '/api' || req.url === '/api/') {
    return res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
  }

  // Redirect all other API calls to specific endpoints
  if (req.url.startsWith('/api/products')) {
    const { default: productsHandler } = await import('./products.js');
    return productsHandler(req, res);
  }

  if (req.url.startsWith('/api/auth/register')) {
    const { default: registerHandler } = await import('./auth/register.js');
    return registerHandler(req, res);
  }

  return res.status(404).json({ error: 'API endpoint not found' });
}