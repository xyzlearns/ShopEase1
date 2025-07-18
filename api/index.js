// Vercel serverless function entry point
export default async function handler(req, res) {
  try {
    const serverModule = await import('../dist/index.js');
    return serverModule.default(req, res);
  } catch (err) {
    console.error('Error loading server:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}