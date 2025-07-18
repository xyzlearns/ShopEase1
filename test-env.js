#!/usr/bin/env node

// Test script to check environment variables
console.log('🔍 Environment Variables Test:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Process has secrets access:', typeof process.env !== 'undefined');

const googleVars = [
  'GOOGLE_CLIENT_EMAIL',
  'GOOGLE_PRIVATE_KEY', 
  'GOOGLE_SHEET_ID',
  'GOOGLE_DRIVE_FOLDER_ID'
];

googleVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 30)}...`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

// Check all environment variables that might contain "google"
console.log('\n🔍 All environment variables containing "google" or "GOOGLE":');
Object.keys(process.env)
  .filter(key => key.toLowerCase().includes('google'))
  .forEach(key => {
    const value = process.env[key];
    console.log(`${key}: ${value ? value.substring(0, 50) + '...' : 'NOT SET'}`);
  });

console.log('\n🔍 Total environment variables:', Object.keys(process.env).length);