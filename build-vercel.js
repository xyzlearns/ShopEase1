#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Vercel build process...');

// Build frontend
console.log('📦 Building frontend...');
execSync('cd frontend && npm install && npm run build', { stdio: 'inherit' });

// Build backend
console.log('🔧 Building backend...');
execSync('cd backend && npm install', { stdio: 'inherit' });

// Create api directory structure for Vercel serverless functions
const apiDir = path.join(__dirname, 'api');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

// Create catch-all serverless function
const catchAllFunction = `
import path from 'path';
import { fileURLToPath } from 'url';

// Set up ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set working directory to project root
process.chdir(path.resolve(__dirname, '..'));

// Import and start the server
const { default: app } = await import('../backend/src/index.js');

export default app;
`;

fs.writeFileSync(path.join(apiDir, '[...all].js'), catchAllFunction);

console.log('✅ Vercel build completed!');