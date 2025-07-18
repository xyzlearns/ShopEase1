// Simple build script for Vercel
import { execSync } from 'child_process';

console.log('Building for Vercel...');

// Build frontend
execSync('npm run build', { stdio: 'inherit' });

console.log('Build complete!');