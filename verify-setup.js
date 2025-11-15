#!/usr/bin/env node

/**
 * Setup Verification Script
 * Run this to verify your environment is configured correctly
 * before running the full pipeline
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from 'openai';
import Replicate from 'replicate';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the src directory
dotenv.config({ path: join(__dirname, '.env') });

console.log('\n🔍 Verifying Funny Ad Video Generator Setup...\n');

let hasErrors = false;

// Check Node version
console.log('📦 Node.js Version:');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion >= 18) {
  console.log(`   ✓ ${nodeVersion} (>= 18.0.0 required)`);
} else {
  console.log(`   ✗ ${nodeVersion} (>= 18.0.0 required)`);
  hasErrors = true;
}

// Check environment variables
console.log('\n🔑 Environment Variables:');
const requiredEnvVars = ['OPENAI_API_KEY', 'REPLICATE_API_TOKEN'];

for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    const value = process.env[envVar];
    const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4);
    console.log(`   ✓ ${envVar}: ${masked}`);
  } else {
    console.log(`   ✗ ${envVar}: Not set`);
    hasErrors = true;
  }
}

// Test OpenAI API
console.log('\n🤖 Testing OpenAI API Connection:');
try {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  console.log('   → Sending test request...');
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: "Say 'Hello from OpenAI!'" }],
    max_tokens: 20
  });
  
  const response = completion.choices[0].message.content;
  console.log(`   ✓ OpenAI API working: "${response}"`);
} catch (error) {
  console.log(`   ✗ OpenAI API error: ${error.message}`);
  hasErrors = true;
}

// Test Replicate API
console.log('\n🎨 Testing Replicate API Connection:');
try {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
  });
  
  console.log('   → Checking account...');
  // Just test if we can create a client - actual model test would cost money
  console.log('   ✓ Replicate API client initialized');
  console.log('   ℹ Full test requires running actual predictions (costs credits)');
} catch (error) {
  console.log(`   ✗ Replicate API error: ${error.message}`);
  hasErrors = true;
}

// Check directories
console.log('\n📁 Checking Directories:');
const dirs = ['ai', 'utils'];
import fs from 'fs/promises';

for (const dir of dirs) {
  try {
    await fs.access(dir);
    console.log(`   ✓ ${dir}/ exists`);
  } catch {
    console.log(`   ✗ ${dir}/ not found`);
    hasErrors = true;
  }
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Setup verification failed');
  console.log('\nPlease fix the errors above before running the generator.');
  console.log('See QUICKSTART.md for setup instructions.\n');
  process.exit(1);
} else {
  console.log('✅ All checks passed!');
  console.log('\nYour environment is ready to generate funny ads!');
  console.log('Run: node index.js\n');
  process.exit(0);
}

